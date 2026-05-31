'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { duration, ease } from '@/lib/motion';

interface ChipProps {
  children: ReactNode;
  onClick?: () => void;
  arrow?: boolean;
  className?: string;
}

export function Chip({ children, onClick, arrow = true, className }: ChipProps) {
  const reduced = useReducedMotion();
  const Component = onClick ? motion.button : motion.span;

  return (
    <Component
      onClick={onClick}
      whileHover={reduced ? undefined : { scale: 1.04, y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: duration.quick, ease: ease.outQuint }}
      className={cn(
        'glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-mono tracking-wide text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
        'border border-white/[0.08] hover:border-white/[0.14] bg-white/[0.04] hover:bg-white/[0.06]',
        'transition-colors cursor-pointer select-none',
        className
      )}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span>{children}</span>
      {arrow && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-60">
          <path
            d="M3 7L7 3M7 3H3.5M7 3V6.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Component>
  );
}
