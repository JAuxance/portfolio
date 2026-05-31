import { cn } from '@/lib/cn';
import type { ProjectStatus } from '@prisma/client';

const LABELS: Record<ProjectStatus, { en: string; fr: string }> = {
  BUILDING: { en: 'Building', fr: 'En construction' },
  SHIPPED: { en: 'Shipped', fr: 'Livré' },
  LEARNING: { en: 'Learning', fr: 'En apprentissage' },
  STUDYING: { en: 'Studying', fr: 'En étude' },
  ESSAY: { en: 'Essay', fr: 'Essai' },
};

interface StatusPillProps {
  status: ProjectStatus;
  locale?: 'en' | 'fr';
  className?: string;
  withPill?: boolean;
}

export function StatusPill({ status, locale = 'en', className, withPill }: StatusPillProps) {
  const isLive = status === 'BUILDING';
  const dotClass = isLive
    ? 'bg-[var(--color-text-primary)] shadow-[0_0_8px_currentColor,0_0_16px_currentColor] opacity-90'
    : 'bg-[var(--color-text-tertiary)]';

  const inner = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full transition-shadow', dotClass)} />
      <span
        className="font-mono uppercase text-[10px] tracking-[0.14em] text-[var(--color-text-tertiary)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {LABELS[status][locale]}
      </span>
    </span>
  );

  if (!withPill) return inner;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-fill)] px-3 py-1">
      {inner}
    </span>
  );
}
