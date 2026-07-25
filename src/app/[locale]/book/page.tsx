import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { ChapterStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { countBookWords } from '@/lib/book-html';
import { locales } from '@/lib/i18n-config';

interface BookPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as 'en' | 'fr';

  const [book, t] = await Promise.all([
    db.book.findFirst({
      where: { published: true },
      include: { chapters: { orderBy: { order: 'asc' } } },
    }),
    getTranslations({ locale, namespace: 'book' }),
  ]);
  if (!book) notFound();

  const publishedChapters = book.chapters.filter(
    (chapter) => chapter.status === ChapterStatus.PUBLISHED
  );
  const totalWords = book.chapters.reduce(
    (total, chapter) => total + countBookWords(chapter.content),
    0
  );
  const progress =
    book.targetWords > 0
      ? Math.min(100, Math.round((totalWords / book.targetWords) * 100))
      : 0;

  return (
    <div className="relative px-4 pt-[92px] pb-24 md:px-8 md:pt-[116px]">
      <main className="book-reading-paper mx-auto max-w-[980px] overflow-hidden rounded-[4px]">
        <div className="flex items-center justify-between border-b border-[#e7e3da] px-6 py-4 md:px-10">
          <Link
            href={`/${locale}`}
            className="text-[11px] font-semibold tracking-[-0.01em] text-[#4f4b45] transition-opacity hover:opacity-60"
          >
            Auxance Jourdan
          </Link>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">
            {t('eyebrow')}
          </span>
        </div>

        <header className="mx-auto max-w-[760px] px-6 pt-16 pb-14 text-center md:px-10 md:pt-24 md:pb-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857d]">
            {t('publication')}
          </p>
          <h1 className="mt-5 font-[var(--font-book)] text-[48px] font-bold leading-[0.95] tracking-[-0.05em] text-[#22211f] md:text-[76px]">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="mx-auto mt-6 max-w-[620px] font-[var(--font-book)] text-[21px] italic leading-[1.45] text-[#5f5b54] md:text-[25px]">
              {book.subtitle}
            </p>
          )}
          {book.description && (
            <p className="mx-auto mt-7 max-w-[620px] text-[14px] leading-[1.75] text-[#706b63]">
              {book.description}
            </p>
          )}

          <div className="mx-auto mt-10 max-w-[500px]">
            <div className="mb-2 flex justify-between text-[10px] text-[#8a857d]">
              <span>
                {totalWords.toLocaleString(loc === 'fr' ? 'fr-FR' : 'en-US')}{' '}
                {t('words')}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-px bg-[#ded9d0]">
              <div
                className="h-px bg-[#282622] transition-[width] duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <section className="border-t border-[#e7e3da] px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[740px]">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-[var(--font-book)] text-[27px] font-semibold tracking-[-0.025em] text-[#24221f]">
                {t('contents')}
              </h2>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#8a857d]">
                {publishedChapters.length} {t('chapters')}
              </span>
            </div>

            {publishedChapters.length > 0 ? (
              <ol className="border-b border-[#e2ded6]">
                {publishedChapters.map((chapter, index) => {
                  const words = countBookWords(chapter.content);
                  const minutes = Math.max(1, Math.ceil(words / 220));
                  return (
                    <li key={chapter.id} className="border-t border-[#e2ded6]">
                      <Link
                        href={`/${locale}/book/${chapter.slug}`}
                        className="group grid gap-4 py-8 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-start"
                      >
                        <span className="pt-1 text-[10px] text-[#9b958b]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="font-[var(--font-book)] text-[27px] font-semibold leading-[1.08] tracking-[-0.025em] text-[#24221f] transition-opacity group-hover:opacity-65 md:text-[31px]">
                            {chapter.title}
                          </h3>
                          {chapter.summary && (
                            <p className="mt-3 max-w-[570px] font-[var(--font-book)] text-[17px] leading-[1.5] text-[#706b63]">
                              {chapter.summary}
                            </p>
                          )}
                          <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-[#9b958b]">
                            {minutes} {t('minuteRead')} ·{' '}
                            {words.toLocaleString(
                              loc === 'fr' ? 'fr-FR' : 'en-US'
                            )}{' '}
                            {t('words')}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="mt-1 hidden text-[#9b958b] transition-transform group-hover:translate-x-1 sm:block"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="border-y border-[#e2ded6] py-10 text-center">
                <p className="font-[var(--font-book)] text-[18px] italic text-[#706b63]">
                  {t('draftNotice')}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
