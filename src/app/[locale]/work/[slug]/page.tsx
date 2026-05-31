import { notFound } from 'next/navigation';
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { locales } from '@/lib/i18n-config';
import { StatusPill } from '@/components/public/status-pill';
import { GlassCard } from '@/components/public/glass-card';
import type { ArchitectureLayer, Decision, Lesson } from '@/types/content';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const projects = await db.project.findMany({ where: { published: true }, select: { slug: true } });
  return locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as 'en' | 'fr';
  const t = await getTranslations('work');

  const project = await db.project.findUnique({ where: { slug } });
  if (!project || !project.published) notFound();

  const all = await db.project.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    select: { slug: true, nameEn: true, nameFr: true, order: true },
  });
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const name = loc === 'fr' ? project.nameFr : project.nameEn;
  const tagline = loc === 'fr' ? project.taglineFr : project.taglineEn;
  const ctx = loc === 'fr' ? project.contextFr : project.contextEn;
  const timeline = loc === 'fr' ? project.timelineFr : project.timelineEn;
  const role = loc === 'fr' ? project.roleFr : project.roleEn;
  const team = loc === 'fr' ? project.teamFr : project.teamEn;
  const contextLabel = loc === 'fr' ? project.contextLabelFr : project.contextLabelEn;
  const architecture = (project.architecture as unknown as ArchitectureLayer[] | null) ?? [];
  const decisions = (project.decisions as unknown as Decision[] | null) ?? [];
  const lessons = (project.lessons as unknown as Lesson[] | null) ?? [];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-6 pt-[120px] pb-12 md:px-12 md:pt-[140px] lg:px-20">
        <Link
          href={`/${locale}#work`}
          className="mb-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] hover:text-white"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          ← {t('back')}
        </Link>

        <div className="mb-6 flex items-center gap-4">
          <StatusPill status={project.status} locale={loc} withPill />
        </div>

        <h1
          className="mb-6 text-[40px] md:text-[60px] lg:text-[76px] font-semibold leading-[1.02] text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
        >
          {name}
        </h1>
        <p
          className="mb-14 max-w-[800px] text-[18px] md:text-[22px] leading-[1.45] text-[var(--color-text-secondary)]"
          style={{ letterSpacing: '-0.015em' }}
        >
          {tagline}
        </p>

        <div className="grid grid-cols-2 gap-6 border-t border-[var(--color-glass-border)] pt-6 md:grid-cols-4 md:gap-8">
          <MetaCol label={t('timeline')} value={timeline ?? '—'} />
          <MetaCol label={t('role')} value={role ?? '—'} />
          <MetaCol label={t('team')} value={team ?? '—'} />
          <MetaCol label={t('contextLabel')} value={contextLabel ?? '—'} />
        </div>
      </section>

      {/* Browser mockup */}
      <section className="mx-auto max-w-[1280px] px-6 md:px-12 lg:px-20">
        <div className="glass overflow-hidden" style={{ borderRadius: 20 }}>
          <div className="flex items-center gap-2 border-b border-[var(--color-glass-border)] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-text-tertiary)] opacity-50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-text-tertiary)] opacity-50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-text-tertiary)] opacity-50" />
            <span className="mx-auto flex max-w-[280px] items-center gap-2 rounded-full bg-[var(--color-glass-fill)] px-3 py-1 text-[11px] text-[var(--color-text-tertiary)]">
              <span>auxance.dev/work/{project.slug}</span>
            </span>
          </div>
          <div
            className="grid h-[280px] place-items-center md:h-[480px] lg:h-[600px]"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, rgba(140,178,255,0.12), transparent 50%), radial-gradient(circle at 70% 80%, rgba(191,140,255,0.10), transparent 50%)',
            }}
          >
            <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              Demo placeholder
            </span>
          </div>
        </div>
      </section>

      {/* 01 Context */}
      {ctx.length > 0 && (
        <section className="mx-auto max-w-[880px] px-6 py-[80px] md:py-[120px]">
          <SectionLabel n="01" title={t('context')} />
          <div className="mt-10 flex flex-col gap-6">
            {ctx.map((p, i) => (
              <p key={i} className="text-[17px] leading-[1.68] text-[var(--color-text-secondary)]">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* 02 Architecture */}
      {architecture.length > 0 && (
        <section className="mx-auto max-w-[1120px] px-6 py-[80px] md:py-[120px] md:px-12">
          <SectionLabel n="02" title={t('architecture')} />
          <ul className="mt-10 flex flex-col">
            {architecture.map((layer, i) => (
              <li
                key={i}
                className="grid grid-cols-1 gap-2 border-t border-[var(--color-glass-border)] py-6 md:grid-cols-[200px_1fr] md:gap-12"
              >
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {layer.layer}
                </span>
                <div>
                  <p className="text-[19px] font-medium leading-[1.4] text-[var(--color-text-primary)]">
                    {layer.primary}
                  </p>
                  <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-text-secondary)]">
                    {loc === 'fr' ? layer.notesFr : layer.notesEn}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 03 Process */}
      {decisions.length > 0 && (
        <section className="mx-auto max-w-[880px] px-6 py-[80px] md:py-[120px]">
          <SectionLabel n="03" title={t('process')} />
          <ol className="mt-10 flex flex-col gap-12">
            {decisions.map((d) => (
              <li key={d.n} className="flex flex-col gap-3">
                <span
                  className="font-mono text-[14px] tracking-[0.06em] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {d.n}
                </span>
                <h3
                  className="text-[22px] md:text-[24px] font-medium leading-[1.18] text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                >
                  {loc === 'fr' ? d.titleFr : d.titleEn}
                </h3>
                <p className="max-w-[700px] text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">
                  {loc === 'fr' ? d.bodyFr : d.bodyEn}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 04 Outcome */}
      {lessons.length > 0 && (
        <section className="mx-auto max-w-[880px] px-6 py-[80px] md:py-[120px]">
          <SectionLabel n="04" title={t('outcome')} />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {lessons.map((l, i) => (
              <GlassCard key={i} noHover className="flex flex-col gap-4">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {l.label}
                </span>
                <p className="text-[14px] leading-[1.7] text-[var(--color-text-secondary)]">
                  {loc === 'fr' ? l.textFr : l.textEn}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* Prev/Next */}
      <section className="mx-auto max-w-[1280px] px-6 pt-16 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-glass-border)] pt-8 md:grid-cols-2">
          {prev ? (
            <Link href={`/${locale}/work/${prev.slug}`} className="group flex flex-col gap-1">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                ← {t('prev')}
              </span>
              <span className="text-[18px] font-medium text-[var(--color-text-primary)] group-hover:opacity-80">
                {loc === 'fr' ? prev.nameFr : prev.nameEn}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/${locale}/work/${next.slug}`}
              className="group flex flex-col items-start gap-1 md:items-end md:text-right"
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {t('next')} →
              </span>
              <span className="text-[18px] font-medium text-[var(--color-text-primary)] group-hover:opacity-80">
                {loc === 'fr' ? next.nameFr : next.nameEn}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>
    </>
  );
}

function SectionLabel({ n: _n, title }: { n: string; title: string }) {
  return (
    <h2
      className="text-[32px] md:text-[40px] font-semibold leading-[1.08] text-[var(--color-text-primary)]"
      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
    >
      {title}
    </h2>
  );
}

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      <span className="text-[14px] text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}
