import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ChapterStatus } from '@prisma/client';
import { RichText } from '@/components/book/rich-text';
import { db } from '@/lib/db';
import { countBookWords } from '@/lib/book-html';
import { locales } from '@/lib/i18n-config';

interface ChapterPageProps {
  params: Promise<{ locale: string; chapter: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { locale, chapter: chapterSlug } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as 'en' | 'fr';

  const [chapter, t] = await Promise.all([
    db.chapter.findFirst({
      where: {
        slug: chapterSlug,
        status: ChapterStatus.PUBLISHED,
        book: { published: true },
      },
      include: {
        book: {
          include: {
            chapters: {
              where: { status: ChapterStatus.PUBLISHED },
              orderBy: { order: 'asc' },
              select: { id: true, slug: true, title: true },
            },
          },
        },
      },
    }),
    getTranslations({ locale, namespace: 'book' }),
  ]);
  if (!chapter) notFound();

  const index = chapter.book.chapters.findIndex((item) => item.id === chapter.id);
  const previous = index > 0 ? chapter.book.chapters[index - 1] : null;
  const next =
    index >= 0 && index < chapter.book.chapters.length - 1
      ? chapter.book.chapters[index + 1]
      : null;
  const words = countBookWords(chapter.content);
  const minutes = Math.max(1, Math.ceil(words / 220));
  const publishedDate = chapter.publishedAt
    ? new Intl.DateTimeFormat(loc === 'fr' ? 'fr-FR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(chapter.publishedAt)
    : null;

  return (
    <div className="relative px-4 pt-[92px] pb-24 md:px-8 md:pt-[116px]">
      <article className="book-reading-paper mx-auto max-w-[980px] overflow-hidden rounded-[4px]">
        <div className="flex items-center justify-between border-b border-[#e7e3da] px-6 py-4 md:px-10">
          <Link
            href={`/${locale}/book`}
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#4f4b45] transition-opacity hover:opacity-60"
          >
            <ArrowLeft size={13} />
            {chapter.book.title}
          </Link>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">
            {t('chapter')} {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <header className="mx-auto max-w-[760px] px-6 pt-16 pb-12 md:px-10 md:pt-24 md:pb-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857d]">
            {chapter.book.status === 'PAUSED' ? t('pausedEyebrow') : t('eyebrow')}
          </p>
          <h1 className="mt-5 font-[var(--font-book)] text-[46px] font-bold leading-[0.98] tracking-[-0.05em] text-[#22211f] md:text-[72px]">
            {chapter.title}
          </h1>
          {chapter.summary && (
            <p className="mt-7 max-w-[680px] font-[var(--font-book)] text-[21px] italic leading-[1.5] text-[#625e57] md:text-[24px]">
              {chapter.summary}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-[#e7e3da] py-4 text-[10px] uppercase tracking-[0.11em] text-[#8a857d]">
            <span>Auxance Jourdan</span>
            <span aria-hidden>·</span>
            {publishedDate && (
              <>
                <time dateTime={chapter.publishedAt?.toISOString()}>
                  {publishedDate}
                </time>
                <span aria-hidden>·</span>
              </>
            )}
            <span>
              {minutes} {t('minuteRead')}
            </span>
            <span aria-hidden>·</span>
            <span>
              {words.toLocaleString(loc === 'fr' ? 'fr-FR' : 'en-US')}{' '}
              {t('words')}
            </span>
          </div>
        </header>

        <RichText content={chapter.content} className="mx-auto max-w-[720px] px-6 pb-20 md:px-10 md:pb-24" />

        <nav className="border-t border-[#e7e3da] px-6 py-8 md:px-10">
          <div className="mx-auto grid max-w-[760px] gap-3 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/${locale}/book/${previous.slug}`}
                className="group border border-[#e2ded6] p-5 transition-colors hover:bg-[#f4f1eb]"
              >
                <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#8a857d]">
                  <ArrowLeft size={12} />
                  {t('previous')}
                </span>
                <span className="mt-3 block font-[var(--font-book)] text-[18px] font-semibold leading-tight text-[#24221f]">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/${locale}/book/${next.slug}`}
                className="group border border-[#e2ded6] p-5 text-right transition-colors hover:bg-[#f4f1eb]"
              >
                <span className="flex items-center justify-end gap-2 text-[9px] uppercase tracking-[0.14em] text-[#8a857d]">
                  {t('next')}
                  <ArrowRight size={12} />
                </span>
                <span className="mt-3 block font-[var(--font-book)] text-[18px] font-semibold leading-tight text-[#24221f]">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </article>
    </div>
  );
}
