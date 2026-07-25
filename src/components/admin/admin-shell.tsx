'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, type AdminCounts } from './sidebar';
import { Topbar } from './topbar';

interface AdminShellProps {
  children: ReactNode;
  counts: AdminCounts;
  adminEmail: string;
}

export function AdminShell({ children, counts, adminEmail }: AdminShellProps) {
  const pathname = usePathname();
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    setNavigationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navigationOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavigationOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navigationOpen]);

  return (
    <div className="min-h-screen">
      <Sidebar
        counts={counts}
        adminEmail={adminEmail}
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
      />
      <div className="min-w-0 md:pl-[240px]">
        <Topbar onOpenNavigation={() => setNavigationOpen(true)} />
        {children}
      </div>
    </div>
  );
}
