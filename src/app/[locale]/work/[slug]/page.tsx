import { notFound } from 'next/navigation';
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { locales } from '@/lib/i18n-config';
import { isVideoUrl } from '@/lib/media';
import { StatusPill } from '@/components/public/status-pill';
import { ProjectStage, type StageScene } from '@/components/public/project-stage';
import { BuildIn } from '@/components/public/build-in';
import { CtaPill } from '@/components/public/section-cta';
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

  const scenes: StageScene[] = [
    ...(ctx.length > 0 ? [{ kind: 'text' as const, label: t('context'), paragraphs: ctx }] : []),
    ...(architecture.length > 0
      ? [
          {
            kind: 'layers' as const,
            label: t('architecture'),
            layers: architecture.map((l) => ({
              layer: l.layer,
              primary: l.primary,
              notes: loc === 'fr' ? l.notesFr : l.notesEn,
            })),
          },
        ]
      : []),
    ...decisions.map((d) => ({
      kind: 'step' as const,
      label: t('process'),
      n: d.n,
      title: loc === 'fr' ? d.titleFr : d.titleEn,
      body: loc === 'fr' ? d.bodyFr : d.bodyEn,
    })),
    ...(lessons.length > 0
      ? [
          {
            kind: 'facts' as const,
            label: t('outcome'),
            facts: lessons.map((l) => ({ label: l.label, text: loc === 'fr' ? l.textFr : l.textEn })),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Hero — each block "builds" in sequence; keyed by slug so swapping
          projects (Prev/Next) replays the construction. */}
      <section className="mx-auto flex min-h-[92svh] max-w-[1280px] flex-col justify-center px-6 pt-[120px] pb-16 md:px-12 md:pt-[140px] lg:px-20">
        <BuildIn key={`${slug}-back`} index={0}>
          <Link
            href={`/${locale}#work`}
            className="mb-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ← {t('back')}
          </Link>
        </BuildIn>

        <BuildIn key={`${slug}-status`} index={1} className="mb-6 flex items-center gap-4">
          <StatusPill status={project.status} locale={loc} withPill />
        </BuildIn>

        <BuildIn key={`${slug}-name`} index={2}>
          <h1
            className="mb-8 text-[52px] md:text-[96px] lg:text-[132px] font-semibold leading-[0.95] text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
          >
            {name}
          </h1>
        </BuildIn>

        <BuildIn key={`${slug}-tagline`} index={3}>
          <p
            className="max-w-[800px] text-[18px] md:text-[22px] leading-[1.45] text-[var(--color-text-secondary)]"
            style={{ letterSpacing: '-0.015em' }}
          >
            {tagline}
          </p>
        </BuildIn>

        {(project.repoUrl || project.liveUrl) && (
          <BuildIn key={`${slug}-actions`} index={4} className="mt-8 flex flex-wrap items-center gap-3">
            {/* The rarer destination gets the solid pill; the other stays glass. */}
            {project.liveUrl ? (
              <>
                <CtaPill href={project.liveUrl} label={t('live')} variant="solid" />
                {project.repoUrl && <CtaPill href={project.repoUrl} label={t('code')} variant="glass" />}
              </>
            ) : (
              project.repoUrl && <CtaPill href={project.repoUrl} label={t('code')} variant="solid" />
            )}
          </BuildIn>
        )}

        <BuildIn
          key={`${slug}-meta`}
          index={5}
          className="mt-14 grid grid-cols-2 gap-6 border-t border-[var(--color-glass-border)] pt-6 md:grid-cols-4 md:gap-8"
        >
          <MetaCol label={t('timeline')} value={timeline ?? '—'} />
          <MetaCol label={t('role')} value={role ?? '—'} />
          <MetaCol label={t('team')} value={team ?? '—'} />
          <MetaCol label={t('contextLabel')} value={contextLabel ?? '—'} />
        </BuildIn>
      </section>

      {/* The story: a pinned, full-screen film driven by scroll. */}
      <ProjectStage
        key={`${slug}-stage`}
        name={name}
        media={project.heroImage ? { src: project.heroImage, video: isVideoUrl(project.heroImage) } : null}
        href={project.liveUrl ?? project.repoUrl}
        hrefLabel={project.liveUrl ? t('live') : t('code')}
        scenes={scenes}
      />

      {/* Prev/Next */}
      <BuildIn key={`${slug}-prevnext`} inView>
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
              className="group flex flex-col items-start gap-2 md:items-end md:text-right"
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {t('next')} →
              </span>
              <span
                className="text-[36px] font-semibold leading-[1] text-[var(--color-text-primary)] transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-x-2 md:text-[64px]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
              >
                {loc === 'fr' ? next.nameFr : next.nameEn}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>
      </BuildIn>
    </>
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
