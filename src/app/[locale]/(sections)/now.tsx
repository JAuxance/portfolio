'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import type { NowItem } from '@prisma/client';
import { NowCard } from '@/components/public/now-card';
import { SectionTitle } from '@/components/public/section-title';

interface NowSectionProps {
  items: NowItem[];
  locale: 'en' | 'fr';
}

/** Wraps v into [min, max) — the heart of the seamless loop. */
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return min + (((v - min) % range) + range) % range;
}

/** One full pass of the card set takes this long when idle. */
const LOOP_SECONDS = 45;

export function NowSection({ items, locale }: NowSectionProps) {
  const t = useTranslations('now');
  const reduced = useReducedMotion();

  // Slow infinite ticker, but hand-driven too: pan/swipe moves it directly
  // (wrapped, so you can never run off the end), and the auto-scroll pauses
  // under the pointer or the finger, then resumes.
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const half = useRef(0);
  const paused = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      half.current = el.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || paused.current || !half.current) return;
    const speed = half.current / LOOP_SECONDS;
    x.set(wrap(-half.current, 0, x.get() - (speed * delta) / 1000));
  });

  return (
    <section
      id="now"
      className="relative mx-auto max-w-[1280px] px-6 py-[80px] md:px-12 md:py-[96px] lg:px-20"
      aria-label="Now"
    >
      <SectionTitle className="mb-12">{t('title')}</SectionTitle>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden"
      >
        <motion.div
          ref={trackRef}
          style={{ x, touchAction: 'pan-y' }}
          onPanStart={() => {
            paused.current = true;
          }}
          onPan={(_, info) => {
            if (half.current) x.set(wrap(-half.current, 0, x.get() + info.delta.x));
          }}
          onPanEnd={() => {
            paused.current = false;
          }}
          onMouseEnter={() => {
            paused.current = true;
          }}
          onMouseLeave={() => {
            paused.current = false;
          }}
          className="flex w-max cursor-grab select-none active:cursor-grabbing"
        >
          {[...items, ...items].map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              aria-hidden={i >= items.length}
              className="mr-4 w-[300px] shrink-0 md:mr-5 md:w-[400px]"
            >
              <NowCard item={item} locale={locale} />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
