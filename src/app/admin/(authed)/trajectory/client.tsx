'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { TrajectoryStation } from '@prisma/client';
import { StationState } from '@prisma/client';
import { PageShell } from '@/components/admin/page-shell';
import { Button, Input, Textarea, Field, FormSurface } from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { createStation, updateStation, deleteStation, reorderStations } from '@/actions/trajectory';
import { cn } from '@/lib/cn';

const STATE_LABELS: Record<StationState, string> = {
  CURRENT: 'Current',
  PLANNED: 'Planned',
  GOAL: 'Goal',
};

export function TrajectoryAdminClient({ initialItems }: { initialItems: TrajectoryStation[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  function updateLocal(id: string, patch: Partial<TrajectoryStation>) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
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
    } catch { setError(); }
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const dragIdx = items.findIndex((p) => p.id === dragId);
    const targetIdx = items.findIndex((p) => p.id === targetId);
    if (dragIdx < 0 || targetIdx < 0) return;
    const next = [...items];
    const [m] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, m);
    setItems(next);
    setDragId(null);
    startTransition(() => { reorderStations(next.map((p) => p.id)); });
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createStation({});
      if (res.ok) {
        setItems((p) => [...p, res.data]);
        setSelectedId(res.data.id);
        router.refresh();
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this station?')) return;
    await deleteStation(id);
    setItems((p) => p.filter((i) => i.id !== id));
    setSelectedId(null);
    router.refresh();
  }

  return (
    <PageShell
      breadcrumb={['Content', 'Trajectory']}
      title="Trajectory"
      subtitle="Stations on the timeline. Only one should be marked CURRENT at a time."
      action={
        <Button variant="outline" onClick={handleCreate} disabled={pending}>
          + New station
        </Button>
      }
    >
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(item.id)}
              onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
              className={cn(
                'cursor-pointer grid grid-cols-[24px_120px_1fr_100px] items-center gap-4 rounded-[10px] border px-4 py-3 transition-colors',
                selectedId === item.id ? 'border-white/[0.14] bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03]'
              )}
            >
              <span aria-hidden className="grid grid-cols-2 gap-[3px] text-[var(--color-text-tertiary)]">
                {[...Array(6)].map((_, i) => (<span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />))}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>{item.year}</span>
              <div>
                <p className="truncate text-[14px] font-medium text-[var(--color-text-primary)]">{item.instEn}</p>
                <p className="line-clamp-1 text-[12px] text-[var(--color-text-secondary)]">{item.objEn}</p>
              </div>
              <span className="text-right font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {STATE_LABELS[item.state]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <FormSurface className="mt-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
            <Field label="Year">
              <Input value={selected.year} onChange={(e) => updateLocal(selected.id, { year: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <Field label="State">
              <div className="flex gap-2">
                {(Object.keys(STATE_LABELS) as StationState[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { updateLocal(selected.id, { state: s }); save({ ...selected, state: s }); }}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-[12px] transition-colors',
                      selected.state === s
                        ? 'border-white/[0.14] bg-white/[0.08] text-white'
                        : 'border-white/[0.06] bg-white/[0.025] text-[var(--color-text-secondary)] hover:text-white'
                    )}
                  >
                    {STATE_LABELS[s]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Institution (EN)">
              <Input value={selected.instEn} onChange={(e) => updateLocal(selected.id, { instEn: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <Field label="Institution (FR)">
              <Input value={selected.instFr} onChange={(e) => updateLocal(selected.id, { instFr: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <Field label="Objective (EN)">
              <Textarea rows={3} value={selected.objEn} onChange={(e) => updateLocal(selected.id, { objEn: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <Field label="Objective (FR)">
              <Textarea rows={3} value={selected.objFr} onChange={(e) => updateLocal(selected.id, { objFr: e.target.value })} onBlur={() => save(selected)} />
            </Field>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <Button variant="danger" onClick={() => handleDelete(selected.id)}>Delete station</Button>
            <Button variant="outline" onClick={() => setSelectedId(null)}>Close</Button>
          </div>
        </FormSurface>
      )}
    </PageShell>
  );
}
