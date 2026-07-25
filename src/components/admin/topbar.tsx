'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Menu } from 'lucide-react';
import { useSaveState } from './save-state-context';

interface TopbarProps {
  onOpenNavigation: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/book': 'Studio d’écriture',
  '/admin/work': 'Projets',
  '/admin/now': 'En ce moment',
  '/admin/profile': 'Profil',
  '/admin/research': 'Recherche',
  '/admin/trajectory': 'Parcours',
  '/admin/references': 'Références',
  '/admin/settings': 'Réglages',
};

export function Topbar({ onOpenNavigation }: TopbarProps) {
  const { status, lastSaved } = useSaveState();
  const pathname = usePathname() ?? '/admin';
  const route =
    Object.keys(ROUTE_LABELS)
      .sort((a, b) => b.length - a.length)
      .find((candidate) =>
        candidate === '/admin'
          ? pathname === candidate
          : pathname.startsWith(candidate)
      ) ?? '/admin';

  const indicator =
    status === 'saving'
      ? 'Enregistrement…'
      : status === 'error'
        ? 'Échec de l’enregistrement'
        : lastSaved
          ? `Enregistré · ${formatRelative(lastSaved)}`
          : 'À jour';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0b0b0d]/88 px-4 backdrop-blur-xl sm:px-6 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenNavigation}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/55 hover:bg-white/[0.05] hover:text-white md:hidden"
          aria-label="Ouvrir la navigation"
        >
          <Menu size={18} />
        </button>
        <span className="truncate text-[12px] font-medium text-white/70">
          {ROUTE_LABELS[route]}
        </span>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <span
          className={
            status === 'error'
              ? 'text-[11px] text-red-300'
              : 'text-[11px] text-white/35'
          }
        >
          {indicator}
        </span>
        <Link
          href="/fr"
          target="_blank"
          className="hidden items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-white/45 hover:bg-white/[0.04] hover:text-white sm:inline-flex"
        >
          Voir le site
          <ExternalLink size={12} />
        </Link>
      </div>
    </header>
  );
}

function formatRelative(date: Date) {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return 'à l’instant';
  if (seconds < 90) return 'il y a 1 min';
  if (seconds < 3600) return `il y a ${Math.round(seconds / 60)} min`;
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
