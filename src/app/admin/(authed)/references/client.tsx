'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Plus, Quote, Trash2 } from 'lucide-react';
import type { Reference } from '@prisma/client';
import {
  createReference,
  deleteReference,
  reorderReferences,
  updateReference,
} from '@/actions/references';
import { PageShell } from '@/components/admin/page-shell';
import {
  Button,
  Field,
  FormSurface,
  Textarea,
  Toggle,
} from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { cn } from '@/lib/cn';

export function ReferencesAdminClient({
  initialItems,
}: {
  initialItems: Reference[];
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

  function patch(id: string, values: Partial<Reference>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...values } : item))
    );
  }

  async function save(item: Reference) {
    try {
      setSaving();
      await updateReference(item.id, {
        citation: item.citation,
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
        await reorderReferences(next.map((item) => item.id));
        setSaved();
      } catch {
        setError();
      }
    });
  }

  function handleCreate() {
    startTransition(async () => {
      const response = await createReference({
        citation: 'Nouvelle référence',
        published: true,
      });
      if (response.ok) {
        setItems((current) => [...current, response.data]);
        setSelectedId(response.data.id);
        router.refresh();
      }
    });
  }

  async function handleDelete(item: Reference) {
    if (!confirm('Supprimer cette référence ?')) return;
    await deleteReference(item.id);
    const remaining = items.filter((current) => current.id !== item.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    router.refresh();
  }

  return (
    <PageShell
      breadcrumb={['Heather', 'Références']}
      title="Références"
      subtitle="Les sources et lectures que Heather peut citer pour mieux expliquer ton travail."
      action={
        <Button onClick={handleCreate} disabled={pending}>
          <Plus size={14} />
          Ajouter
        </Button>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-2">
          {items.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Quote size={20} className="mx-auto mb-3 text-white/25" />
              <p className="text-[12px] text-white/30">
                Aucune référence pour le moment.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(item.id)}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'grid w-full grid-cols-[18px_28px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                    selectedId === item.id
                      ? 'border-white/[0.10] bg-white/[0.055]'
                      : 'border-transparent hover:bg-white/[0.025]'
                  )}
                >
                  <GripVertical size={14} className="text-white/20" />
                  <span className="font-mono text-[9px] text-white/20">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="line-clamp-2 text-[12px] leading-relaxed text-white/55">
                    {item.citation}
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
                  Modifier
                </p>
                <h2 className="mt-2 text-[18px] font-medium text-white/80">
                  Référence
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
            <Field label="Citation">
              <Textarea
                rows={8}
                value={selected.citation}
                onChange={(event) =>
                  patch(selected.id, { citation: event.target.value })
                }
                onBlur={() => save(selected)}
              />
            </Field>
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
              Sélectionne une référence à modifier.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
