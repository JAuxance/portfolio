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
  'Full-stack student at Holberton transitioning toward ML research. Building production systems, writing in public, and documenting the road toward research.';

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
  const socialImage = new URL('/og.png', origin).toString();

  return {
    metadataBase: new URL(origin),
    title: 'Auxance Jourdan — Portfolio',
    description,
    openGraph: {
      title: 'Auxance / Portfolio — Writing in public.',
      description,
      type: 'website',
      images: [{ url: socialImage, width: 1715, height: 909, alt: 'Auxance — Writing in public.' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Auxance / Portfolio — Writing in public.',
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
