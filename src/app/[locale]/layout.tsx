import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { ScrollScene } from '@/components/public/scroll-scene';
import { GlowBackdrop } from '@/components/public/atmospheric-glow';
import { locales } from '@/lib/i18n-config';
import { db } from '@/lib/db';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();

  setRequestLocale(locale);
  const [messages, publishedBooks] = await Promise.all([
    getMessages(),
    db.book.count({ where: { published: true } }),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="relative min-h-screen overflow-hidden">
        <GlowBackdrop />
        <ScrollScene />
        <Header showBook={publishedBooks > 0} />
        <main className="relative z-10">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
