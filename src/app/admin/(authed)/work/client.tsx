'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FolderKanban, Plus, Search } from 'lucide-react';
import { ProjectStatus, type Project } from '@prisma/client';
import { createProject, reorderProjects } from '@/actions/projects';
import { PageShell } from '@/components/admin/page-shell';
import { Button, Input } from '@/components/admin/ui';
import { ProjectEditPanel } from '@/components/admin/project-edit-panel';
import { ProjectRow } from '@/components/admin/project-row';
import { useSaveState } from '@/components/admin/save-state-context';

type Filter = 'ALL' | ProjectStatus;

const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'Tous les états',
  BUILDING: 'En construction',
  SHIPPED: 'Livré',
  LEARNING: 'En apprentissage',
  STUDYING: 'En étude',
  ESSAY: 'Essai',
};

export function WorkListClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (filter !== 'ALL' && project.status !== filter) return false;
      if (
        query &&
        !project.nameFr.toLowerCase().includes(query) &&
        !project.nameEn.toLowerCase().includes(query) &&
        !project.taglineFr.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [projects, filter, search]);

  const selected = selectedId
    ? projects.find((project) => project.id === selectedId) ?? null
    : null;

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = projects.findIndex((project) => project.id === dragId);
    const to = projects.findIndex((project) => project.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...projects];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setProjects(next);
    setDragId(null);
    startTransition(async () => {
      try {
        setSaving();
        await reorderProjects(next.map((project) => project.id));
        setSaved();
      } catch {
        setError();
      }
    });
  }

  function handleCreate() {
    startTransition(async () => {
      const response = await createProject({
        slug: `nouveau-projet-${Date.now()}`,
        nameEn: 'Untitled project',
        nameFr: 'Nouveau projet',
        taglineEn: 'A short description.',
        taglineFr: 'Une courte description.',
        status: ProjectStatus.BUILDING,
        stack: [],
        published: false,
      });
      if (response.ok) {
        setProjects((current) => [...current, response.data]);
        setSelectedId(response.data.id);
        router.refresh();
      }
    });
  }

  if (selected) {
    return (
      <PageShell
        breadcrumb={['Portfolio', 'Projets', 'Modifier']}
        title={selected.nameFr}
        subtitle="Les changements sont enregistrés section par section."
        wide
        action={
          <Button variant="ghost" onClick={() => setSelectedId(null)}>
            <ArrowLeft size={14} />
            Retour aux projets
          </Button>
        }
      >
        <ProjectEditPanel
          project={selected}
          onClose={() => setSelectedId(null)}
          onDeleted={() => {
            setProjects((current) =>
              current.filter((project) => project.id !== selected.id)
            );
            setSelectedId(null);
            router.refresh();
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumb={['Portfolio', 'Projets']}
      title="Projets"
      subtitle="Les réalisations visibles dans la section Travaux. Fais glisser une ligne pour changer l’ordre."
      action={
        <Button onClick={handleCreate} disabled={pending}>
          <Plus size={14} />
          Nouveau projet
        </Button>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
          />
          <Input
            placeholder="Rechercher un projet"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
          className="h-10 rounded-xl border border-white/[0.075] bg-[#111114] px-3 text-[12px] text-white/65 outline-none focus:border-white/[0.18]"
        >
          {(Object.keys(FILTER_LABELS) as Filter[]).map((value) => (
            <option key={value} value={value}>
              {FILTER_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-2">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FolderKanban size={21} className="mx-auto mb-3 text-white/25" />
            <p className="text-[12px] text-white/30">
              Aucun projet ne correspond à cette recherche.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onSelect={() => setSelectedId(project.id)}
                onDragStart={() => setDragId(project.id)}
                onDragOver={() => {}}
                onDrop={() => handleDrop(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
