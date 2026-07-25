'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Activity,
  BookOpen,
  BrainCircuit,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Quote,
  Route,
  Settings,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AdminCounts {
  chapters: number;
  work: number;
  now: number;
}

interface SidebarProps {
  counts: AdminCounts;
  adminEmail: string;
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: keyof AdminCounts;
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: 'ÉCRIRE',
    items: [
      {
        href: '/admin/book',
        label: 'Mon livre',
        icon: BookOpen,
        count: 'chapters',
      },
    ],
  },
  {
    label: 'PORTFOLIO',
    items: [
      { href: '/admin/work', label: 'Projets', icon: FolderKanban, count: 'work' },
      { href: '/admin/now', label: 'En ce moment', icon: Activity, count: 'now' },
      { href: '/admin/profile', label: 'Profil', icon: UserRound },
    ],
  },
  {
    label: 'CONTEXTE HEATHER',
    items: [
      { href: '/admin/research', label: 'Recherche', icon: BrainCircuit },
      { href: '/admin/trajectory', label: 'Parcours', icon: Route },
      { href: '/admin/references', label: 'Références', icon: Quote },
    ],
  },
];

export function Sidebar({ counts, adminEmail, open, onClose }: SidebarProps) {
  const pathname = usePathname() ?? '';

  return (
    <>
      <button
        type="button"
        aria-label="Fermer la navigation"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(86vw,280px)] flex-col border-r border-white/[0.06] bg-[#0e0e11] px-4 py-5 transition-transform duration-300 md:z-40 md:w-[240px] md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-5 flex h-10 items-center justify-between px-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-[14px] font-semibold text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.015em' }}
          >
            Auxance
            <span className="text-white/30">/</span>
            Studio
            <span className="h-1.5 w-1.5 rounded-full bg-white/75 shadow-[0_0_8px_rgba(255,255,255,0.45)]" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/[0.05] hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X size={17} />
          </button>
        </div>

        <Link
          href="/admin"
          className={cn(
            'mb-6 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px] transition-colors',
            pathname === '/admin'
              ? 'border-white/[0.10] bg-white/[0.06] text-white'
              : 'border-transparent text-white/55 hover:bg-white/[0.035] hover:text-white'
          )}
        >
          <LayoutDashboard size={16} />
          Tableau de bord
        </Link>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto scrollbar-hide">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px] transition-colors',
                        active
                          ? 'border-white/[0.10] bg-white/[0.06] text-white'
                          : 'border-transparent text-white/50 hover:bg-white/[0.035] hover:text-white'
                      )}
                    >
                      <Icon size={16} />
                      <span className="min-w-0 flex-1">{item.label}</span>
                      {item.count && (
                        <span className="font-mono text-[9px] tabular-nums text-white/25">
                          {counts[item.count]}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <Link
            href="/admin/settings"
            className={cn(
              'mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors',
              pathname.startsWith('/admin/settings')
                ? 'bg-white/[0.06] text-white'
                : 'text-white/45 hover:bg-white/[0.035] hover:text-white'
            )}
          >
            <Settings size={15} />
            Réglages
          </Link>
          <Link
            href="/fr"
            target="_blank"
            className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/45 hover:bg-white/[0.035] hover:text-white"
          >
            <ExternalLink size={15} />
            Voir le site
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] px-3 py-3">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[11px] font-medium text-white">
              A
            </div>
            <p className="min-w-0 flex-1 truncate text-[10px] text-white/45">
              {adminEmail}
            </p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="grid h-7 w-7 place-items-center rounded-lg text-white/35 hover:bg-white/[0.05] hover:text-white"
              aria-label="Se déconnecter"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
