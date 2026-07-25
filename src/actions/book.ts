'use server';

import { revalidatePath } from 'next/cache';
import { ChapterStatus, BookStatus, Locale } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseInput } from '@/lib/validate';

const BookInput = z.object({
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(180),
  subtitle: z.string().max(240).nullable(),
  description: z.string().max(4000).nullable(),
  language: z.nativeEnum(Locale),
  status: z.nativeEnum(BookStatus),
  targetWords: z.number().int().min(0).max(2_000_000),
  published: z.boolean(),
});

const ChapterInput = z.object({
  slug: z.string().min(1).max(140),
  title: z.string().min(1).max(220),
  summary: z.string().max(1200).nullable(),
  content: z.string().max(2_000_000),
  status: z.nativeEnum(ChapterStatus),
});

type BookInputType = z.infer<typeof BookInput>;
type ChapterInputType = z.infer<typeof ChapterInput>;

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error('unauthorized');
}

function slugify(value: string, fallback: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function invalidate(bookSlug?: string, chapterSlug?: string) {
  revalidatePath('/admin/book');
  revalidatePath('/', 'layout');
  if (bookSlug) {
    revalidatePath('/fr/book');
    revalidatePath('/en/book');
  }
  if (bookSlug && chapterSlug) {
    revalidatePath(`/fr/book/${chapterSlug}`);
    revalidatePath(`/en/book/${chapterSlug}`);
  }
}

export async function updateBook(id: string, input: BookInputType) {
  await requireAuth();
  const data = parseInput(BookInput, {
    ...input,
    slug: slugify(input.slug, 'mon-livre'),
    subtitle: input.subtitle?.trim() || null,
    description: input.description?.trim() || null,
  });
  const book = await db.book.update({ where: { id }, data });
  invalidate(book.slug);
  return { ok: true as const, data: book };
}

export async function createChapter(bookId: string) {
  await requireAuth();
  const book = await db.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error('book not found');
  const last = await db.chapter.findFirst({
    where: { bookId },
    orderBy: { order: 'desc' },
  });
  const order = (last?.order ?? -1) + 1;
  const chapterNumber = order + 1;
  const chapter = await db.chapter.create({
    data: {
      bookId,
      order,
      title: `Chapitre ${chapterNumber}`,
      slug: `chapitre-${chapterNumber}`,
      content: '',
      status: ChapterStatus.DRAFT,
    },
  });
  invalidate(book.slug, chapter.slug);
  return { ok: true as const, data: chapter };
}

export async function updateChapter(id: string, input: ChapterInputType) {
  await requireAuth();
  const current = await db.chapter.findUnique({
    where: { id },
    include: { book: { select: { slug: true } } },
  });
  if (!current) throw new Error('chapter not found');

  const parsed = parseInput(ChapterInput, {
    ...input,
    slug: slugify(input.slug, `chapitre-${current.order + 1}`),
    summary: input.summary?.trim() || null,
  });
  const data = {
    ...parsed,
    content: sanitizeHtml(parsed.content, {
      allowedTags: [
        'p',
        'br',
        'h2',
        'h3',
        'h4',
        'strong',
        'em',
        's',
        'u',
        'blockquote',
        'ul',
        'ol',
        'li',
        'pre',
        'code',
        'hr',
        'a',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        p: ['style'],
        h2: ['style'],
        h3: ['style'],
        h4: ['style'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedStyles: {
        '*': {
          'text-align': [/^(?:left|center|right|justify)$/],
        },
      },
    }),
  };
  const chapter = await db.chapter.update({
    where: { id },
    data: {
      ...data,
      publishedAt:
        data.status === ChapterStatus.PUBLISHED
          ? current.publishedAt ?? new Date()
          : null,
    },
  });
  invalidate(current.book.slug, chapter.slug);
  if (current.slug !== chapter.slug) invalidate(current.book.slug, current.slug);
  return { ok: true as const, data: chapter };
}

export async function deleteChapter(id: string) {
  await requireAuth();
  const chapter = await db.chapter.findUnique({
    where: { id },
    include: { book: { select: { slug: true } } },
  });
  if (!chapter) return { ok: true as const };
  await db.chapter.delete({ where: { id } });
  invalidate(chapter.book.slug, chapter.slug);
  return { ok: true as const };
}

export async function reorderChapters(bookId: string, orderedIds: string[]) {
  await requireAuth();
  const chapters = await db.chapter.findMany({
    where: { bookId, id: { in: orderedIds } },
    select: { id: true },
  });
  if (chapters.length !== orderedIds.length) throw new Error('invalid chapter order');
  await db.$transaction(
    orderedIds.map((id, order) =>
      db.chapter.update({ where: { id }, data: { order } })
    )
  );
  const book = await db.book.findUnique({ where: { id: bookId }, select: { slug: true } });
  invalidate(book?.slug);
  return { ok: true as const };
}
