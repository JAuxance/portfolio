import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageShellProps {
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

export function PageShell({
  breadcrumb,
  title,
  subtitle,
  action,
  children,
  wide = false,
}: PageShellProps) {
  return (
    <div className="px-4 py-8 sm:px-6 md:px-8 md:py-10">
      <div className={cn('mx-auto', wide ? 'max-w-[1440px]' : 'max-w-[1120px]')}>
        <div className="mb-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
              {breadcrumb.join(' / ')}
            </p>
            <h1
              className="text-[30px] font-medium leading-[1.08] text-[var(--color-text-primary)] md:text-[36px]"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.025em',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-[680px] text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
