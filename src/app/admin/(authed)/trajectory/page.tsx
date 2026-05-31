import { db } from '@/lib/db';
import { TrajectoryAdminClient } from './client';

export default async function TrajectoryAdminPage() {
  const items = await db.trajectoryStation.findMany({ orderBy: { order: 'asc' } });
  return <TrajectoryAdminClient initialItems={items} />;
}
