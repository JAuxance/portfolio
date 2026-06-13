import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { auth } from '@/lib/auth';
import { UPLOADS_DIR_NAME } from '@/lib/media';

export const runtime = 'nodejs';

const MAX_BYTES = 50 * 1024 * 1024;

/** Magic-byte sniffs — the multipart Content-Type is client-supplied (and
 * often missing for .webp on some platforms), so we never trust it: the
 * bytes decide the branch. */
function sniffImage(buf: Buffer): boolean {
  if (buf.length < 16) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true; // JPEG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true; // PNG
  if (buf.subarray(0, 4).toString('latin1') === 'GIF8') return true; // GIF
  // WebP (incl. animated): RIFF….WEBP
  if (
    buf.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buf.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return true;
  }
  // AVIF: ISO-BMFF with an avif/avis brand
  if (buf.subarray(4, 8).toString('latin1') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('latin1');
    if (brand === 'avif' || brand === 'avis') return true;
  }
  return false;
}

function sniffVideo(buf: Buffer): 'webm' | 'mp4' | null {
  // WebM/Matroska: EBML header 1A 45 DF A3
  if (buf.length > 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return 'webm';
  }
  // MP4/QuickTime family: "ftyp" at offset 4 — but not the AVIF image brands
  if (buf.length > 12 && buf.subarray(4, 8).toString('latin1') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('latin1');
    if (brand !== 'avif' && brand !== 'avis') return 'mp4';
  }
  return null;
}

/**
 * Admin media upload. Images are re-encoded to WebP via sharp (which also
 * neutralizes malformed payloads; animated GIF/WebP keep their animation);
 * videos must sniff as real WebM/MP4 and are stored as-is — WebP is an image
 * format, transcoding video would need ffmpeg. Files land in uploads/ under
 * a random server-chosen name and are served by /uploads/[name].
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Cheap reject before formData() buffers the whole body in memory.
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: 'file too large (max 50 MB)' }, { status: 413 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'missing file' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file too large (max 50 MB)' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomBytes(8).toString('hex');
  const dir = path.join(process.cwd(), UPLOADS_DIR_NAME);
  await mkdir(dir, { recursive: true });

  try {
    if (sniffImage(buffer)) {
      const out = await sharp(buffer, { animated: true })
        .rotate()
        .resize({ width: 2400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const name = `${id}.webp`;
      await writeFile(path.join(dir, name), out);
      return NextResponse.json({ url: `/uploads/${name}`, kind: 'image' });
    }

    const videoExt = sniffVideo(buffer);
    if (videoExt) {
      const name = `${id}.${videoExt}`;
      await writeFile(path.join(dir, name), buffer);
      return NextResponse.json({ url: `/uploads/${name}`, kind: 'video' });
    }
  } catch {
    return NextResponse.json({ error: 'could not process file' }, { status: 422 });
  }

  return NextResponse.json(
    { error: `unsupported file: ${file.type || 'unknown'} (images, webm, mp4)` },
    { status: 415 }
  );
}
