'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { easterEgg } from '@/lib/terminal-eggs';
import { useTheme } from './theme-provider';

export interface DevProject {
  slug: string;
  name: string;
}

export interface DevChapter {
  /** Directory-style name, e.g. "architecture". */
  name: string;
  /** Scene index inside the stage. */
  index: number;
}

interface DevPromptProps {
  locale: 'en' | 'fr';
  slug: string;
  projects: DevProject[];
  repoUrl: string | null;
  liveUrl: string | null;
  chapters: DevChapter[];
  /** Scroll the stage to a scene (omitted when the stage is not pinned). */
  onGoto?: (index: number) => void;
}

type Line = { cmd: string; out: string[] };

const mono = { fontFamily: 'var(--font-mono)' } as const;

const HELP = [
  'navigation:',
  '  cd ..              back to the work list',
  '  cd ~               home',
  '  cd <chapter>       jump to a chapter        (see ls)',
  '  cd ../<project>    switch project           e.g. cd ../jobmatch',
  '  next · prev        next / previous project',
  '  back               browser back',
  '  top · end          first / last scene',
  'info:',
  '  ls                 chapters of this project',
  '  ls ..              all projects',
  '  pwd                where am I',
  '  code · live        open the repo / the live site',
  'misc:  theme · clear · echo · date · help',
  '',
  'tip: press / anywhere to focus this prompt, Esc to leave it.',
];

/**
 * A dev-style quick-nav prompt for project pages: cd .. to go back, cd ../name
 * to hop to another project, cd <chapter> to jump inside this one.
 */
export function DevPrompt({ locale, slug, projects, repoUrl, liveUrl, chapters, onGoto }: DevPromptProps) {
  const router = useRouter();
  const { toggle } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<Line[]>([]);
  const past = useRef<string[]>([]);
  const cursor = useRef(-1);

  // "/" focuses the prompt from anywhere (unless already typing somewhere).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const idx = projects.findIndex((p) => p.slug === slug);
  const home = `/${locale}`;
  const go = (href: string, delay = 350) => setTimeout(() => router.push(href), delay);

  const findProject = (q: string) => {
    const s = q.toLowerCase().replace(/\/+$/, '');
    if (!s) return undefined;
    const n = parseInt(s, 10);
    if (!Number.isNaN(n) && String(n) === s) return projects[n - 1];
    return (
      projects.find((p) => p.slug === s) ??
      projects.find((p) => p.slug.startsWith(s) || p.name.toLowerCase().includes(s))
    );
  };

  const findChapter = (q: string) => {
    const s = q.toLowerCase().replace(/\/+$/, '');
    if (!s) return undefined;
    const n = parseInt(s, 10);
    if (!Number.isNaN(n) && String(n) === s) return chapters[n - 1];
    return chapters.find((c) => c.name === s) ?? chapters.find((c) => c.name.startsWith(s));
  };

  function cd(arg: string): string[] {
    const target = arg.trim();
    if (!target || target === '~' || target === '/' || target === '~/') {
      go(home);
      return ['~'];
    }
    if (target === '.') return [];
    if (target === '..' || target === '../') {
      go(`${home}#work`);
      return ['../  →  work'];
    }

    // explicit project paths: ../name, /work/name, ~/work/name
    const proj = target.match(/^(?:\.\.\/|\/?work\/|~\/work\/)(.+)$/);
    if (proj) {
      const p = findProject(proj[1]);
      if (!p) return [`cd: no such project: ${proj[1]}`];
      if (p.slug === slug) return ['already here.'];
      go(`${home}/work/${p.slug}`);
      return [`→ ${p.name}`];
    }

    // bare name: a chapter of this project first, then a sibling project
    const chapter = findChapter(target);
    if (chapter) {
      if (!onGoto) return [`cd: ${chapter.name}: scrolling is disabled (reduced motion)`];
      onGoto(chapter.index);
      return [`→ ${chapter.name}/`];
    }
    const p = findProject(target);
    if (p) {
      if (p.slug === slug) return ['already here.'];
      go(`${home}/work/${p.slug}`);
      return [`→ ${p.name}`];
    }
    return [`cd: no such file or directory: ${target}`];
  }

  /** Returns the output lines, or null to clear the screen. */
  function execute(raw: string): string[] | null {
    const [head, ...rest] = raw.trim().split(/\s+/);
    const cmd = head.toLowerCase();
    const arg = rest.join(' ');

    switch (cmd) {
      case 'help':
      case '?':
        return HELP;
      case 'clear':
      case 'cls':
        return null;
      case 'pwd':
        return [`/work/${slug}`];
      case 'ls':
      case 'll': {
        if (arg === '..' || arg === '../') {
          return projects.map((p, i) => `  ${String(i + 1).padStart(2, '0')}  ${p.slug.padEnd(14)} ${p.name}${p.slug === slug ? '  ←' : ''}`);
        }
        const out = chapters.map((c, i) => `  ${String(i + 1).padStart(2, '0')}  ${c.name}/`);
        if (repoUrl) out.push('   ↗  code');
        if (liveUrl) out.push('   ↗  live');
        return out.length ? out : ['(empty)'];
      }
      case 'cd':
        return cd(arg);
      case 'back':
        setTimeout(() => router.back(), 250);
        return ['← back'];
      case 'next':
      case 'prev': {
        const target = projects[idx + (cmd === 'next' ? 1 : -1)];
        if (!target) return [cmd === 'next' ? 'already at the last project.' : 'already at the first project.'];
        go(`${home}/work/${target.slug}`);
        return [`→ ${target.name}`];
      }
      case 'top':
        if (!onGoto) return ['scrolling is disabled (reduced motion)'];
        onGoto(0);
        return ['↑ top'];
      case 'end':
      case 'bottom':
        if (!onGoto) return ['scrolling is disabled (reduced motion)'];
        onGoto(Number.MAX_SAFE_INTEGER);
        return ['↓ end'];
      case 'code':
      case 'repo':
        if (!repoUrl) return ['no public repo for this project.'];
        window.open(repoUrl, '_blank', 'noopener,noreferrer');
        return [`opening ${repoUrl}`];
      case 'live':
      case 'demo':
        if (!liveUrl) return ['no live site for this project.'];
        window.open(liveUrl, '_blank', 'noopener,noreferrer');
        return [`opening ${liveUrl}`];
      case 'theme':
        toggle();
        return ['theme toggled.'];
      case 'whoami':
        return ['auxance — full-stack student at Holberton, training toward ML research.'];
      case 'date':
        return [new Date().toString()];
      case 'echo':
        return [arg];
      default:
        return easterEgg(cmd, arg) ?? [`command not found: ${head}  (try help)`];
    }
  }

  function submit() {
    const raw = value;
    setValue('');
    cursor.current = -1;
    if (!raw.trim()) return;
    past.current = [raw, ...past.current].slice(0, 50);
    const out = execute(raw);
    if (out === null) setHistory([]);
    else setHistory((h) => [...h, { cmd: raw, out }].slice(-5));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      setHistory([]);
      setValue('');
      inputRef.current?.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(cursor.current + 1, past.current.length - 1);
      if (next >= 0) {
        cursor.current = next;
        setValue(past.current[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cursor.current - 1;
      cursor.current = Math.max(next, -1);
      setValue(next >= 0 ? past.current[next] : '');
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      {history.length > 0 && (
        <div
          className="mx-6 mb-2 flex max-h-[40svh] flex-col gap-2 overflow-y-auto rounded-xl border border-[var(--color-glass-border)] px-4 py-3 text-[12px] md:mx-12 lg:mx-20"
          style={{
            ...mono,
            background: 'color-mix(in srgb, var(--color-bg) 82%, transparent)',
            backdropFilter: 'blur(16px)',
          }}
          aria-live="polite"
        >
          {history.map((h, i) => (
            <div key={i}>
              <div className="text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-tertiary)]">$ </span>
                {h.cmd}
              </div>
              {h.out.length > 0 && (
                <pre className="whitespace-pre-wrap break-words text-[var(--color-text-tertiary)]" style={mono}>
                  {h.out.join('\n')}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <label
        className="flex cursor-text items-center gap-2 border-t border-[var(--color-glass-border)] px-6 py-3 md:px-12 lg:px-20"
        style={{
          ...mono,
          background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <span className="hidden shrink-0 text-[12px] text-[var(--color-text-tertiary)] sm:inline" aria-hidden>
          auxance@portfolio:~/work/{slug}
        </span>
        <span className="shrink-0 text-[12px] text-[var(--color-text-tertiary)] sm:hidden" aria-hidden>
          ~/{slug}
        </span>
        <span className="shrink-0 text-[12px] text-[var(--color-text-primary)]" aria-hidden>
          $
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Quick navigation prompt"
          placeholder="type help · press /"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] md:text-[13px]"
          style={{ ...mono, caretColor: 'var(--color-text-primary)' }}
        />
      </label>
    </div>
  );
}
