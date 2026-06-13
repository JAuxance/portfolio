'use client';

import { useRef, useState, type DragEvent } from 'react';
import { cn } from '@/lib/cn';

interface MediaDropProps {
  /** Called with the public URL (/uploads/…) once the file is stored. */
  onUploaded: (url: string, kind: 'image' | 'video') => void;
}

/**
 * Drag & drop (or click) upload zone for the admin. Images come back as
 * WebP, videos (webm/mp4) as-is — see /api/admin/upload.
 */
export function MediaDrop({ onUploaded }: MediaDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = (await res.json()) as { url?: string; kind?: 'image' | 'video'; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? 'upload failed');
      onUploaded(json.url, json.kind ?? 'image');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'upload failed');
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !busy) upload(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !busy && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed transition-colors',
          dragging
            ? 'border-white/40 bg-white/[0.06]'
            : 'border-white/[0.12] bg-white/[0.02] hover:border-white/[0.25] hover:bg-white/[0.04]',
          busy && 'pointer-events-none opacity-60'
        )}
      >
        <span className="text-[13px] text-[var(--color-text-secondary)]">
          {busy ? 'Uploading…' : 'Drop an image or video here, or click to browse'}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          jpg / png / gif / webp (animé ok) → WebP · vidéo → webm / mp4 · max 50 MB
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.webp,.avif,video/webm,video/mp4"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </div>
  );
}
