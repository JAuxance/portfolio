'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

export type StageScene =
  | { kind: 'text'; label: string; paragraphs: string[] }
  | { kind: 'layers'; label: string; layers: { layer: string; primary: string; notes: string }[] }
  | { kind: 'step'; label: string; n: string; title: string; body: string }
  | { kind: 'facts'; label: string; facts: { label: string; text: string }[] };

interface ProjectStageProps {
  /** Opening scene (name, status, tagline, actions…), rendered by the page. */
  intro: ReactNode;
  scenes: StageScene[];
  /** Closing scene, shown once the last chapter is done (e.g. the code button). */
  outro?: ReactNode;
  backHref: string;
  backLabel: string;
}

const mono = { fontFamily: 'var(--font-mono)' } as const;

/**
 * The whole project in one pinned, centered view. Nothing scrolls away: the
 * chapters cross-fade in place, driven by scroll position, over the site's
 * 3D backdrop. Scene 0 is the intro; a counter + progress line track the rest.
 */
export function ProjectStage({ intro, scenes, outro, backHref, backLabel }: ProjectStageProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const total = scenes.length + 1 + (outro ? 1 : 0); // intro + chapters + outro
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (p) =>
    setActive(Math.round(p * (total - 1)))
  );
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Reduced motion: no pinning — the intro, then every chapter stacked.
  if (reduced) {
    return (
      <div className="mx-auto flex max-w-[880px] flex-col items-center gap-24 px-6 pt-[120px] pb-24 text-center">
        {intro}
        {scenes.map((s, i) => (
          <SceneBody key={i} scene={s} />
        ))}
        {outro}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ height: `${total * 100}svh` }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft pool of darkness so text stays readable over the particles */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--color-bg) 78%, transparent), transparent 75%)',
          }}
        />

        <StageLayer progress={scrollYProgress} index={0} total={total} active={active}>
          <div className="flex h-full items-center justify-center px-6 pt-[60px] text-center">{intro}</div>
        </StageLayer>

        {scenes.map((scene, i) => (
          <StageLayer key={i} progress={scrollYProgress} index={i + 1} total={total} active={active}>
            <div className="flex h-full items-center justify-center px-6 pt-[60px] md:px-12">
              <div className="w-full max-w-[920px]">
                <SceneBody scene={scene} />
              </div>
            </div>
          </StageLayer>
        ))}

        {outro && (
          <StageLayer progress={scrollYProgress} index={total - 1} total={total} active={active}>
            <div className="flex h-full items-center justify-center px-6 pt-[60px] text-center">{outro}</div>
          </StageLayer>
        )}

        {/* HUD */}
        <div
          className="absolute inset-x-0 top-[76px] flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] md:px-12 lg:px-20"
          style={mono}
        >
          <Link href={backHref} className="transition-colors hover:text-[var(--color-text-primary)]">
            ← {backLabel}
          </Link>
        </div>
        <motion.div
          aria-hidden
          className="absolute right-0 top-0 h-full w-px origin-top bg-[var(--color-text-primary)]/50"
          style={{ scaleY: bar }}
        />
      </div>
    </div>
  );
}

/** One scene's cross-fade window on the shared scroll progress. */
function StageLayer({
  progress,
  index,
  total,
  active,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  active: number;
  children: ReactNode;
}) {
  const step = 1 / (total - 1);
  const c = index * step;
  const first = index === 0;
  const last = index === total - 1;
  const input = first
    ? [0, step * 0.4, step * 0.85]
    : last
      ? [c - step * 0.85, c - step * 0.4, 1]
      : [c - step * 0.85, c - step * 0.4, c + step * 0.4, c + step * 0.85];
  const opacity = useTransform(
    progress,
    input,
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    input,
    first ? [0, 0, -40] : last ? [40, 0, 0] : [40, 0, 0, -40]
  );

  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity, y, pointerEvents: active === index ? 'auto' : 'none' }}
      aria-hidden={active !== index}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span
      className="mb-7 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]"
      style={mono}
    >
      <span aria-hidden className="h-px w-8 bg-[var(--color-text-tertiary)]/50" />
      {children}
      <span aria-hidden className="h-px w-8 bg-[var(--color-text-tertiary)]/50" />
    </span>
  );
}

function SceneBody({ scene }: { scene: StageScene }) {
  switch (scene.kind) {
    case 'text':
      return (
        <div className="text-center">
          <Label>{scene.label}</Label>
          <div className="mx-auto flex max-w-[760px] flex-col gap-5">
            {scene.paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'text-[22px] leading-[1.4] text-[var(--color-text-primary)] md:text-[30px]'
                    : 'text-[16px] leading-[1.7] text-[var(--color-text-secondary)] md:text-[17px]'
                }
                style={{ letterSpacing: '-0.015em' }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      );
    case 'layers':
      return (
        <div className="text-center">
          <Label>{scene.label}</Label>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-5 text-left md:grid-cols-2">
            {scene.layers.map((l, i) => (
              <li key={i} className="border-t border-[var(--color-glass-border-hover)] pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]" style={mono}>
                  {l.layer}
                </span>
                <p className="mt-1.5 text-[18px] font-medium leading-[1.3] text-[var(--color-text-primary)] md:text-[20px]">
                  {l.primary}
                </p>
                <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">{l.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'step':
      return (
        <div className="relative text-center">
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[62%] select-none font-mono text-[200px] font-semibold leading-none text-[var(--color-text-primary)]/[0.05] md:text-[340px]"
            style={mono}
          >
            {scene.n}
          </span>
          <div className="relative">
            <Label>{scene.label}</Label>
            <h3
              className="mx-auto mb-6 max-w-[820px] text-[34px] font-medium leading-[1.08] text-[var(--color-text-primary)] md:text-[58px]"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
            >
              {scene.title}
            </h3>
            <p className="mx-auto max-w-[620px] text-[16px] leading-[1.7] text-[var(--color-text-secondary)] md:text-[18px]">
              {scene.body}
            </p>
          </div>
        </div>
      );
    case 'facts':
      return (
        <div className="text-center">
          <Label>{scene.label}</Label>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-7 text-left md:grid-cols-2">
            {scene.facts.map((f, i) => (
              <li key={i} className="border-t border-[var(--color-glass-border-hover)] pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]" style={mono}>
                  {f.label}
                </span>
                <p className="mt-2 text-[15px] leading-[1.65] text-[var(--color-text-primary)]">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}
