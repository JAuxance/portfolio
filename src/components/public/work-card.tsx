import type { Project } from '@prisma/client';
import { GlassCard } from './glass-card';
import { StatusPill } from './status-pill';

interface WorkCardProps {
  project: Project;
  locale: 'en' | 'fr';
  featured?: boolean;
}

export function WorkCard({ project, locale, featured }: WorkCardProps) {
  const name = locale === 'fr' ? project.nameFr : project.nameEn;
  const tagline = locale === 'fr' ? project.taglineFr : project.taglineEn;
  const href = `/${locale}/work/${project.slug}`;

  return (
    <GlassCard
      href={href}
      featured={featured}
      className="flex h-full flex-col justify-between"
    >
      {/* Top row: status + arrow */}
      <div className="flex items-center justify-between">
        <StatusPill status={project.status} locale={locale} />
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-text-primary)]"
        >
          <path
            d="M4 10L10 4M10 4H5M10 4V9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Middle: name + tagline. Sized to fit a square; clamped to avoid overflow. */}
      <div className="min-h-0 flex flex-col justify-end gap-2 md:gap-3">
        <h3
          className={
            featured
              ? 'text-[40px] md:text-[52px] lg:text-[64px] font-semibold leading-[0.98] text-[var(--color-text-primary)]'
              : 'text-[22px] md:text-[26px] lg:text-[28px] font-semibold leading-[1.05] text-[var(--color-text-primary)]'
          }
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
        >
          {name}
        </h3>
        <p
          className={
            featured
              ? 'line-clamp-3 max-w-[480px] text-[15px] md:text-[16px] leading-[1.55] text-[var(--color-text-secondary)]'
              : 'line-clamp-2 text-[12px] md:text-[13px] leading-[1.5] text-[var(--color-text-secondary)]'
          }
        >
          {tagline}
        </p>
      </div>

      {/* Bottom: stack list */}
      <div className="border-t border-[var(--color-glass-border)] pt-3 md:pt-4">
        <p
          className="line-clamp-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {project.stack.join(' · ')}
        </p>
      </div>
    </GlassCard>
  );
}
