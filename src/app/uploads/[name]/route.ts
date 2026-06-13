import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR_NAME } from '@/lib/media';

export const runtime = 'nodejs';

/** Server-generated names only: 16 hex chars + whitelisted extension. */
const NAME_RE = /^[a-f0-9]{16}\.(webp|webm|mp4)$/;

const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  webm: 'video/webm',
  mp4: 'video/mp4',
};

/**
 * Streams admin-uploaded media. Uploads live outside public/ because the
 * standalone prod server only serves public/ files that existed at build
 * time. The strict name pattern doubles as path-traversal protection, and
 * Content-Type comes from the extension whitelist — never from the file.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!NAME_RE.test(name)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  try {
    const data = await readFile(path.join(process.cwd(), UPLOADS_DIR_NAME, name));
    const ext = name.split('.').pop() as keyof typeof CONTENT_TYPES;
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': CONTENT_TYPES[ext],
        'Content-Length': String(data.length),
        // Random names are immutable — cache hard.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
