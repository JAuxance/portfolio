import { db } from '@/lib/db';
import { ResearchAdminClient } from './client';

export default async function ResearchAdminPage() {
  const items = await db.researchTopic.findMany({ orderBy: { order: 'asc' } });
  return <ResearchAdminClient initialItems={items} />;
}
