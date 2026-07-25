'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { ResearchTopic } from '@prisma/client';
import {
  createResearchTopic,
  deleteResearchTopic,
  reorderResearch,
  updateResearchTopic,
} from '@/actions/research';
import { PageShell } from '@/components/admin/page-shell';
import {
  Button,
  Field,
  FormSurface,
  Input,
  Textarea,
  Toggle,
} from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { cn } from '@/lib/cn';

export function ResearchAdminClient({
  initialItems,
}: {
  initialItems: ResearchTopic[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialItems[0]?.id ?? null
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  const selected = selectedId
    ? items.find((item) => item.id === selectedId) ?? null
    : null;

  function patch(id: string, values: Partial<ResearchTopic>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...values } : item))
    );
  }

  async function save(item: ResearchTopic) {
    try {
      setSaving();
      await updateResearchTopic(item.id, {
        number: item.number,
        titleEn: item.titleEn,
        titleFr: item.titleFr,
        bodyEn: item.bodyEn,
        bodyFr: item.bodyFr,
        published: item.published,
      });
      setSaved();
    } catch {
      setError();
    }
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((item) => item.id === dragId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null);
    startTransition(async () => {
      try {
        setSaving();
        await reorderResearch(next.map((item) => item.id));
        setSaved();
      } catch {
        setError();
      }
    });
  }

  function handleCreate() {
    startTransition(async () => {
      const response = await createResearchTopic({});
      if (response.ok) {
        setItems((current) => [...current, response.data]);
        setSelectedId(response.data.id);
        router.refresh();
      }
    });
  }

  async function handleDelete(item: ResearchTopic) {
    if (!confirm(`Supprimer « ${item.titleFr} » ?`)) return;
    await deleteResearchTopic(item.id);
    const remaining = items.filter((current) => current.id !== item.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    router.refresh();
  }

  return (
    <PageShell
      breadcrumb={['Heather', 'Recherche']}
      title="Recherche"
      subtitle="Les questions de recherche qui donnent du contexte à Heather. Elles ne sont pas affichées directement sur le portfolio."
      action={
        <Button onClick={handleCreate} disabled={pending}>
          <Plus size={14} />
          Ajouter
        </Button>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(380px,1.15fr)]">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-2">
          {items.length === 0 ? (
            <EmptyList />
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(item.id)}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'grid w-full grid-cols-[18px_34px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                    selectedId === item.id
                      ? 'border-white/[0.10] bg-white/[0.055]'
                      : 'border-transparent hover:bg-white/[0.025]'
                  )}
                >
                  <GripVertical size={14} className="text-white/20" />
                  <span className="font-mono text-[10px] text-white/25">
                    {item.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-white/75">
                      {item.titleFr}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-white/28">
                      {item.bodyFr}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      item.published ? 'bg-emerald-300/70' : 'bg-white/15'
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <FormSurface className="lg:sticky lg:top-24">
            <div className="mb-6 flex items-start justify-between border-b border-white/[0.06] pb-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                  Question {selected.number}
                </p>
                <h2 className="mt-2 text-[18px] font-medium text-white/80">
                  {selected.titleFr}
                </h2>
              </div>
              <Toggle
                checked={selected.published}
                onChange={(value) => {
                  const next = { ...selected, published: value };
                  patch(selected.id, { published: value });
                  void save(next);
                }}
                label="Utiliser dans Heather"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Numéro">
                <Input
                  value={selected.number}
                  onChange={(event) => patch(selected.id, { number: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <span className="hidden sm:block" />
              <Field label="Titre · Français">
                <Input
                  value={selected.titleFr}
                  onChange={(event) => patch(selected.id, { titleFr: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <Field label="Titre · English">
                <Input
                  value={selected.titleEn}
                  onChange={(event) => patch(selected.id, { titleEn: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <Field label="Question · Français">
                <Textarea
                  rows={6}
                  value={selected.bodyFr}
                  onChange={(event) => patch(selected.id, { bodyFr: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <Field label="Question · English">
                <Textarea
                  rows={6}
                  value={selected.bodyEn}
                  onChange={(event) => patch(selected.id, { bodyEn: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end border-t border-white/[0.06] pt-5">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selected)}
              >
                <Trash2 size={13} />
                Supprimer
              </Button>
            </div>
          </FormSurface>
        ) : (
          <SelectionHint />
        )}
      </div>
    </PageShell>
  );
}

function EmptyList() {
  return (
    <div className="px-5 py-16 text-center">
      <BrainCircuit size={20} className="mx-auto mb-3 text-white/25" />
      <p className="text-[12px] text-white/30">Aucune question pour le moment.</p>
    </div>
  );
}

function SelectionHint() {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-white/[0.07]">
      <p className="text-[12px] text-white/25">Sélectionne une question à modifier.</p>
    </div>
  );
}
