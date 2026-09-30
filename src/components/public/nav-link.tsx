'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  /** Highlights the link and slides the shared underline onto it. */
  active?: boolean;
}

export function NavLink({ href, children, className, external, active }: NavLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
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
      aria-current={active ? 'location' : undefined}
      className={cn(
        'relative py-1 text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]',
        active && 'text-[var(--color-text-primary)]',
        className
      )}
    >
      {children}
      {active && (
        <motion.span
          aria-hidden
          layoutId="nav-indicator"
          className="absolute inset-x-0 -bottom-0.5 h-px bg-[var(--color-text-primary)]"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
    </Link>
  );
}
