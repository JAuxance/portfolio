'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Plus, Route, Trash2 } from 'lucide-react';
import {
  StationState,
  type TrajectoryStation,
} from '@prisma/client';
import {
  createStation,
  deleteStation,
  reorderStations,
  updateStation,
} from '@/actions/trajectory';
import { PageShell } from '@/components/admin/page-shell';
import {
  Button,
  Field,
  FormSurface,
  Input,
  Textarea,
} from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { cn } from '@/lib/cn';

const STATE_LABELS: Record<StationState, string> = {
  CURRENT: 'Maintenant',
  PLANNED: 'Prévu',
  GOAL: 'Objectif',
};

export function TrajectoryAdminClient({
  initialItems,
}: {
  initialItems: TrajectoryStation[];
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

  function patch(id: string, values: Partial<TrajectoryStation>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...values } : item))
    );
  }

  async function save(item: TrajectoryStation) {
    try {
      setSaving();
      await updateStation(item.id, {
        year: item.year,
        instEn: item.instEn,
        instFr: item.instFr,
        objEn: item.objEn,
        objFr: item.objFr,
        state: item.state,
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
        await reorderStations(next.map((item) => item.id));
        setSaved();
      } catch {
        setError();
      }
    });
  }

  function handleCreate() {
    startTransition(async () => {
      const response = await createStation({});
      if (response.ok) {
        setItems((current) => [...current, response.data]);
        setSelectedId(response.data.id);
        router.refresh();
      }
    });
  }

  async function handleDelete(item: TrajectoryStation) {
    if (!confirm(`Supprimer l’étape « ${item.instFr} » ?`)) return;
    await deleteStation(item.id);
    const remaining = items.filter((current) => current.id !== item.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    router.refresh();
  }

  return (
    <PageShell
      breadcrumb={['Heather', 'Parcours']}
      title="Parcours"
      subtitle="Les étapes qui racontent d’où tu viens et où tu vas. Une seule étape devrait être marquée « Maintenant »."
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
            <div className="px-5 py-16 text-center">
              <Route size={20} className="mx-auto mb-3 text-white/25" />
              <p className="text-[12px] text-white/30">Aucune étape pour le moment.</p>
            </div>
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
                    'grid w-full grid-cols-[18px_54px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                    selectedId === item.id
                      ? 'border-white/[0.10] bg-white/[0.055]'
                      : 'border-transparent hover:bg-white/[0.025]'
                  )}
                >
                  <GripVertical size={14} className="text-white/20" />
                  <span className="font-mono text-[9px] text-white/25">
                    {item.year}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-white/75">
                      {item.instFr}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-white/28">
                      {item.objFr}
                    </span>
                  </span>
                  <span className="rounded-full border border-white/[0.06] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/30">
                    {STATE_LABELS[item.state]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <FormSurface className="lg:sticky lg:top-24">
            <div className="mb-6 border-b border-white/[0.06] pb-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                Modifier
              </p>
              <h2 className="mt-2 text-[18px] font-medium text-white/80">
                {selected.instFr}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Année">
                <Input
                  value={selected.year}
                  onChange={(event) => patch(selected.id, { year: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <Field label="État">
                <div className="flex h-10 flex-wrap items-center gap-2">
                  {(Object.keys(STATE_LABELS) as StationState[]).map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        const next = { ...selected, state };
                        patch(selected.id, { state });
                        void save(next);
                      }}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[10px] transition-colors',
                        selected.state === state
                          ? 'border-white/[0.14] bg-white/[0.08] text-white'
                          : 'border-white/[0.06] text-white/30 hover:text-white'
                      )}
                    >
                      {STATE_LABELS[state]}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Institution · Français">
                <Input
                  value={selected.instFr}
                  onChange={(event) => patch(selected.id, { instFr: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <Field label="Institution · English">
                <Input
                  value={selected.instEn}
                  onChange={(event) => patch(selected.id, { instEn: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <Field label="Objectif · Français">
                <Textarea
                  rows={5}
                  value={selected.objFr}
                  onChange={(event) => patch(selected.id, { objFr: event.target.value })}
                  onBlur={() => save(selected)}
                />
              </Field>
              <Field label="Objectif · English">
                <Textarea
                  rows={5}
                  value={selected.objEn}
                  onChange={(event) => patch(selected.id, { objEn: event.target.value })}
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
          <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-white/[0.07]">
            <p className="text-[12px] text-white/25">
              Sélectionne une étape à modifier.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
