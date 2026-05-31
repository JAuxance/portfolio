'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Reference } from '@prisma/client';
import { PageShell } from '@/components/admin/page-shell';
import { Button, Textarea, Field, FormSurface, Toggle } from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { createReference, updateReference, deleteReference, reorderReferences } from '@/actions/references';
import { cn } from '@/lib/cn';

export function ReferencesAdminClient({ initialItems }: { initialItems: Reference[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  function updateLocal(id: string, patch: Partial<Reference>) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function save(item: Reference) {
    try {
      setSaving();
      await updateReference(item.id, { citation: item.citation, published: item.published });
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
    startTransition(() => { reorderReferences(next.map((p) => p.id)); });
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createReference({ citation: 'New citation', published: true });
      if (res.ok) {
        setItems((p) => [...p, res.data]);
        setSelectedId(res.data.id);
        router.refresh();
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this reference?')) return;
    await deleteReference(id);
    setItems((p) => p.filter((i) => i.id !== id));
    setSelectedId(null);
    router.refresh();
  }

  return (
    <PageShell
      breadcrumb={['Content', 'References']}
      title="References"
      subtitle="Citations shown under the Research section."
      action={
        <Button variant="outline" onClick={handleCreate} disabled={pending}>
          + New reference
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
                'cursor-pointer grid grid-cols-[24px_1fr_100px] items-center gap-4 rounded-[10px] border px-4 py-3 transition-colors',
                selectedId === item.id ? 'border-white/[0.14] bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03]'
              )}
            >
              <span aria-hidden className="grid grid-cols-2 gap-[3px] text-[var(--color-text-tertiary)]">
                {[...Array(6)].map((_, i) => (<span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />))}
              </span>
              <p className="line-clamp-1 text-[13px] text-[var(--color-text-secondary)]">{item.citation}</p>
              <span className="text-right text-[10px] text-[var(--color-text-tertiary)]">{item.published ? '' : 'Draft'}</span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <FormSurface className="mt-6 flex flex-col gap-5">
          <Field label="Citation">
            <Textarea rows={3} value={selected.citation} onChange={(e) => updateLocal(selected.id, { citation: e.target.value })} onBlur={() => save(selected)} />
          </Field>
          <Field label="Published">
            <div className="flex items-center gap-3">
              <Toggle checked={selected.published} onChange={(v) => { updateLocal(selected.id, { published: v }); save({ ...selected, published: v }); }} />
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                {selected.published ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </Field>
          <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <Button variant="danger" onClick={() => handleDelete(selected.id)}>Delete reference</Button>
            <Button variant="outline" onClick={() => setSelectedId(null)}>Close</Button>
          </div>
        </FormSurface>
      )}
    </PageShell>
  );
}
