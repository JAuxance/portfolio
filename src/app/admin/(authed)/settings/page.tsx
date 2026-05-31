import { auth } from '@/lib/auth';
import { PageShell } from '@/components/admin/page-shell';
import { FormSurface, Field } from '@/components/admin/ui';

export default async function SettingsPage() {
  const session = await auth();
  return (
    <PageShell breadcrumb={['System', 'Settings']} title="Settings" subtitle="Read-only system info.">
      <FormSurface className="flex flex-col gap-5">
        <Field label="Signed in as">
          <p className="text-[14px] text-[var(--color-text-primary)]">{session?.user?.email}</p>
        </Field>
        <Field label="Database">
          <p className="font-mono text-[12px] text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>
            Postgres via Prisma. Migrations live in <code>prisma/migrations</code>.
          </p>
        </Field>
        <Field label="Password rotation">
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            Coming soon — rotate via SQL or re-seed for now.
          </p>
        </Field>
      </FormSurface>
    </PageShell>
  );
}
