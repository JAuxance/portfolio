'use client';

import { useMemo, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

interface ScrollTextProps {
  children: string;
  className?: string;
}

/**
 * Words light up one after the other as the paragraph travels up the
 * viewport — the reveal is bound to scroll position, so it also rewinds.
 */
export function ScrollText({ children, className }: ScrollTextProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(() => children.split(' '), [children]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 55%'],
  });

  if (reduced) return <p className={className}>{children}</p>;

  return (
    <p ref={ref} className={className} aria-label={children}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = Math.min(1, start + 1.5 / words.length);
        return (
          <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <>
      <motion.span aria-hidden className="inline-block" style={{ opacity }}>
        {children}
      </motion.span>{' '}
    </>
  );
}
