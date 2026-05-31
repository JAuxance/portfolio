import './globals.css';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
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

export const metadata: Metadata = {
  title: 'Auxance Jourdan — Portfolio',
  description:
    'Full-stack student at Holberton transitioning toward ML research. Building production systems by day, training myself toward research by night.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('portfolio-theme')?.value;
  const initialTheme: 'dark' | 'light' = themeCookie === 'light' ? 'light' : 'dark';

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${inter.variable} ${interTight.variable} ${jetbrains.variable}`}
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
