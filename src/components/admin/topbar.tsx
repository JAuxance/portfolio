'use client';

import { useSaveState } from './save-state-context';
import { Button } from './ui';

interface TopbarProps {
  breadcrumb: string[];
}

export function Topbar({ breadcrumb }: TopbarProps) {
  const { status, lastSaved } = useSaveState();

  const indicator =
    status === 'saving'
      ? 'Saving…'
      : status === 'error'
      ? 'Save failed'
      : lastSaved
      ? `All changes saved · ${formatRelative(lastSaved)}`
      : 'All changes saved';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[var(--color-bg)]/80 px-12 backdrop-blur">
      <nav
        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {breadcrumb.map((part, i) => (
          <span key={i} className={i === breadcrumb.length - 1 ? 'text-[var(--color-text-primary)]' : undefined}>
            {part}
            {i < breadcrumb.length - 1 && <span className="px-2 opacity-50">/</span>}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <span className="text-[12px] text-[var(--color-text-tertiary)]">{indicator}</span>
        <Button variant="primary" size="sm">
          Publish
        </Button>
      </div>
    </header>
  );
}

function formatRelative(d: Date) {
  const secs = Math.round((Date.now() - d.getTime()) / 1000);
  if (secs < 30) return 'just now';
  if (secs < 90) return '1 min ago';
  if (secs < 3600) return `${Math.round(secs / 60)} min ago`;
  return d.toLocaleTimeString();
}
