import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminShell } from '@/components/admin/admin-shell';
import { SaveStateProvider } from '@/components/admin/save-state-context';
import { SessionProvider } from 'next-auth/react';

export default async function AuthedAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const [workCount, nowCount, chapterCount] = await Promise.all([
    db.project.count(),
    db.nowItem.count(),
    db.chapter.count(),
  ]).catch(() => [0, 0, 0]);

  const adminEmail = session.user?.email ?? 'admin@local';

  return (
    <SessionProvider session={session}>
      <SaveStateProvider>
        <AdminShell
          counts={{
            chapters: chapterCount,
            work: workCount,
            now: nowCount,
          }}
          adminEmail={adminEmail}
        >
          {children}
        </AdminShell>
      </SaveStateProvider>
    </SessionProvider>
  );
}
