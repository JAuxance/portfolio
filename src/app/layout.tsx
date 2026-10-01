import './globals.css';
import {
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Source_Serif_4,
} from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies, headers } from 'next/headers';
import { ThemeProvider, themePreflightScript } from '@/components/public/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

const description =
  'Full-stack developer in training (Flask, PostgreSQL, Docker), preparing for AI/ML and research. Small projects built end to end, and notes on what I actually ended up understanding.';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    'localhost:3000';
  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${protocol}://${host}`;
  const socialImage = new URL('/og-v2.png', origin).toString();

  return {
    metadataBase: new URL(origin),
    title: 'Auxance Jourdan — Portfolio',
    description,
    openGraph: {
      title: 'Auxance / Portfolio',
      description,
      type: 'website',
      images: [{ url: socialImage, width: 1200, height: 630, alt: 'Auxance Jourdan — Full-stack. ML.' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Auxance / Portfolio',
      description,
      images: [socialImage],
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('portfolio-theme')?.value;
  const initialTheme: 'dark' | 'light' = themeCookie === 'light' ? 'light' : 'dark';

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} ${sourceSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themePreflightScript }} />
      </head>
      <body>
        <ThemeProvider initial={initialTheme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
