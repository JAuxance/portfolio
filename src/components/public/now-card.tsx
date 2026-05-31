import type { NowItem } from '@prisma/client';
import { GlassCard } from './glass-card';

interface NowCardProps {
  item: NowItem;
  locale: 'en' | 'fr';
}

export function NowCard({ item, locale }: NowCardProps) {
  const title = locale === 'fr' ? item.titleFr : item.titleEn;
  const body = locale === 'fr' ? item.bodyFr : item.bodyEn;

  return (
    <GlassCard className="flex h-full flex-col gap-5">
      <span
        className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {item.label}
      </span>
      <h3
        className="text-[26px] font-medium leading-[1.18] text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
      >
        {title}
      </h3>
      <p className="text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">{body}</p>
      <div className="mt-auto pt-5 border-t border-[var(--color-glass-border)]">
        <p
          className="font-mono text-[11px] text-[var(--color-text-tertiary)] tracking-wide"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {item.stack}
        </p>
      </div>
    </GlassCard>
  );
}
