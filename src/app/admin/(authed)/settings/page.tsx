import { Database, KeyRound, UserRound } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageShell } from '@/components/admin/page-shell';
import { TwoFactor } from './two-factor';

const rows = [
  {
    icon: UserRound,
    label: 'Compte administrateur',
    key: 'account',
  },
  {
    icon: Database,
    label: 'Stockage des contenus',
    value: 'PostgreSQL · Prisma',
  },
  {
    icon: KeyRound,
    label: 'Mot de passe',
    value: 'Géré par la configuration du serveur',
  },
];

export default async function SettingsPage() {
  const session = await auth();
  const admin = session?.user?.id
    ? await db.adminUser.findUnique({
        where: { id: session.user.id },
        select: { totpEnabled: true },
      })
    : null;

  return (
    <PageShell
      breadcrumb={['Système', 'Réglages']}
      title="Réglages"
      subtitle="Les informations essentielles de l’administration, regroupées au même endroit."
    >
      <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
        {rows.map((row) => {
          const Icon = row.icon;
          const value =
            row.key === 'account' ? session?.user?.email ?? '—' : row.value;
          return (
            <div
              key={row.label}
              className="grid gap-3 px-5 py-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center"
            >
              <span className="flex items-center gap-3 text-[12px] text-white/45">
                <Icon size={14} />
                {row.label}
              </span>
              <span className="text-[13px] text-white/75">{value}</span>
            </div>
          );
        })}
      </div>
      <TwoFactor enabled={admin?.totpEnabled ?? false} />
      <p className="mt-4 text-[10px] leading-relaxed text-white/25">
        Les changements techniques sensibles restent volontairement hors de
        l’interface afin d’éviter les erreurs accidentelles.
      </p>
    </PageShell>
  );
}
