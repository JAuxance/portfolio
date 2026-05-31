import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Sidebar } from '@/components/admin/sidebar';
import { SaveStateProvider } from '@/components/admin/save-state-context';
import { SessionProvider } from 'next-auth/react';

export default async function AuthedAdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const [workCount, nowCount, researchCount, trajectoryCount, refsCount] = await Promise.all([
    db.project.count(),
    db.nowItem.count(),
    db.researchTopic.count(),
    db.trajectoryStation.count(),
    db.reference.count(),
  ]).catch(() => [0, 0, 0, 0, 0]);

  const adminEmail = session.user?.email ?? 'admin@local';

  return (
    <SessionProvider session={session}>
      <SaveStateProvider>
        <Sidebar
          counts={{
            work: workCount,
            now: nowCount,
            research: researchCount,
            trajectory: trajectoryCount,
            references: refsCount,
          }}
          adminEmail={adminEmail}
        />
        <div className="md:pl-[260px]">{children}</div>
      </SaveStateProvider>
    </SessionProvider>
  );
}
