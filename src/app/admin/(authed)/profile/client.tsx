'use client';

import { useState, useTransition } from 'react';
import { Locale, type Profile } from '@prisma/client';
import { Check, Contact, Languages, UserRound } from 'lucide-react';
import { updateProfile } from '@/actions/profile';
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

export function ProfileClient({ profile }: { profile: Profile }) {
  const [form, setForm] = useState(profile);
  const [pending, startTransition] = useTransition();
  const { setSaving, setSaved, setError } = useSaveState();

  function patch<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save(next: Profile = form) {
    startTransition(async () => {
      try {
        setSaving();
        await updateProfile({
          name: next.name,
          handle: next.handle,
          emailPublic: next.emailPublic,
          github: next.github ?? null,
          linkedin: next.linkedin ?? null,
          twitter: next.twitter ?? null,
          readcv: next.readcv ?? null,
          abstractEn: next.abstractEn,
          abstractFr: next.abstractFr,
          contactBlurbEn: next.contactBlurbEn,
          contactBlurbFr: next.contactBlurbFr,
          defaultLocale: next.defaultLocale,
        });
        setSaved();
      } catch {
        setError();
      }
    });
  }

  return (
    <PageShell
      breadcrumb={['Portfolio', 'Profil']}
      title="Profil"
      subtitle="Ton identité publique, les textes d’introduction et tes liens. Les champs bilingues sont regroupés côte à côte."
      action={
        <Button variant="primary" onClick={() => save()} disabled={pending}>
          <Check size={15} />
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <FormSurface>
          <SectionHeading
            icon={UserRound}
            title="Identité"
            description="Les informations visibles dans le portfolio."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Nom affiché">
              <Input
                value={form.name}
                onChange={(event) => patch('name', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Nom court">
              <Input
                value={form.handle}
                onChange={(event) => patch('handle', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Email public">
              <Input
                type="email"
                value={form.emailPublic}
                onChange={(event) => patch('emailPublic', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
          </div>
        </FormSurface>

        <FormSurface>
          <SectionHeading
            icon={Languages}
            title="Présentation"
            description="Le grand texte d’introduction et le message de contact."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Introduction · Français">
              <Textarea
                rows={6}
                value={form.abstractFr}
                onChange={(event) => patch('abstractFr', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Introduction · English">
              <Textarea
                rows={6}
                value={form.abstractEn}
                onChange={(event) => patch('abstractEn', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Contact · Français">
              <Textarea
                rows={3}
                value={form.contactBlurbFr}
                onChange={(event) => patch('contactBlurbFr', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Contact · English">
              <Textarea
                rows={3}
                value={form.contactBlurbEn}
                onChange={(event) => patch('contactBlurbEn', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
          </div>
        </FormSurface>

        <FormSurface>
          <SectionHeading
            icon={Contact}
            title="Liens"
            description="Laisse un champ vide pour masquer le lien correspondant."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="GitHub">
              <Input
                value={form.github ?? ''}
                onChange={(event) => patch('github', event.target.value)}
                onBlur={() => save()}
                placeholder="github.com/…"
              />
            </Field>
            <Field label="LinkedIn">
              <Input
                value={form.linkedin ?? ''}
                onChange={(event) => patch('linkedin', event.target.value)}
                onBlur={() => save()}
                placeholder="linkedin.com/in/…"
              />
            </Field>
            <Field label="X / Twitter">
              <Input
                value={form.twitter ?? ''}
                onChange={(event) => patch('twitter', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
            <Field label="Read.cv">
              <Input
                value={form.readcv ?? ''}
                onChange={(event) => patch('readcv', event.target.value)}
                onBlur={() => save()}
              />
            </Field>
          </div>

          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <Field label="Langue par défaut">
              <div className="flex gap-2">
                {([Locale.FR, Locale.EN] as const).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => {
                      const next = { ...form, defaultLocale: locale };
                      setForm(next);
                      save(next);
                    }}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-[11px] transition-colors',
                      form.defaultLocale === locale
                        ? 'border-white/[0.14] bg-white/[0.08] text-white'
                        : 'border-white/[0.06] text-white/35 hover:text-white'
                    )}
                  >
                    {locale === Locale.FR ? 'Français' : 'English'}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </FormSurface>
      </div>
    </PageShell>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-white/[0.06] pb-5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.045] text-white/45">
        <Icon size={15} />
      </span>
      <div>
        <h2 className="text-[13px] font-medium text-white/75">{title}</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-white/28">
          {description}
        </p>
      </div>
    </div>
  );
}
