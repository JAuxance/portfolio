'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const ResearchInput = z.object({
  number: z.string().min(1),
  titleEn: z.string().min(1),
  titleFr: z.string().min(1),
  bodyEn: z.string().min(1),
  bodyFr: z.string().min(1),
  published: z.boolean().default(true),
});

type ResearchInputType = z.infer<typeof ResearchInput>;

async function requireAuth() {
  const s = await auth();
  if (!s) throw new Error('unauthorized');
}

function invalidate() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/research');
}

export async function createResearchTopic(input: Partial<ResearchInputType>) {
  await requireAuth();
  const last = await db.researchTopic.findFirst({ orderBy: { order: 'desc' } });
  const order = (last?.order ?? -1) + 1;
  const data = ResearchInput.parse({
    number: input.number ?? String(order + 1).padStart(2, '0'),
    titleEn: input.titleEn ?? 'Untitled',
    titleFr: input.titleFr ?? 'Sans titre',
    bodyEn: input.bodyEn ?? '',
    bodyFr: input.bodyFr ?? '',
    published: input.published ?? true,
  });
  const item = await db.researchTopic.create({ data: { ...data, order } });
  invalidate();
  return { ok: true as const, data: item };
}

export async function updateResearchTopic(id: string, input: ResearchInputType) {
  await requireAuth();
  const data = ResearchInput.parse(input);
  const item = await db.researchTopic.update({ where: { id }, data });
  invalidate();
  return { ok: true as const, data: item };
}

export async function deleteResearchTopic(id: string) {
  await requireAuth();
  await db.researchTopic.delete({ where: { id } });
  invalidate();
  return { ok: true as const };
}

export async function reorderResearch(orderedIds: string[]) {
  await requireAuth();
  await db.$transaction(
    orderedIds.map((id, idx) => db.researchTopic.update({ where: { id }, data: { order: idx } }))
  );
  invalidate();
  return { ok: true as const };
}
