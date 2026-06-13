'use client';

import { useState, useTransition, useEffect } from 'react';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import { Button, Input, Textarea, Field, Label, Toggle } from './ui';
import { StatusDropdown } from './status-dropdown';
import { StackTagInput } from './stack-tag-input';
import { MediaDrop } from './media-drop';
import { isVideoUrl } from '@/lib/media';
import { useSaveState } from './save-state-context';
import { updateProject, deleteProject, toggleFeatured, togglePublished } from '@/actions/projects';
import { cn } from '@/lib/cn';

type Tab = 'basics' | 'detail' | 'visual' | 'seo';

interface ProjectEditPanelProps {
  project: Project;
  onClose: () => void;
  onDeleted: () => void;
}

export function ProjectEditPanel({ project, onClose, onDeleted }: ProjectEditPanelProps) {
  const [tab, setTab] = useState<Tab>('basics');
  const [form, setForm] = useState(() => projectToForm(project));
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  useEffect(() => {
    setForm(projectToForm(project));
  }, [project.id]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // `overrides` carries values set in the same tick as the save call —
  // React state updates haven't landed yet, so reading `form` alone would
  // persist the previous value (stale closure).
  async function save(overrides: Partial<ReturnType<typeof projectToForm>> = {}) {
    const f = { ...form, ...overrides };
    startTransition(async () => {
      try {
        setSaving();
        await updateProject(project.id, {
          slug: f.slug,
          nameEn: f.nameEn,
          nameFr: f.nameFr,
          taglineEn: f.taglineEn,
          taglineFr: f.taglineFr,
          status: f.status,
          stack: f.stack,
          liveUrl: f.liveUrl,
          repoUrl: f.repoUrl,
          featured: f.featured,
          published: f.published,
          contextEn: f.contextEn,
          contextFr: f.contextFr,
          architecture: f.architecture,
          decisions: f.decisions,
          lessons: f.lessons,
          heroImage: f.heroImage,
          timelineEn: f.timelineEn,
          timelineFr: f.timelineFr,
          roleEn: f.roleEn,
          roleFr: f.roleFr,
          teamEn: f.teamEn,
          teamFr: f.teamFr,
          contextLabelEn: f.contextLabelEn,
          contextLabelFr: f.contextLabelFr,
        });
        setSaved();
      } catch (e) {
        console.error(e);
        setError();
      }
    });
  }

  async function handleDelete() {
    if (!confirm(`Delete project "${form.nameEn}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProject(project.id);
      onDeleted();
    });
  }

  async function handleToggleFeatured(next: boolean) {
    update('featured', next);
    startTransition(async () => {
      try {
        setSaving();
        await toggleFeatured(project.id, next);
        setSaved();
      } catch {
        setError();
      }
    });
  }

  async function handleTogglePublished(next: boolean) {
    update('published', next);
    startTransition(async () => {
      try {
        setSaving();
        await togglePublished(project.id, next);
        setSaved();
      } catch {
        setError();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Editing · {form.nameEn}
          </p>
          <h3
            className="text-[20px] font-medium text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Project details
          </h3>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.025] p-1">
          {(['basics', 'detail', 'visual', 'seo'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[12px] capitalize transition-colors',
                tab === t
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[var(--color-text-tertiary)] hover:text-white'
              )}
            >
              {t === 'detail' ? 'Detail page' : t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'basics' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_180px]">
            <Field label="Project name (EN)">
              <Input value={form.nameEn} onChange={(e) => update('nameEn', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Status">
              <StatusDropdown value={form.status} onChange={(s) => { update('status', s); save({ status: s }); }} />
            </Field>
            <Field label="Featured in bento">
              <div className="flex h-10 items-center">
                <Toggle checked={form.featured} onChange={handleToggleFeatured} />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Project name (FR)">
              <Input value={form.nameFr} onChange={(e) => update('nameFr', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Slug" hint="The URL path: /work/<slug>">
              <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} onBlur={() => save()} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tagline (EN)" hint="Shown on the bento card and project page. ~180 chars max.">
              <Textarea
                rows={3}
                value={form.taglineEn}
                onChange={(e) => update('taglineEn', e.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Tagline (FR)">
              <Textarea
                rows={3}
                value={form.taglineFr}
                onChange={(e) => update('taglineFr', e.target.value)}
                onBlur={() => save()}
              />
            </Field>
          </div>

          <Field label="Tech stack" hint="Not shown on cards — feeds Heather">
            <StackTagInput value={form.stack} onChange={(s) => { update('stack', s); save({ stack: s }); }} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
            <Field label="Detail page">
              <div className="flex h-10 items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5">
                <span
                  className="font-mono text-[12px] text-[var(--color-text-secondary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  /work/{form.slug}
                </span>
                <button
                  type="button"
                  onClick={() => setTab('detail')}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] hover:text-white"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Edit content →
                </button>
              </div>
            </Field>
            <Field label="Live demo URL">
              <Input
                placeholder="https://"
                value={form.liveUrl ?? ''}
                onChange={(e) => update('liveUrl', e.target.value)}
                onBlur={() => save()}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Repository URL">
              <Input
                placeholder="https://github.com/..."
                value={form.repoUrl ?? ''}
                onChange={(e) => update('repoUrl', e.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Published">
              <div className="flex h-10 items-center gap-3">
                <Toggle checked={form.published} onChange={handleTogglePublished} />
                <span className="text-[12px] text-[var(--color-text-tertiary)]">
                  {form.published ? 'Visible on public site' : 'Draft — hidden from site'}
                </span>
              </div>
            </Field>
          </div>
        </div>
      )}

      {tab === 'detail' && (
        <div className="flex flex-col gap-6">
          <Field label="Context (EN) — one paragraph per line">
            <Textarea
              rows={6}
              value={form.contextEn.join('\n\n')}
              onChange={(e) => update('contextEn', e.target.value.split('\n\n').filter(Boolean))}
              onBlur={() => save()}
            />
          </Field>
          <Field label="Context (FR) — one paragraph per line">
            <Textarea
              rows={6}
              value={form.contextFr.join('\n\n')}
              onChange={(e) => update('contextFr', e.target.value.split('\n\n').filter(Boolean))}
              onBlur={() => save()}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Timeline (EN)">
              <Input value={form.timelineEn ?? ''} onChange={(e) => update('timelineEn', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Timeline (FR)">
              <Input value={form.timelineFr ?? ''} onChange={(e) => update('timelineFr', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Role (EN)">
              <Input value={form.roleEn ?? ''} onChange={(e) => update('roleEn', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Role (FR)">
              <Input value={form.roleFr ?? ''} onChange={(e) => update('roleFr', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Team (EN)">
              <Input value={form.teamEn ?? ''} onChange={(e) => update('teamEn', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Team (FR)">
              <Input value={form.teamFr ?? ''} onChange={(e) => update('teamFr', e.target.value)} onBlur={() => save()} />
            </Field>
            <Field label="Context label (EN)">
              <Input
                value={form.contextLabelEn ?? ''}
                onChange={(e) => update('contextLabelEn', e.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Context label (FR)">
              <Input
                value={form.contextLabelFr ?? ''}
                onChange={(e) => update('contextLabelFr', e.target.value)}
                onBlur={() => save()}
              />
            </Field>
          </div>
          <JsonField label="Architecture (JSON)" value={form.architecture} onChange={(v) => { update('architecture', v); save({ architecture: v }); }} placeholder='[{"layer":"Frontend","primary":"Next.js","notesEn":"...","notesFr":"..."}]' />
          <JsonField label="Decisions (JSON)" value={form.decisions} onChange={(v) => { update('decisions', v); save({ decisions: v }); }} placeholder='[{"n":"01","titleEn":"...","titleFr":"...","bodyEn":"...","bodyFr":"..."}]' />
          <JsonField label="Lessons (JSON)" value={form.lessons} onChange={(v) => { update('lessons', v); save({ lessons: v }); }} placeholder='[{"label":"TECHNICAL","textEn":"...","textFr":"..."}]' />
        </div>
      )}

      {tab === 'visual' && (
        <div className="flex flex-col gap-5">
          <Field label="Hero media" hint="Shown in the browser mockup on the project page.">
            <MediaDrop
              onUploaded={(url) => {
                update('heroImage', url);
                save({ heroImage: url });
              }}
            />
          </Field>
          {form.heroImage && (
            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                {isVideoUrl(form.heroImage) ? (
                  <video src={form.heroImage} className="max-h-[280px] w-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.heroImage} alt="Hero preview" className="max-h-[280px] w-full object-cover" />
                )}
              </div>
            </div>
          )}
          <Field label="…or paste a URL" hint="External URL (Vercel Blob / Cloudinary) or /uploads/… path. Clear to fall back to the placeholder mockup.">
            <Input value={form.heroImage ?? ''} onChange={(e) => update('heroImage', e.target.value)} onBlur={() => save()} />
          </Field>
        </div>
      )}

      {tab === 'seo' && (
        <p className="text-[13px] text-[var(--color-text-tertiary)]">
          SEO meta inherits from project name + tagline. Per-project overrides can be added later.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
        <Button variant="danger" onClick={handleDelete} disabled={pending}>
          Delete project
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => save()} disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function JsonField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(() => (value ? JSON.stringify(value, null, 2) : ''));
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setText(value ? JSON.stringify(value, null, 2) : '');
  }, [JSON.stringify(value)]);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          if (!text.trim()) {
            onChange(null);
            setErr(null);
            return;
          }
          try {
            const parsed = JSON.parse(text);
            onChange(parsed);
            setErr(null);
          } catch (e) {
            setErr('Invalid JSON');
          }
        }}
        placeholder={placeholder}
        className="font-mono text-[12px]"
        style={{ fontFamily: 'var(--font-mono)' }}
      />
      {err && <p className="text-[11px] text-red-300">{err}</p>}
    </div>
  );
}

function projectToForm(p: Project) {
  return {
    slug: p.slug,
    nameEn: p.nameEn,
    nameFr: p.nameFr,
    taglineEn: p.taglineEn,
    taglineFr: p.taglineFr,
    status: p.status as ProjectStatus,
    stack: p.stack,
    liveUrl: p.liveUrl,
    repoUrl: p.repoUrl,
    featured: p.featured,
    published: p.published,
    contextEn: p.contextEn,
    contextFr: p.contextFr,
    architecture: p.architecture as unknown,
    decisions: p.decisions as unknown,
    lessons: p.lessons as unknown,
    heroImage: p.heroImage,
    timelineEn: p.timelineEn,
    timelineFr: p.timelineFr,
    roleEn: p.roleEn,
    roleFr: p.roleFr,
    teamEn: p.teamEn,
    teamFr: p.teamFr,
    contextLabelEn: p.contextLabelEn,
    contextLabelFr: p.contextLabelFr,
  };
}
