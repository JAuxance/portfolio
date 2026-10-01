'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { easterEgg } from '@/lib/terminal-eggs';
import { useTheme } from './theme-provider';

export interface TerminalProject {
  slug: string;
  name: string;
}

interface NowTerminalProps {
  locale: 'en' | 'fr';
  projects: TerminalProject[];
  now: { label: string; title: string }[];
  email: string;
  github: string | null;
  twitter: string | null;
  /** Show the blinking idle cursor (the log has finished typing). */
  idle: boolean;
}

type Line = { cmd: string; out: string[] };

const mono = { fontFamily: 'var(--font-mono)' } as const;

/** Only the latest command keeps its output; older ones collapse to one line. */
const MAX_HISTORY = 4;

const HELP = [
  'available commands:',
  '  ls                 list the projects',
  '  open <n | name>    open a project        e.g. open jobmatch',
  '  now                what I am doing right now',
  '  whoami             who is this',
  '  email              show + copy my email',
  '  github · x         open my profiles',
  '  book · contact     jump to a section',
  '  theme              toggle light / dark',
  '  clear              clear the screen',
  '',
  'there are a few hidden ones. good luck.',
];

/**
 * The interactive prompt at the end of now.log. Click the panel to type;
 * ↑/↓ recall history. Commands can open projects, jump around, and there are
 * a handful of easter eggs.
 */
export function NowTerminal({ locale, projects, now, email, github, twitter, idle }: NowTerminalProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { toggle } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<Line[]>([]);
  const past = useRef<string[]>([]);
  const cursor = useRef(-1);

  const findProject = (q: string) => {
    const s = q.toLowerCase().trim();
    if (!s) return undefined;
    const n = parseInt(s, 10);
    if (!Number.isNaN(n) && String(n) === s) return projects[n - 1];
    return (
      projects.find((p) => p.slug === s) ??
      projects.find((p) => p.slug.startsWith(s) || p.name.toLowerCase().includes(s))
    );
  };

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /** Returns the output lines, or null to clear the screen. */
  function execute(raw: string): string[] | null {
    const line = raw.trim();
    const [head, ...rest] = line.split(/\s+/);
    const cmd = head.toLowerCase();
    const arg = rest.join(' ');

    switch (cmd) {
      case 'help':
      case '?':
        return HELP;
      case 'clear':
      case 'cls':
        return null;
      case 'ls':
      case 'projects':
        return projects.length
          ? projects.map((p, i) => `  ${String(i + 1).padStart(2, '0')}  ${p.slug.padEnd(14)} ${p.name}`)
          : ['(no projects yet)'];
      case 'open':
      case 'cd':
      case 'go':
      case 'cat': {
        if (!arg) return [`usage: ${cmd} <n | name>   (try ls)`];
        const p = findProject(arg);
        if (!p) return [`${cmd}: no such project: ${arg}`];
        setTimeout(() => router.push(`/${locale}/work/${p.slug}`), 450);
        return [`opening ${p.name}…`];
      }
      case 'now':
        return now.length ? now.map((n) => `  [${n.label}] ${n.title}`) : ['nothing right now.'];
      case 'whoami':
        return ['auxance — full-stack student at Holberton, training toward ML research.'];
      case 'email':
      case 'mail':
        navigator.clipboard?.writeText(email).catch(() => {});
        return [email, '(copied to clipboard)'];
      case 'github':
        if (!github) return ['no github configured.'];
        window.open(github, '_blank', 'noopener,noreferrer');
        return [`opening ${github}`];
      case 'x':
      case 'twitter':
        if (!twitter) return ['no x profile configured.'];
        window.open(twitter, '_blank', 'noopener,noreferrer');
        return [`opening ${twitter}`];
      case 'book':
        jump('book');
        return ['scrolling to the book…'];
      case 'contact':
      case 'talk':
        jump('contact');
        return ["let's talk →"];
      case 'work':
        jump('work');
        return ['scrolling to work…'];
      case 'theme':
        toggle();
        return ['theme toggled.'];
      case 'date':
        return [new Date().toString()];
      case 'echo':
        return [arg];
      case 'pwd':
        return ['/home/auxance/now'];

      default:
        return easterEgg(cmd, arg) ?? [`command not found: ${head}  (try help)`];
    }
  }

  function runCommand(raw: string) {
    past.current = [raw, ...past.current].slice(0, 50);
    const out = execute(raw);
    if (out === null) setHistory([]);
    else setHistory((h) => [...h, { cmd: raw, out }].slice(-MAX_HISTORY));
  }

  function submit() {
    const raw = value;
    setValue('');
    cursor.current = -1;
    if (!raw.trim()) return;
    runCommand(raw);
  }


  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
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
    <div
      className="cursor-text border-t border-[var(--color-glass-border)] px-5 py-4 font-mono text-[13px] md:px-7"
      style={mono}
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      {history.length > 0 && (
        <div className="mb-3 flex flex-col gap-2" aria-live="polite">
          {history.map((h, i) => (
            <div key={i} className={i === history.length - 1 ? '' : 'opacity-50'}>
              <div className="text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-tertiary)]">$ </span>
                {h.cmd}
              </div>
              {i === history.length - 1 && (
                <pre
                  className="whitespace-pre-wrap break-words text-[var(--color-text-tertiary)]"
                  style={mono}
                >
                  {h.out.join('\n')}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-[var(--color-text-primary)]">
        <span className="text-[var(--color-text-tertiary)]" aria-hidden>
          $
        </span>
        <span className="relative flex-1">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Terminal"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            className="w-full bg-transparent outline-none placeholder:text-[var(--color-text-tertiary)]"
            style={{ ...mono, caretColor: 'var(--color-text-primary)', outline: 'none' }}
          />
          {/* idle hint + blinking block until the visitor engages */}
          {!focused && !value && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 text-[var(--color-text-tertiary)]"
            >
              {idle && (
                <motion.span
                  className="inline-block h-[1em] w-[0.55em] bg-[var(--color-text-primary)]"
                  animate={reduced ? undefined : { opacity: [1, 0, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              click here · type help
            </span>
          )}
        </span>
      </label>
    </div>
  );
}
