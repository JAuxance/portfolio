import { db } from '@/lib/db';
import { ReferencesAdminClient } from './client';

export default async function ReferencesAdminPage() {
  const items = await db.reference.findMany({ orderBy: { order: 'asc' } });
  return <ReferencesAdminClient initialItems={items} />;
}
