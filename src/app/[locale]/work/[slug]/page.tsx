import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { locales } from '@/lib/i18n-config';
import { StatusPill } from '@/components/public/status-pill';
import { ProjectStage, type StageScene } from '@/components/public/project-stage';
import { CtaPill } from '@/components/public/section-cta';
import type { ArchitectureLayer } from '@/types/content';

/** Demo videos per project, served from public/projects. */
const PROJECT_VIDEOS: Record<string, { src: string; poster?: string; ratio: 'landscape' | 'portrait' }[]> = {
  manager: [
    { src: '/projects/manager-launch-16x9.mp4', poster: '/projects/manager-launch-16x9.webp', ratio: 'landscape' },
    { src: '/projects/manager-launch-9x16.mp4', poster: '/projects/manager-launch-9x16.webp', ratio: 'portrait' },
  ],
};

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
    select: { slug: true, nameEn: true, nameFr: true },
  });

  const name = loc === 'fr' ? project.nameFr : project.nameEn;
  const tagline = loc === 'fr' ? project.taglineFr : project.taglineEn;
  const ctx = loc === 'fr' ? project.contextFr : project.contextEn;
  const timeline = loc === 'fr' ? project.timelineFr : project.timelineEn;
  const role = loc === 'fr' ? project.roleFr : project.roleEn;
  const team = loc === 'fr' ? project.teamFr : project.teamEn;
  const contextLabel = loc === 'fr' ? project.contextLabelFr : project.contextLabelEn;
  const architecture = (project.architecture as unknown as ArchitectureLayer[] | null) ?? [];

  const scenes: StageScene[] = [
    ...(ctx.length > 0 ? [{ kind: 'text' as const, label: t('context'), paragraphs: ctx }] : []),
    ...(PROJECT_VIDEOS[slug] ? [{ kind: 'videos' as const, label: t('demo'), videos: PROJECT_VIDEOS[slug] }] : []),
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
  ];

  return (
    <>
      {/* One pinned, centered view: intro first, then each chapter in place. */}
      <ProjectStage
        key={`${slug}-stage`}
        backHref={`/${locale}#work`}
        backLabel={t('back')}
        dev={{
          locale: loc,
          slug,
          projects: all.map((p) => ({ slug: p.slug, name: loc === 'fr' ? p.nameFr : p.nameEn })),
          repoUrl: project.repoUrl,
          liveUrl: project.liveUrl,
        }}
        scenes={scenes}
        outro={
          project.repoUrl || project.liveUrl ? (
            <div className="flex flex-col items-center gap-8">
              <h2
                className="text-[40px] font-semibold leading-[1] text-[var(--color-text-primary)] md:text-[72px]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
              >
                {name}
              </h2>
              {(project.repoUrl || project.liveUrl) && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {project.liveUrl ? (
                    <>
                      <CtaPill href={project.liveUrl} label={t('live')} variant="solid" />
                      {project.repoUrl && <CtaPill href={project.repoUrl} label={t('code')} variant="glass" />}
                    </>
                  ) : (
                    project.repoUrl && <CtaPill href={project.repoUrl} label={t('code')} variant="solid" />
                  )}
                </div>
              )}
            </div>
          ) : null
        }
        intro={
          <div className="flex max-w-[1000px] flex-col items-center gap-6">
            <StatusPill status={project.status} locale={loc} withPill />
            <h1
              className="text-[52px] font-semibold leading-[0.95] text-[var(--color-text-primary)] md:text-[96px] lg:text-[120px]"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
            >
              {name}
            </h1>
            <p
              className="max-w-[720px] text-[17px] leading-[1.45] text-[var(--color-text-secondary)] md:text-[21px]"
              style={{ letterSpacing: '-0.015em' }}
            >
              {tagline}
            </p>

            {project.stack.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-2">
                {project.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-[var(--color-glass-border-hover)] px-3 py-1 font-mono text-[11px] text-[var(--color-text-secondary)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid w-full grid-cols-2 gap-x-8 gap-y-5 border-t border-[var(--color-glass-border)] pt-6 text-left md:grid-cols-4">
              <MetaCol label={t('timeline')} value={timeline ?? '—'} />
              <MetaCol label={t('role')} value={role ?? '—'} />
              <MetaCol label={t('team')} value={team ?? '—'} />
              <MetaCol label={t('contextLabel')} value={contextLabel ?? '—'} />
            </div>
          </div>
        }
      />

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
