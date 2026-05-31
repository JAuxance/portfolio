import { db } from '@/lib/db';
import { NowAdminClient } from './client';

export default async function NowAdminPage() {
  const items = await db.nowItem.findMany({ orderBy: { order: 'asc' } });
  return <NowAdminClient initialItems={items} />;
}
