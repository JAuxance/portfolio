'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/cn';

interface SidebarProps {
  counts: { work: number; now: number; research: number; trajectory: number; references: number };
  adminEmail: string;
}

type CountKey = 'now' | 'work' | 'research' | 'references' | 'trajectory';

interface NavItem {
  href: string;
  label: string;
  key: CountKey | null;
}

// Mirrors the public site: Hero/Now/Journal/Work/Contact are the live
// sections; Research/References/Trajectory no longer render on the page but
// still feed Heather's chat context, so they stay editable under their own
// group. (The Journal section is Substack-driven — nothing to edit here.)
const groups: { label: string; items: NavItem[] }[] = [
  {
    label: 'ON THE SITE',
    items: [
      { href: '/admin/profile', label: 'Profile', key: null },
      { href: '/admin/now', label: 'Now', key: 'now' },
      { href: '/admin/work', label: 'Work', key: 'work' },
    ],
  },
  {
    label: 'HEATHER CONTEXT',
    items: [
      { href: '/admin/research', label: 'Research', key: 'research' },
      { href: '/admin/references', label: 'References', key: 'references' },
      { href: '/admin/trajectory', label: 'Trajectory', key: 'trajectory' },
    ],
  },
  {
    label: 'PAGES',
    items: [{ href: '/admin', label: 'Dashboard', key: null }],
  },
  {
    label: 'SYSTEM',
    items: [{ href: '/admin/settings', label: 'Settings', key: null }],
  },
];

export function Sidebar({ counts, adminEmail }: SidebarProps) {
  const pathname = usePathname() ?? '';

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/[0.06] bg-[var(--color-bg-elevated)] px-5 py-7 md:flex"
    >
      <Link
        href="/admin"
        className="mb-9 flex items-center gap-2 text-[14px] font-medium text-white"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        Auxance
        <span className="opacity-50">·</span>
        Admin
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </Link>

      <nav className="flex flex-1 flex-col gap-7 overflow-y-auto scrollbar-hide">
        {groups.map((g) => (
          <div key={g.label} className="flex flex-col gap-1">
            <p
              className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {g.label}
            </p>
            {g.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const count = item.key ? counts[item.key] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors',
                    active
                      ? 'bg-white/[0.06] border border-white/[0.10] text-[var(--color-text-primary)]'
                      : 'border border-transparent text-[var(--color-text-secondary)] hover:bg-white/[0.03] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  <span>{item.label}</span>
                  {count !== null && (
                    <span
                      className="font-mono text-[10px] text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
        <Link
          href="/en"
          target="_blank"
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[12px] text-[var(--color-text-secondary)] hover:text-white"
        >
          View public site ↗
        </Link>
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.025] p-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[12px] font-medium text-white">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-[var(--color-text-primary)]">{adminEmail}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
