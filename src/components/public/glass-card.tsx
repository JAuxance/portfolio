'use client';

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { hoverCard, duration, ease } from '@/lib/motion';

const MAX_TILT = 5; // degrees — subtle, the card dips toward the cursor
const TILT_SPRING = { stiffness: 180, damping: 18, mass: 0.4 };

interface GlassCardProps {
  children: ReactNode;
  href?: string;
  featured?: boolean;
  className?: string;
  as?: 'div' | 'a' | 'article';
  noHover?: boolean;
  /** 3D-tilt toward the cursor on hover (project cards). */
  tilt?: boolean;
  /** Skip the idle breathing (e.g. cards already moving in the Now marquee). */
  noBreathe?: boolean;
}

export function GlassCard({
  children,
  href,
  featured,
  className,
  as = 'div',
  noHover,
  tilt,
  noBreathe,
}: GlassCardProps) {
  const reduced = useReducedMotion();

  // Normalized cursor position over the card (0..1), springed into a tilt.
  // The corner under the cursor dips away, as if the card leans toward it.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [MAX_TILT, -MAX_TILT]), TILT_SPRING);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-MAX_TILT, MAX_TILT]), TILT_SPRING);

  const tiltActive = !!tilt && !reduced && !noHover;

  const handleTiltMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const resetTilt = () => {
    mx.set(0.5);
    my.set(0.5);
  };

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
      onMouseMove={tiltActive ? handleTiltMove : undefined}
      onMouseLeave={tiltActive ? resetTilt : undefined}
      className={cls}
      style={{
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 6%, transparent)',
        ...(tiltActive ? { rotateX, rotateY, transformPerspective: 900 } : {}),
      }}
    >
      {children}
    </motion.div>
  );

  const breathing = noBreathe ? (
    <div className="h-full">{inner}</div>
  ) : (
    <div className="card-breathe h-full">{inner}</div>
  );

  // NOTE: href renders a raw <a> wrapper — never nest another anchor inside
  // a linked card (invalid HTML). ↗ is reserved site-wide for external links.
  if (href) {
    return (
      <a href={href} className="block h-full">
        {breathing}
      </a>
    );
  }
  if (as === 'article') {
    return <article className="h-full">{breathing}</article>;
  }
  return breathing;
}
