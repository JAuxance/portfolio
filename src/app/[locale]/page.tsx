import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { locales } from '@/lib/i18n-config';
import { Hero } from './(sections)/hero';
import { NowSection } from './(sections)/now';
import { WorkSection } from './(sections)/work';
import { ResearchSection } from './(sections)/research';
import { TrajectorySection } from './(sections)/trajectory';
import { ContactSection } from './(sections)/contact';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as 'en' | 'fr';

  const [profile, nowItems, projects, research, references, stations] = await Promise.all([
    db.profile.findFirst(),
    db.nowItem.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.project.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.researchTopic.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.reference.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.trajectoryStation.findMany({ orderBy: { order: 'asc' } }),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-[640px] px-6 pt-40 pb-20 text-[var(--color-text-secondary)]">
        <p>Profile not seeded yet. Run <code className="font-mono">pnpm db:seed</code>.</p>
      </div>
    );
  }

  const abstract = loc === 'fr' ? profile.abstractFr : profile.abstractEn;

  const updated = profile.updatedAt;
  const month = new Intl.DateTimeFormat(loc === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' }).format(updated);
  const year = String(updated.getFullYear());

  return (
    <>
      <Hero abstract={abstract} locale={loc} />
      <NowSection items={nowItems} locale={loc} updatedMonth={month} updatedYear={year} />
      <WorkSection projects={projects} locale={loc} />
      <ResearchSection topics={research} references={references} locale={loc} />
      <TrajectorySection stations={stations} locale={loc} />
      <ContactSection profile={profile} locale={loc} />
    </>
  );
}
