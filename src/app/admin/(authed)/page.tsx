import Link from 'next/link';
import { db } from '@/lib/db';
import { PageShell } from '@/components/admin/page-shell';

export default async function AdminDashboard() {
  const [projects, nowItems, research, references, stations] = await Promise.all([
    db.project.count(),
    db.nowItem.count(),
    db.researchTopic.count(),
    db.reference.count(),
    db.trajectoryStation.count(),
  ]);
  const lastProject = await db.project.findFirst({ orderBy: { updatedAt: 'desc' } });

  const cards = [
    { href: '/admin/profile', label: 'Profile', value: 'Singleton' as const },
    { href: '/admin/now', label: 'Now items', value: nowItems },
    { href: '/admin/work', label: 'Projects', value: projects },
    { href: '/admin/research', label: 'Research · Heather', value: research },
    { href: '/admin/references', label: 'References · Heather', value: references },
    { href: '/admin/trajectory', label: 'Trajectory · Heather', value: stations },
  ];

  return (
    <PageShell
      breadcrumb={['Dashboard']}
      title="Welcome back, Auxance."
      subtitle="Edit any content piece below. All changes ship to the public site without a redeploy."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="glass glass-hover flex flex-col gap-4 p-5 transition-all"
          >
            <span
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {c.label}
            </span>
            <span className="text-[32px] font-medium text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
              {c.value}
            </span>
          </Link>
        ))}
      </div>
      {lastProject && (
        <p className="mt-8 text-[12px] text-[var(--color-text-tertiary)]">
          Last edited: <span className="text-[var(--color-text-secondary)]">{lastProject.nameEn}</span>
          {' · '}
          {new Date(lastProject.updatedAt).toLocaleString()}
        </p>
      )}
    </PageShell>
  );
}
