import type { Project } from '@prisma/client';
import { GlassCard } from './glass-card';
import { StatusPill } from './status-pill';
import { isVideoUrl } from '@/lib/media';

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
      tilt
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

      {/* Middle: the project media fills the square's dead zone when it
          exists; without media the card keeps its airy bottom-anchored look. */}
      {project.heroImage && (
        <div className="relative my-4 min-h-0 flex-1 overflow-hidden rounded-[10px] border border-[var(--color-glass-border)]">
          {isVideoUrl(project.heroImage) ? (
            <video
              src={project.heroImage}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
        </div>
      )}

      {/* Bottom: name + tagline. Sized to fit a square; clamped to avoid overflow. */}
      <div className="min-h-0 flex flex-col justify-end gap-2 md:gap-3">
        <h3
          className={
            featured
              ? 'text-[28px] md:text-[34px] lg:text-[40px] font-semibold leading-[1.02] text-[var(--color-text-primary)]'
              : 'text-[22px] md:text-[24px] lg:text-[26px] font-semibold leading-[1.05] text-[var(--color-text-primary)]'
          }
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
        >
          {name}
        </h3>
        <p
          className={
            featured
              ? 'line-clamp-2 max-w-[520px] text-[14px] md:text-[15px] leading-[1.55] text-[var(--color-text-secondary)]'
              : 'line-clamp-2 text-[12px] md:text-[13px] leading-[1.5] text-[var(--color-text-secondary)]'
          }
        >
          {tagline}
        </p>
      </div>
    </GlassCard>
  );
}
