'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { reveal, revealFadeOnly, duration } from '@/lib/motion';

interface SectionRevealProps {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
  id?: string;
  delay?: number;
}

export function SectionReveal({
  children,
  index = 0,
  className,
  as = 'div',
  id,
  delay,
}: SectionRevealProps) {
  const reduced = useReducedMotion();
  const variants = reduced ? revealFadeOnly : reveal;
  const MotionComp =
    as === 'section'
      ? motion.section
      : as === 'article'
      ? motion.article
      : as === 'li'
      ? motion.li
      : motion.div;

  return (
    <MotionComp
      id={id}
      className={className}
      variants={variants}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20%' }}
      transition={delay ? { delay, duration: duration.gentle } : undefined}
    >
      {children}
    </MotionComp>
  );
}
