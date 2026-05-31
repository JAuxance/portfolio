'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

export function NavLink({ href, children, className, external }: NavLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          'text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]',
          className
        )}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        'text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]',
        className
      )}
    >
      {children}
    </Link>
  );
}
