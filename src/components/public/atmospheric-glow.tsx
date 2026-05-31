'use client';

import { cn } from '@/lib/cn';
import { useTheme } from './theme-provider';

type Color = 'coolBlue' | 'warmAmber' | 'softViolet' | 'warmOrange' | 'white';

const COLOR_MAP_DARK: Record<Color, string> = {
  coolBlue: 'rgba(140, 178, 255, 0.10)',
  warmAmber: 'rgba(255, 217, 153, 0.09)',
  softViolet: 'rgba(191, 140, 255, 0.09)',
  warmOrange: 'rgba(255, 170, 120, 0.08)',
  white: 'rgba(255, 255, 255, 0.07)',
};

const COLOR_MAP_LIGHT: Record<Color, string> = {
  coolBlue: 'rgba(96, 130, 255, 0.18)',
  warmAmber: 'rgba(255, 188, 88, 0.16)',
  softViolet: 'rgba(170, 110, 255, 0.16)',
  warmOrange: 'rgba(255, 140, 80, 0.14)',
  white: 'rgba(14, 14, 16, 0.05)',
};

interface AtmosphericGlowProps {
  color: Color;
  x: string;
  y: string;
  size?: number;
  opacity?: number;
  className?: string;
}

export function AtmosphericGlow({ color, x, y, size = 800, opacity = 1, className }: AtmosphericGlowProps) {
  const { theme } = useTheme();
  const base = (theme === 'light' ? COLOR_MAP_LIGHT : COLOR_MAP_DARK)[color];
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute -z-0', className)}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        opacity,
        background: `radial-gradient(circle at center, ${base} 0%, transparent 65%)`,
        filter: 'blur(60px)',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

export function GlowBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AtmosphericGlow color="white" x="50%" y="280px" size={900} />
      <AtmosphericGlow color="coolBlue" x="15%" y="900px" size={700} />
      <AtmosphericGlow color="warmAmber" x="85%" y="1700px" size={700} />
      <AtmosphericGlow color="softViolet" x="20%" y="2700px" size={750} />
      <AtmosphericGlow color="warmOrange" x="80%" y="3700px" size={700} />
    </div>
  );
}
