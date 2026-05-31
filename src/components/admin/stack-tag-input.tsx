'use client';

import { useState, KeyboardEvent } from 'react';

interface StackTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export function StackTagInput({ value, onChange }: StackTagInputProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2 py-2 transition-colors focus-within:border-white/[0.2]">
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[11px] text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="text-[var(--color-text-tertiary)] hover:text-red-300"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder="+ add"
        className="min-w-[80px] flex-1 bg-transparent px-1 py-1 font-mono text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
        style={{ fontFamily: 'var(--font-mono)' }}
      />
    </div>
  );
}
