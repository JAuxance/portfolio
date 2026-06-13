'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { flexibleUrl, parseInput } from '@/lib/validate';
import { ProjectStatus } from '@prisma/client';

const ProjectInput = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'lowercase, digits, dashes only'),
  nameEn: z.string().min(1),
  nameFr: z.string().min(1),
  taglineEn: z.string().min(1),
  taglineFr: z.string().min(1),
  status: z.nativeEnum(ProjectStatus),
  stack: z.array(z.string()).default([]),
  liveUrl: flexibleUrl,
  repoUrl: flexibleUrl,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  contextEn: z.array(z.string()).default([]),
  contextFr: z.array(z.string()).default([]),
  architecture: z.any().optional().nullable(),
  decisions: z.any().optional().nullable(),
  lessons: z.any().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  timelineEn: z.string().optional().nullable(),
  timelineFr: z.string().optional().nullable(),
  roleEn: z.string().optional().nullable(),
  roleFr: z.string().optional().nullable(),
  teamEn: z.string().optional().nullable(),
  teamFr: z.string().optional().nullable(),
  contextLabelEn: z.string().optional().nullable(),
  contextLabelFr: z.string().optional().nullable(),
});

type ProjectInputType = z.infer<typeof ProjectInput>;

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error('unauthorized');
}

function invalidate() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/work');
}

export async function createProject(input: Partial<ProjectInputType>) {
  await requireAuth();
  const last = await db.project.findFirst({ orderBy: { order: 'desc' } });
  const order = (last?.order ?? -1) + 1;
  const data = parseInput(ProjectInput, {
    slug: input.slug ?? `untitled-${Date.now()}`,
    nameEn: input.nameEn ?? 'Untitled',
    nameFr: input.nameFr ?? 'Sans titre',
    taglineEn: input.taglineEn ?? '',
    taglineFr: input.taglineFr ?? '',
    status: input.status ?? ProjectStatus.BUILDING,
    stack: input.stack ?? [],
    liveUrl: input.liveUrl ?? null,
    repoUrl: input.repoUrl ?? null,
    featured: input.featured ?? false,
    published: input.published ?? false,
    contextEn: input.contextEn ?? [],
    contextFr: input.contextFr ?? [],
    architecture: input.architecture ?? null,
    decisions: input.decisions ?? null,
    lessons: input.lessons ?? null,
    heroImage: input.heroImage ?? null,
    timelineEn: input.timelineEn ?? null,
    timelineFr: input.timelineFr ?? null,
    roleEn: input.roleEn ?? null,
    roleFr: input.roleFr ?? null,
    teamEn: input.teamEn ?? null,
    teamFr: input.teamFr ?? null,
    contextLabelEn: input.contextLabelEn ?? null,
    contextLabelFr: input.contextLabelFr ?? null,
  });
  const project = await db.project.create({ data: { ...data, order } });
  invalidate();
  return { ok: true as const, data: project };
}

export async function updateProject(id: string, input: ProjectInputType) {
  await requireAuth();
  const data = parseInput(ProjectInput, input);
  const project = await db.project.update({ where: { id }, data });
  invalidate();
  return { ok: true as const, data: project };
}

export async function deleteProject(id: string) {
  await requireAuth();
  await db.project.delete({ where: { id } });
  invalidate();
  return { ok: true as const };
}

export async function reorderProjects(orderedIds: string[]) {
  await requireAuth();
  await db.$transaction(
    orderedIds.map((id, idx) => db.project.update({ where: { id }, data: { order: idx } }))
  );
  invalidate();
  return { ok: true as const };
}

export async function togglePublished(id: string, published: boolean) {
  await requireAuth();
  await db.project.update({ where: { id }, data: { published } });
  invalidate();
  return { ok: true as const };
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireAuth();
  if (featured) {
    await db.project.updateMany({ where: { featured: true }, data: { featured: false } });
  }
  await db.project.update({ where: { id }, data: { featured } });
  invalidate();
  return { ok: true as const };
}
