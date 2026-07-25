import type { CSSProperties, ReactNode } from 'react';
import '../globals.css';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap', weight: ['400', '500', '600', '700'] });

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} min-h-screen bg-[#0b0b0d] text-[#e8e8ea]`}
      style={{
        '--color-bg': '#0B0B0D',
        '--color-bg-elevated': '#0E0E11',
        '--color-text-primary': '#E8E8EA',
        '--color-text-secondary': '#909099',
        '--color-text-tertiary': '#5F5F68',
        '--color-glass-fill': 'rgba(255,255,255,0.035)',
        '--color-glass-fill-hover': 'rgba(255,255,255,0.055)',
        '--color-glass-border': 'rgba(255,255,255,0.075)',
        '--color-glass-border-hover': 'rgba(255,255,255,0.13)',
        colorScheme: 'dark',
      } as CSSProperties}
    >
      {children}
    </div>
  );
}
