'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ResearchTopic } from '@prisma/client';
import { PageShell } from '@/components/admin/page-shell';
import { Button, Input, Textarea, Field, FormSurface, Toggle } from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { createResearchTopic, updateResearchTopic, deleteResearchTopic, reorderResearch } from '@/actions/research';
import { cn } from '@/lib/cn';

export function ResearchAdminClient({ initialItems }: { initialItems: ResearchTopic[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  function updateLocal(id: string, patch: Partial<ResearchTopic>) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
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
    const dragIdx = items.findIndex((p) => p.id === dragId);
    const targetIdx = items.findIndex((p) => p.id === targetId);
    if (dragIdx < 0 || targetIdx < 0) return;
    const next = [...items];
    const [m] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, m);
    setItems(next);
    setDragId(null);
    startTransition(() => { reorderResearch(next.map((p) => p.id)); });
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createResearchTopic({});
      if (res.ok) {
        setItems((p) => [...p, res.data]);
        setSelectedId(res.data.id);
        router.refresh();
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this research topic?')) return;
    await deleteResearchTopic(id);
    setItems((p) => p.filter((i) => i.id !== id));
    setSelectedId(null);
    router.refresh();
  }

  return (
    <PageShell
      breadcrumb={['Content', 'Research']}
      title="Research"
      subtitle="Numbered research questions shown on the research section."
      action={
        <Button variant="outline" onClick={handleCreate} disabled={pending}>
          + New topic
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
                'cursor-pointer grid grid-cols-[24px_60px_1fr_120px] items-center gap-4 rounded-[10px] border px-4 py-3 transition-colors',
                selectedId === item.id ? 'border-white/[0.14] bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03]'
              )}
            >
              <span aria-hidden className="grid grid-cols-2 gap-[3px] text-[var(--color-text-tertiary)]">
                {[...Array(6)].map((_, i) => (<span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />))}
              </span>
              <span className="font-mono text-[12px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>{item.number}</span>
              <div>
                <p className="truncate text-[14px] font-medium text-[var(--color-text-primary)]">{item.titleEn}</p>
                <p className="line-clamp-1 text-[12px] text-[var(--color-text-secondary)]">{item.bodyEn}</p>
              </div>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">{item.published ? '' : 'Draft'}</span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <FormSurface className="mt-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[100px_1fr_140px]">
            <Field label="Number">
              <Input value={selected.number} onChange={(e) => updateLocal(selected.id, { number: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <span />
            <Field label="Published">
              <div className="flex h-10 items-center">
                <Toggle checked={selected.published} onChange={(v) => { updateLocal(selected.id, { published: v }); save({ ...selected, published: v }); }} />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Title (EN)">
              <Input value={selected.titleEn} onChange={(e) => updateLocal(selected.id, { titleEn: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <Field label="Title (FR)">
              <Input value={selected.titleFr} onChange={(e) => updateLocal(selected.id, { titleFr: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <Field label="Body (EN)">
              <Textarea rows={5} value={selected.bodyEn} onChange={(e) => updateLocal(selected.id, { bodyEn: e.target.value })} onBlur={() => save(selected)} />
            </Field>
            <Field label="Body (FR)">
              <Textarea rows={5} value={selected.bodyFr} onChange={(e) => updateLocal(selected.id, { bodyFr: e.target.value })} onBlur={() => save(selected)} />
            </Field>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <Button variant="danger" onClick={() => handleDelete(selected.id)}>Delete topic</Button>
            <Button variant="outline" onClick={() => setSelectedId(null)}>Close</Button>
          </div>
        </FormSurface>
      )}
    </PageShell>
  );
}
