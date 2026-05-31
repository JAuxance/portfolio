'use client';

import type { Project } from '@prisma/client';
import { cn } from '@/lib/cn';
import { StatusPill } from '@/components/public/status-pill';

interface ProjectRowProps {
  project: Project;
  selected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export function ProjectRow({ project, selected, onSelect, onDragStart, onDragOver, onDrop }: ProjectRowProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={onDrop}
      onClick={onSelect}
      className={cn(
        'group grid cursor-pointer grid-cols-[24px_100px_1fr_260px_110px_60px] items-center gap-4 rounded-[10px] border px-4 py-3 transition-colors',
        selected
          ? 'border-white/[0.14] bg-white/[0.04]'
          : 'border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.10]'
      )}
    >
      <DragHandle />
      <StatusPill status={project.status} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-medium text-[var(--color-text-primary)]" style={{ letterSpacing: '-0.015em' }}>
            {project.nameEn}
          </span>
          {project.featured && (
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em] rounded-sm bg-white/[0.06] px-1.5 py-0.5 text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Featured
            </span>
          )}
          {!project.published && (
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em] rounded-sm bg-amber-300/10 px-1.5 py-0.5 text-amber-200/80"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Draft
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-[12px] text-[var(--color-text-secondary)]">{project.taglineEn}</p>
      </div>
      <p
        className="line-clamp-1 font-mono text-[11px] text-[var(--color-text-tertiary)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {project.stack.join(' · ')}
      </p>
      <p
        className="font-mono text-[11px] text-[var(--color-text-tertiary)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {formatDate(project.updatedAt)}
      </p>
      <div className="flex items-center justify-end gap-2 text-[var(--color-text-tertiary)]">
        <span className="opacity-0 group-hover:opacity-100">⋯</span>
        <a
          href={`/en/work/${project.slug}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hover:text-white"
        >
          ↗
        </a>
      </div>
    </div>
  );
}

function DragHandle() {
  return (
    <span aria-hidden className="grid grid-cols-2 gap-[3px] text-[var(--color-text-tertiary)]">
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
      <span className="h-[3px] w-[3px] rounded-full bg-current" />
    </span>
  );
}

function formatDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  const now = new Date();
  const ms = now.getTime() - date.getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
