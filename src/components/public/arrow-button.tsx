'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { duration, ease } from '@/lib/motion';

interface ArrowButtonProps {
  size?: number;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  direction?: 'up-right' | 'right' | 'left';
}

export function ArrowButton({
  size = 36,
  onClick,
  ariaLabel = 'Submit',
  className,
  direction = 'up-right',
}: ArrowButtonProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={
        reduced
          ? undefined
          : {
              scale: 1.06,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.18), 0 0 16px rgba(255,255,255,0.08)',
            }
      }
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={{ duration: duration.quick, ease: ease.spring }}
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'bg-[var(--color-text-primary)] text-[var(--color-bg)] border border-[var(--color-glass-border-hover)]',
        'cursor-pointer select-none',
        className
      )}
    >
      {direction === 'up-right' && (
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 14 14" fill="none">
          <path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {direction === 'right' && (
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 14 14" fill="none">
          <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {direction === 'left' && (
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 14 14" fill="none">
          <path d="M11 7H3M3 7L7 3M3 7L7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </motion.button>
  );
}
