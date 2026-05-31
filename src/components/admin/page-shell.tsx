import type { ReactNode } from 'react';
import { Topbar } from './topbar';

interface PageShellProps {
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageShell({ breadcrumb, title, subtitle, action, children }: PageShellProps) {
  return (
    <>
      <Topbar breadcrumb={breadcrumb} />
      <div className="px-6 py-10 md:px-12">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1
              className="text-[32px] font-medium leading-[1.1] text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-[640px] text-[13px] text-[var(--color-text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </>
  );
}
