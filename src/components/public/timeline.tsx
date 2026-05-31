import type { TrajectoryStation } from '@prisma/client';
import { cn } from '@/lib/cn';

interface TimelineProps {
  stations: TrajectoryStation[];
  locale: 'en' | 'fr';
  currentLabel: string;
}

export function Timeline({ stations, locale, currentLabel }: TimelineProps) {
  return (
    <div className="relative pl-[30px] md:pl-[40px] lg:pl-[48px]">
      {/* vertical line */}
      <div
        aria-hidden
        className="absolute top-1.5 bottom-1.5 left-[7px] md:left-[10px] lg:left-[14px] w-px bg-[var(--color-glass-border)]"
      />
      <ol className="flex flex-col gap-12 md:gap-14">
        {stations.map((s) => {
          const inst = locale === 'fr' ? s.instFr : s.instEn;
          const obj = locale === 'fr' ? s.objFr : s.objEn;
          const isCurrent = s.state === 'CURRENT';
          const isGoal = s.state === 'GOAL';

          return (
            <li key={s.id} className="relative">
              {/* dot */}
              <span
                aria-hidden
                className={cn(
                  'absolute top-1 -left-[30px] md:-left-[40px] lg:-left-[48px] grid place-items-center',
                  'h-[24px] w-[24px]'
                )}
              >
                {isCurrent ? (
                  <span
                    className="block h-[16px] w-[16px] rounded-full bg-[var(--color-text-primary)]"
                    style={{
                      boxShadow:
                        '0 0 0 4px color-mix(in srgb, var(--color-text-primary) 10%, transparent), 0 0 0 14px color-mix(in srgb, var(--color-text-primary) 4%, transparent), 0 0 24px color-mix(in srgb, var(--color-text-primary) 45%, transparent)',
                    }}
                  />
                ) : isGoal ? (
                  <span className="block h-[14px] w-[14px] rounded-full border border-[var(--color-text-primary)]/40" />
                ) : (
                  <span className="block h-[8px] w-[8px] rounded-full bg-[var(--color-text-primary)]/30" />
                )}
              </span>

              {/* content */}
              <div className="flex flex-col gap-2">
                {isCurrent && (
                  <span className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-glass-border-hover)] bg-[var(--color-glass-fill-hover)] px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-primary)] shadow-[0_0_8px_currentColor]" />
                    <span
                      className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-primary)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {currentLabel}
                    </span>
                  </span>
                )}
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {s.year}
                </span>
                <h3
                  className="text-[22px] font-medium leading-[1.18] text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                >
                  {inst}
                </h3>
                <p className="max-w-[640px] text-[14px] leading-[1.65] text-[var(--color-text-tertiary)]">
                  {obj}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
