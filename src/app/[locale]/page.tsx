import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { locales } from '@/lib/i18n-config';
import { getJournalPosts } from '@/lib/substack';
import { Hero } from './(sections)/hero';
import { NowSection } from './(sections)/now';
import { WorkSection } from './(sections)/work';
import { JournalSection } from './(sections)/journal';
import { ContactSection } from './(sections)/contact';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as 'en' | 'fr';

  const [profile, nowItems, projects, journalPosts] = await Promise.all([
    db.profile.findFirst(),
    db.nowItem.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.project.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    getJournalPosts(),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-[640px] px-6 pt-40 pb-20 text-[var(--color-text-secondary)]">
        <p>Profile not seeded yet. Run <code className="font-mono">pnpm db:seed</code>.</p>
      </div>
    );
  }

  const abstract = loc === 'fr' ? profile.abstractFr : profile.abstractEn;

  return (
    <>
      <Hero abstract={abstract} locale={loc} />
      <NowSection items={nowItems} locale={loc} />
      <JournalSection posts={journalPosts} locale={loc} />
      <WorkSection projects={projects} locale={loc} githubUrl={profile.github} />
      <ContactSection profile={profile} locale={loc} />
    </>
  );
}
