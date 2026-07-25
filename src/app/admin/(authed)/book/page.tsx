import { BookStatus, Locale } from '@prisma/client';
import { db } from '@/lib/db';
import { BookStudioClient } from './client';

export default async function BookPage() {
  let book = await db.book.findFirst({
    include: { chapters: { orderBy: { order: 'asc' } } },
  });

  if (!book) {
    book = await db.book.create({
      data: {
        slug: 'mon-livre',
        title: 'Mon livre',
        subtitle: 'Un manuscrit en construction',
        description:
          'J’écris ce livre en public, chapitre après chapitre. Cette page rassemble les textes que je choisis de partager.',
        language: Locale.FR,
        status: BookStatus.WRITING,
        targetWords: 50000,
        published: false,
      },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
  }

  return <BookStudioClient initialBook={book} />;
}
