'use client';

import { motion } from 'framer-motion';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="relative inline-flex h-7 w-12 items-center rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-fill)] backdrop-blur-sm transition-colors hover:border-[var(--color-glass-border-hover)]"
    >
      {/* Animate via transform (x), not the `layout` prop: layout measures
          page-relative positions, so route changes made the thumb "travel"
          from its old scroll position — a vertical ghost slide. */}
      <motion.span
        initial={false}
        animate={{ x: isDark ? 0 : 22 }}
        transition={{ type: 'spring', stiffness: 600, damping: 38 }}
        className="absolute left-[3px] top-[3px] grid h-[20px] w-[20px] place-items-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] shadow-sm"
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </motion.span>
    </button>
  );
}

function MoonIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path
        d="M9.5 7.2A4 4 0 0 1 4.8 2.5a4 4 0 1 0 4.7 4.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="2.4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M6 1.4v1.2" />
        <path d="M6 9.4v1.2" />
        <path d="M1.4 6h1.2" />
        <path d="M9.4 6h1.2" />
        <path d="M2.6 2.6l.85.85" />
        <path d="M8.55 8.55l.85.85" />
        <path d="M2.6 9.4l.85-.85" />
        <path d="M8.55 3.45l.85-.85" />
      </g>
    </svg>
  );
}
