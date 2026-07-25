'use client';

import { ExternalLink, GripVertical } from 'lucide-react';
import type { Project } from '@prisma/client';
import { StatusPill } from '@/components/public/status-pill';

interface ProjectRowProps {
  project: Project;
  onSelect: () => void;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: () => void;
}

export function ProjectRow({
  project,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
}: ProjectRowProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(event);
      }}
      onDrop={onDrop}
      className="group grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:bg-white/[0.025]"
    >
      <GripVertical size={14} className="text-white/20" />
      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[13px] font-medium text-white/75">
            {project.nameFr}
          </span>
          <StatusPill status={project.status} locale="fr" />
          {project.featured && (
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.13em] text-white/35">
              Sélection
            </span>
          )}
          {!project.published && (
            <span className="rounded-full bg-amber-300/[0.08] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.13em] text-amber-100/45">
              Brouillon
            </span>
          )}
        </span>
        <span className="mt-1.5 block truncate text-[10px] text-white/28">
          {project.taglineFr}
          {project.stack.length > 0 ? ` · ${project.stack.join(' · ')}` : ''}
        </span>
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onSelect}
          className="rounded-lg px-3 py-2 text-[10px] text-white/35 hover:bg-white/[0.05] hover:text-white"
        >
          Modifier
        </button>
        {project.published && (
          <a
            href={`/fr/work/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="grid h-8 w-8 place-items-center rounded-lg text-white/25 hover:bg-white/[0.05] hover:text-white"
            aria-label={`Voir ${project.nameFr} en ligne`}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}
