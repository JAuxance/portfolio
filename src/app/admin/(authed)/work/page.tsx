import { db } from '@/lib/db';
import { WorkListClient } from './client';

export default async function WorkListPage() {
  const projects = await db.project.findMany({ orderBy: { order: 'asc' } });
  return <WorkListClient initialProjects={projects} />;
}
