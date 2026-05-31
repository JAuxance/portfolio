import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';
import { GlowBackdrop } from '@/components/public/atmospheric-glow';
import { locales } from '@/lib/i18n-config';

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
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="relative min-h-screen overflow-hidden">
        <GlowBackdrop />
        <Header />
        <main className="relative z-10">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
