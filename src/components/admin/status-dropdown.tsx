'use client';

import { useState, useEffect, useRef } from 'react';
import { ProjectStatus } from '@prisma/client';
import { cn } from '@/lib/cn';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  BUILDING: 'Building',
  SHIPPED: 'Shipped',
  LEARNING: 'Learning',
  STUDYING: 'Studying',
  ESSAY: 'Essay',
};

interface StatusDropdownProps {
  value: ProjectStatus;
  onChange: (next: ProjectStatus) => void;
}

export function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isLive = value === 'BUILDING';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 text-[13px] text-[var(--color-text-primary)] transition-colors hover:bg-white/[0.04]"
      >
        <span className="flex items-center gap-2">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isLive
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                : 'bg-[var(--color-text-tertiary)]'
            )}
          />
          {STATUS_LABELS[value]}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-white/[0.10] bg-[var(--color-bg-elevated)] shadow-xl">
          {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-[var(--color-text-secondary)] hover:bg-white/[0.04] hover:text-white',
                  value === s && 'text-white bg-white/[0.04]'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    s === 'BUILDING'
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                      : 'bg-[var(--color-text-tertiary)]'
                  )}
                />
                {STATUS_LABELS[s]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
