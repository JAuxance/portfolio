'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { hoverCard, duration, ease } from '@/lib/motion';

interface GlassCardProps {
  children: ReactNode;
  href?: string;
  featured?: boolean;
  className?: string;
  as?: 'div' | 'a' | 'article';
  noHover?: boolean;
}

export function GlassCard({
  children,
  href,
  featured,
  className,
  as = 'div',
  noHover,
}: GlassCardProps) {
  const reduced = useReducedMotion();

  const cls = cn(
    'glass group relative h-full overflow-hidden transition-colors',
    featured ? 'p-6 md:p-7 lg:p-9' : 'p-5 md:p-6',
    !noHover && 'glass-hover cursor-default',
    href && 'cursor-pointer',
    className
  );

  const inner = (
    <motion.div
      variants={!reduced && !noHover ? hoverCard : undefined}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      animate="rest"
      transition={{ duration: duration.standard, ease: ease.outQuint }}
      className={cls}
      style={{
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 6%, transparent)',
      }}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block h-full">
        {inner}
      </a>
    );
  }
  if (as === 'article') {
    return <article className="h-full">{inner}</article>;
  }
  return inner;
}
