'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { NowItem } from '@prisma/client';
import { SectionTitle } from '@/components/public/section-title';
import { NowTerminal, type TerminalProject } from '@/components/public/now-terminal';

interface NowSectionProps {
  items: NowItem[];
  locale: 'en' | 'fr';
  projects: TerminalProject[];
  email: string;
  github: string | null;
  twitter: string | null;
}

const mono = { fontFamily: 'var(--font-mono)' } as const;
const CHAR_MS = 16;
const GAP_MS = 260;

/**
 * Now as a live log: a terminal-style panel where each entry is typed out in
 * turn once the section scrolls into view, then its detail line fades in.
 * Reduced motion shows everything at once.
 */
export function NowSection({ items, locale, projects, email, github, twitter }: NowSectionProps) {
  const t = useTranslations('now');
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });
  // How many entries have finished typing; the entry at this index is typing.
  const [done, setDone] = useState(0);
  const finished = reduced || done >= items.length;

  return (
    <section
      id="now"
      className="relative mx-auto max-w-[1120px] px-6 py-[80px] md:px-10 md:py-[96px]"
      aria-label="Now"
    >
      <SectionTitle className="mb-12">{t('title')}</SectionTitle>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass overflow-hidden"
        style={{ borderRadius: 20 }}
      >
        {/* window bar */}
        <div
          className="flex items-center justify-between border-b border-[var(--color-glass-border)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] md:px-7"
          style={mono}
        >
          <span>now.log</span>
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-text-primary)] opacity-50" />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-text-primary)]" />
            </span>
            live
          </span>
        </div>

        <ol className="flex flex-col px-5 py-2 md:px-7">
          {items.map((item, i) => (
            <Entry
              key={item.id}
              item={item}
              index={i}
              locale={locale}
              href={hrefFor(item, projects, locale)}
              state={reduced ? 'done' : !inView || i > done ? 'idle' : i === done ? 'typing' : 'done'}
              onDone={() => setDone((d) => Math.max(d, i + 1))}
            />
          ))}
        </ol>

        <NowTerminal
          locale={locale}
          projects={projects}
          now={items.map((i) => ({
            label: i.label,
            title: locale === 'fr' ? i.titleFr : i.titleEn,
          }))}
          email={email}
          github={github}
          twitter={twitter}
          idle={finished}
        />
      </motion.div>
    </section>
  );
}

type EntryState = 'idle' | 'typing' | 'done';

/** Which page an entry leads to: the project it names, or the book. */
function hrefFor(item: NowItem, projects: TerminalProject[], locale: string): string | null {
  const text = `${item.titleEn} ${item.titleFr}`.toLowerCase();
  const project = projects.find(
    (p) => text.includes(p.name.toLowerCase()) || text.includes(p.slug.replace(/-/g, ' '))
  );
  if (project) return `/${locale}/work/${project.slug}`;
  if (/\bbook\b|\blivre\b/.test(text)) return `/${locale}/book`;
  return null;
}

function Entry({
  item,
  index,
  locale,
  href,
  state,
  onDone,
}: {
  item: NowItem;
  index: number;
  locale: 'en' | 'fr';
  href: string | null;
  state: EntryState;
  onDone: () => void;
}) {
  const title = locale === 'fr' ? item.titleFr : item.titleEn;
  const body = locale === 'fr' ? item.bodyFr : item.bodyEn;
  const [chars, setChars] = useState(0);
  const notified = useRef(false);

  useEffect(() => {
    if (state !== 'typing') return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setChars(n);
      if (n >= title.length) {
        clearInterval(id);
        if (!notified.current) {
          notified.current = true;
          setTimeout(onDone, GAP_MS);
        }
      }
    }, CHAR_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, title]);

  const shown = state === 'done' ? title.length : state === 'typing' ? chars : 0;
  const detailVisible = state === 'done' || (state === 'typing' && chars >= title.length);

  const rowClass =
    'group relative grid grid-cols-[28px_1fr] gap-x-3 py-6 md:grid-cols-[36px_132px_1fr] md:gap-x-5 md:py-7';
  const content = (
    <>
      <span className="pt-1 font-mono text-[11px] text-[var(--color-text-tertiary)]" style={mono}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className="col-start-2 pt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)] md:col-start-auto"
        style={mono}
      >
        [{item.label}]
      </span>

      <div className="col-start-2 mt-2 md:col-start-auto md:mt-0">
        <h3
          className="text-[22px] font-medium leading-[1.2] text-[var(--color-text-primary)] md:text-[26px]"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
        >
          <span className="sr-only">{title}</span>
          <span aria-hidden>
            {title.slice(0, shown)}
            {state === 'typing' && chars < title.length && (
              <span className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] bg-[var(--color-text-primary)]" />
            )}
          </span>
        </h3>
        <p
          className="mt-2 max-w-[680px] text-[14px] leading-[1.65] text-[var(--color-text-secondary)]"
          style={{ opacity: detailVisible ? 1 : 0, transition: 'opacity 0.5s' }}
        >
          {body}
        </p>
      </div>
      {href && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-7 hidden text-[16px] text-[var(--color-text-tertiary)] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-text-primary)] group-hover:opacity-100 md:block"
        >
          →
        </span>
      )}
    </>
  );

  return (
    <li
      className="border-t border-[var(--color-glass-border)] first:border-t-0"
      style={{ opacity: state === 'idle' ? 0.25 : 1, transition: 'opacity 0.3s' }}
    >
      {href ? (
        <Link href={href} className={rowClass}>
          {content}
        </Link>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
    </li>
  );
}
