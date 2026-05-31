'use client';

import { useState, useTransition } from 'react';
import type { Profile } from '@prisma/client';
import { Locale } from '@prisma/client';
import { PageShell } from '@/components/admin/page-shell';
import { Button, Input, Textarea, Field, FormSurface } from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { updateProfile } from '@/actions/profile';

export function ProfileClient({ profile }: { profile: Profile }) {
  const [form, setForm] = useState(profile);
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  function up<K extends keyof Profile>(k: K, v: Profile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save() {
    startTransition(async () => {
      try {
        setSaving();
        await updateProfile({
          name: form.name,
          handle: form.handle,
          emailPublic: form.emailPublic,
          github: form.github ?? null,
          linkedin: form.linkedin ?? null,
          twitter: form.twitter ?? null,
          readcv: form.readcv ?? null,
          abstractEn: form.abstractEn,
          abstractFr: form.abstractFr,
          contactBlurbEn: form.contactBlurbEn,
          contactBlurbFr: form.contactBlurbFr,
          defaultLocale: form.defaultLocale,
        });
        setSaved();
      } catch (e) {
        console.error(e);
        setError();
      }
    });
  }

  return (
    <PageShell
      breadcrumb={['Content', 'Profile']}
      title="Profile"
      subtitle="Identity, abstract, contact blurb, and social links."
      action={
        <Button variant="primary" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      }
    >
      <FormSurface className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Display name">
            <Input value={form.name} onChange={(e) => up('name', e.target.value)} onBlur={save} />
          </Field>
          <Field label="Handle">
            <Input value={form.handle} onChange={(e) => up('handle', e.target.value)} onBlur={save} />
          </Field>
          <Field label="Public email">
            <Input value={form.emailPublic} onChange={(e) => up('emailPublic', e.target.value)} onBlur={save} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Abstract (EN)" hint="Hero paragraph in English.">
            <Textarea rows={5} value={form.abstractEn} onChange={(e) => up('abstractEn', e.target.value)} onBlur={save} />
          </Field>
          <Field label="Abstract (FR)" hint="Hero paragraph in French.">
            <Textarea rows={5} value={form.abstractFr} onChange={(e) => up('abstractFr', e.target.value)} onBlur={save} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Contact blurb (EN)">
            <Textarea rows={3} value={form.contactBlurbEn} onChange={(e) => up('contactBlurbEn', e.target.value)} onBlur={save} />
          </Field>
          <Field label="Contact blurb (FR)">
            <Textarea rows={3} value={form.contactBlurbFr} onChange={(e) => up('contactBlurbFr', e.target.value)} onBlur={save} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="GitHub URL">
            <Input value={form.github ?? ''} onChange={(e) => up('github', e.target.value)} onBlur={save} />
          </Field>
          <Field label="LinkedIn URL">
            <Input value={form.linkedin ?? ''} onChange={(e) => up('linkedin', e.target.value)} onBlur={save} />
          </Field>
          <Field label="Twitter URL">
            <Input value={form.twitter ?? ''} onChange={(e) => up('twitter', e.target.value)} onBlur={save} />
          </Field>
          <Field label="Read.cv URL">
            <Input value={form.readcv ?? ''} onChange={(e) => up('readcv', e.target.value)} onBlur={save} />
          </Field>
        </div>
        <Field label="Default locale">
          <div className="flex gap-2">
            {(['EN', 'FR'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { up('defaultLocale', l as Locale); save(); }}
                className={`rounded-full border px-4 py-1.5 text-[12px] transition-colors ${
                  form.defaultLocale === l
                    ? 'border-white/[0.14] bg-white/[0.08] text-white'
                    : 'border-white/[0.06] bg-white/[0.025] text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Field>
      </FormSurface>
    </PageShell>
  );
}
