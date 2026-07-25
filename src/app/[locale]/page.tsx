import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { countBookWords } from '@/lib/book-html';
import { locales } from '@/lib/i18n-config';
import { Hero } from './(sections)/hero';
import { NowSection } from './(sections)/now';
import { BookSection } from './(sections)/book';
import { WorkSection } from './(sections)/work';
import { ContactSection } from './(sections)/contact';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as 'en' | 'fr';

  const [profile, nowItems, projects, book] = await Promise.all([
    db.profile.findFirst(),
    db.nowItem.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.project.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.book.findFirst({
      where: { published: true },
      include: { chapters: { orderBy: { order: 'asc' } } },
    }),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-[640px] px-6 pt-40 pb-20 text-[var(--color-text-secondary)]">
        <p>
          Profile not seeded yet. Run{' '}
          <code className="font-mono">pnpm db:seed</code>.
        </p>
      </div>
    );
  }

  const abstract = loc === 'fr' ? profile.abstractFr : profile.abstractEn;

  return (
    <>
      <Hero abstract={abstract} locale={loc} hasBook={Boolean(book)} />
      <NowSection items={nowItems} locale={loc} />
      {book && (
        <BookSection
          locale={loc}
          book={{
            title: book.title,
            subtitle: book.subtitle,
            description: book.description,
            targetWords: book.targetWords,
            totalWords: book.chapters.reduce(
              (total, chapter) => total + countBookWords(chapter.content),
              0
            ),
            publishedChapters: book.chapters.filter(
              (chapter) => chapter.status === 'PUBLISHED'
            ).length,
          }}
        />
      )}
      <WorkSection projects={projects} locale={loc} githubUrl={profile.github} />
      <ContactSection profile={profile} locale={loc} />
    </>
  );
}
