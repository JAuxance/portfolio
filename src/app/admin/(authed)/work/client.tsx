'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import { PageShell } from '@/components/admin/page-shell';
import { Button, Input } from '@/components/admin/ui';
import { ProjectRow } from '@/components/admin/project-row';
import { ProjectEditPanel } from '@/components/admin/project-edit-panel';
import { createProject, reorderProjects } from '@/actions/projects';
import { cn } from '@/lib/cn';

type Filter = 'ALL' | ProjectStatus;

interface WorkListClientProps {
  initialProjects: Project[];
}

const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'All',
  BUILDING: 'Building',
  SHIPPED: 'Shipped',
  LEARNING: 'Learning',
  STUDYING: 'Studying',
  ESSAY: 'Essay',
};

export function WorkListClient({ initialProjects }: WorkListClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: projects.length, BUILDING: 0, SHIPPED: 0, LEARNING: 0, STUDYING: 0, ESSAY: 0 };
    projects.forEach((p) => { c[p.status]++; });
    return c;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== 'ALL' && p.status !== filter) return false;
      if (q && !p.nameEn.toLowerCase().includes(q) && !p.taglineEn.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projects, filter, search]);

  const selected = selectedId ? projects.find((p) => p.id === selectedId) ?? null : null;

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const dragIdx = projects.findIndex((p) => p.id === dragId);
    const targetIdx = projects.findIndex((p) => p.id === targetId);
    if (dragIdx < 0 || targetIdx < 0) return;
    const next = [...projects];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setProjects(next);
    setDragId(null);
    startTransition(async () => {
      await reorderProjects(next.map((p) => p.id));
    });
  }

  async function handleCreate() {
    startTransition(async () => {
      const res = await createProject({
        slug: `untitled-${Date.now()}`,
        nameEn: 'Untitled project',
        nameFr: 'Projet sans titre',
        taglineEn: 'A short tagline.',
        taglineFr: 'Une courte description.',
        status: ProjectStatus.BUILDING,
        stack: [],
        published: false,
      });
      if (res.ok) {
        setProjects((prev) => [...prev, res.data]);
        setSelectedId(res.data.id);
        router.refresh();
      }
    });
  }

  return (
    <PageShell
      breadcrumb={['Content', 'Work']}
      title="Work"
      subtitle="Projects displayed in the bento grid. Drag to reorder."
      action={
        <Button variant="outline" onClick={handleCreate} disabled={pending}>
          + New project
        </Button>
      }
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-[280px]"
        />
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[12px] transition-colors',
                filter === f
                  ? 'border-white/[0.14] bg-white/[0.08] text-white'
                  : 'border-white/[0.06] bg-white/[0.025] text-[var(--color-text-secondary)] hover:text-white'
              )}
            >
              {FILTER_LABELS[f]} · {counts[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
        <div
          className="mb-3 grid grid-cols-[24px_100px_1fr_260px_110px_60px] gap-4 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span />
          <span>Status</span>
          <span>Project</span>
          <span>Stack</span>
          <span>Last edited</span>
          <span />
        </div>
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] text-[var(--color-text-tertiary)]">
              No projects match.
            </p>
          )}
          {filtered.map((p) => (
            <ProjectRow
              key={p.id}
              project={p}
              selected={selectedId === p.id}
              onSelect={() => setSelectedId(selectedId === p.id ? null : p.id)}
              onDragStart={() => setDragId(p.id)}
              onDragOver={() => {}}
              onDrop={() => handleDrop(p.id)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <div className="mt-6">
          <ProjectEditPanel
            project={selected}
            onClose={() => setSelectedId(null)}
            onDeleted={() => {
              setProjects((prev) => prev.filter((p) => p.id !== selected.id));
              setSelectedId(null);
              router.refresh();
            }}
          />
        </div>
      )}
    </PageShell>
  );
}
