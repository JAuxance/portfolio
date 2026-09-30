'use client';

import { useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { CtaPill } from './section-cta';

export type StageScene =
  | { kind: 'text'; label: string; title?: string; paragraphs: string[] }
  | { kind: 'layers'; label: string; layers: { layer: string; primary: string; notes: string }[] }
  | { kind: 'step'; label: string; n: string; title: string; body: string }
  | { kind: 'facts'; label: string; facts: { label: string; text: string }[] };

interface ProjectStageProps {
  name: string;
  media: { src: string; video: boolean } | null;
  href: string | null;
  hrefLabel: string;
  scenes: StageScene[];
}

const mono = { fontFamily: 'var(--font-mono)' } as const;

/**
 * The project story as a pinned, full-screen "film": the media stays fixed
 * while the chapters cross-fade over it, driven entirely by scroll position.
 * Scene 0 is the media on its own; the rest dim it and carry the text.
 */
export function ProjectStage({ name, media, href, hrefLabel, scenes }: ProjectStageProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const total = scenes.length + 1; // + the opening media scene
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (p) =>
    setActive(Math.round(p * (total - 1)))
  );

  const step = 1 / (total - 1);
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.16]);
  const dim = useTransform(scrollYProgress, [0, step * 0.7], [0.05, 0.88]);
  const blur = useTransform(scrollYProgress, [0, step * 0.7], ['blur(0px)', 'blur(16px)']);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const mediaEl = media ? (
    media.video ? (
      <video src={media.src} className="h-full w-full object-cover" autoPlay loop muted playsInline />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={media.src} alt={name} className="h-full w-full object-cover" />
    )
  ) : (
    <div
      className="h-full w-full"
      style={{
        background:
          'radial-gradient(circle at 30% 20%, rgba(140,178,255,0.14), transparent 55%), radial-gradient(circle at 70% 80%, rgba(191,140,255,0.12), transparent 55%)',
      }}
    />
  );

  // Reduced motion: no pinning — a plain banner followed by the chapters.
  if (reduced) {
    return (
      <div>
        <div className="h-[50vh] overflow-hidden">{mediaEl}</div>
        <div className="mx-auto flex max-w-[880px] flex-col gap-24 px-6 py-24">
          {scenes.map((s, i) => (
            <SceneBody key={i} scene={s} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ height: `${total * 100}svh` }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* pinned media */}
        <motion.div aria-hidden={!media} className="absolute inset-0" style={{ scale, filter: blur }}>
          {mediaEl}
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[var(--color-bg)]"
          style={{ opacity: dim }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)]/85 via-[var(--color-bg)]/40 to-transparent"
        />

        {/* scene 0: the media on its own */}
        <StageLayer progress={scrollYProgress} index={0} total={total}>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-6 pb-10 md:px-12 lg:px-20">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]" style={mono}>
              {name}
            </span>
            {href && (
              <span className="pointer-events-auto">
                <CtaPill href={href} label={hrefLabel} variant="glass" />
              </span>
            )}
          </div>
        </StageLayer>

        {scenes.map((scene, i) => (
          <StageLayer key={i} progress={scrollYProgress} index={i + 1} total={total}>
            <div className="mx-auto flex h-full max-w-[1280px] items-center px-6 md:px-12 lg:px-20">
              <div className="max-w-[880px]">
                <SceneBody scene={scene} />
              </div>
            </div>
          </StageLayer>
        ))}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-[76px] flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] md:px-12 lg:px-20" style={mono}>
          <span>{name}</span>
          <span>
            {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
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
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
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
    <motion.div className="pointer-events-none absolute inset-0" style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span
      className="mb-6 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]"
      style={mono}
    >
      <span aria-hidden className="h-px w-8 bg-[var(--color-text-tertiary)]/50" />
      {children}
    </span>
  );
}

function SceneBody({ scene }: { scene: StageScene }) {
  switch (scene.kind) {
    case 'text':
      return (
        <div>
          <Label>{scene.label}</Label>
          <div className="flex flex-col gap-5">
            {scene.paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'text-[22px] leading-[1.4] text-[var(--color-text-primary)] md:text-[30px]'
                    : 'text-[16px] leading-[1.7] text-[var(--color-text-secondary)] md:text-[18px]'
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
        <div>
          <Label>{scene.label}</Label>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
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
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-24 select-none font-mono text-[140px] font-semibold leading-none text-[var(--color-text-primary)]/[0.06] md:text-[220px]"
            style={mono}
          >
            {scene.n}
          </span>
          <Label>{scene.label}</Label>
          <h3
            className="mb-5 text-[34px] font-medium leading-[1.08] text-[var(--color-text-primary)] md:text-[56px]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          >
            {scene.title}
          </h3>
          <p className="max-w-[640px] text-[16px] leading-[1.7] text-[var(--color-text-secondary)] md:text-[18px]">
            {scene.body}
          </p>
        </div>
      );
    case 'facts':
      return (
        <div>
          <Label>{scene.label}</Label>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
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
