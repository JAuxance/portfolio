import type { ReactNode } from 'react';
import '../globals.css';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap', weight: ['400', '500', '600', '700'] });

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} min-h-screen bg-[var(--color-bg)]`}>
      {children}
    </div>
  );
}
