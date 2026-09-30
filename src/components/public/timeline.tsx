'use client';

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import type { TrajectoryStation } from '@prisma/client';
import { cn } from '@/lib/cn';

interface TimelineProps {
  stations: TrajectoryStation[];
  locale: 'en' | 'fr';
  currentLabel: string;
}

export function Timeline({ stations, locale, currentLabel }: TimelineProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 60%', 'end 60%'],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={containerRef} className="relative pl-[30px] md:pl-[40px] lg:pl-[48px]">
      {/* vertical line — the dot wrappers are 24px boxes anchored at the
          container's left edge, so the dots' center is always 12px in.
          11.5px + 1px width centers the line under them at every breakpoint. */}
      <div
        aria-hidden
        className="absolute top-1.5 bottom-1.5 left-[11.5px] w-px bg-[var(--color-glass-border)]"
      />
      {/* the line draws itself as the reader scrolls */}
      <motion.div
        aria-hidden
        className="absolute top-1.5 bottom-1.5 left-[11.5px] w-px origin-top bg-[var(--color-text-primary)]/70"
        style={{ scaleY: reduced ? 1 : lineScale }}
      />
      <ol className="flex flex-col gap-12 md:gap-14">
        {stations.map((s) => {
          const inst = locale === 'fr' ? s.instFr : s.instEn;
          const obj = locale === 'fr' ? s.objFr : s.objEn;
          const isCurrent = s.state === 'CURRENT';
          const isGoal = s.state === 'GOAL';

          return (
            <Station key={s.id} reduced={!!reduced}>
              {/* dot */}
              <span
                aria-hidden
                className={cn(
                  'absolute top-1 -left-[30px] md:-left-[40px] lg:-left-[48px] grid place-items-center',
                  'h-[24px] w-[24px]'
                )}
              >
                {isCurrent ? (
                  <span
                    className="block h-[16px] w-[16px] rounded-full bg-[var(--color-text-primary)]"
                    style={{
                      boxShadow:
                        '0 0 0 4px color-mix(in srgb, var(--color-text-primary) 10%, transparent), 0 0 0 14px color-mix(in srgb, var(--color-text-primary) 4%, transparent), 0 0 24px color-mix(in srgb, var(--color-text-primary) 45%, transparent)',
                    }}
                  />
                ) : isGoal ? (
                  <span className="block h-[14px] w-[14px] rounded-full border border-[var(--color-text-primary)]/40" />
                ) : (
                  <span className="block h-[8px] w-[8px] rounded-full bg-[var(--color-text-primary)]/30" />
                )}
              </span>

              {/* content */}
              <div className="flex flex-col gap-2">
                {isCurrent && (
                  <span className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-glass-border-hover)] bg-[var(--color-glass-fill-hover)] px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-primary)] shadow-[0_0_8px_currentColor]" />
                    <span
                      className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-primary)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {currentLabel}
                    </span>
                  </span>
                )}
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {s.year}
                </span>
                <h3
                  className="text-[22px] font-medium leading-[1.18] text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                >
                  {inst}
                </h3>
                <p className="max-w-[640px] text-[14px] leading-[1.65] text-[var(--color-text-tertiary)]">
                  {obj}
                </p>
              </div>
            </Station>
          );
        })}
      </ol>
    </div>
  );
}

/** A station fades/slides in and its dot pops as it crosses the reading line. */
function Station({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'start 60%'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [-10, 0]);

  return (
    <motion.li ref={ref} className="relative" style={reduced ? undefined : { opacity, x }}>
      {children}
    </motion.li>
  );
}
