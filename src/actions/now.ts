'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { parseInput } from '@/lib/validate';

const NowInput = z.object({
  label: z.string().min(1),
  titleEn: z.string().min(1),
  titleFr: z.string().min(1),
  bodyEn: z.string().min(1),
  bodyFr: z.string().min(1),
  stack: z.string().default(""),
  published: z.boolean().default(true),
});

type NowInputType = z.infer<typeof NowInput>;

async function requireAuth() {
  const s = await auth();
  if (!s) throw new Error('unauthorized');
}

function invalidate() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/now');
}

export async function createNowItem(input: Partial<NowInputType>) {
  await requireAuth();
  const last = await db.nowItem.findFirst({ orderBy: { order: 'desc' } });
  const order = (last?.order ?? -1) + 1;
  const data = parseInput(NowInput, {
    label: input.label ?? 'BUILDING',
    titleEn: input.titleEn ?? 'Untitled',
    titleFr: input.titleFr ?? 'Sans titre',
    bodyEn: input.bodyEn ?? '',
    bodyFr: input.bodyFr ?? '',
    stack: input.stack ?? '',
    published: input.published ?? true,
  });
  const item = await db.nowItem.create({ data: { ...data, order } });
  invalidate();
  return { ok: true as const, data: item };
}

export async function updateNowItem(id: string, input: NowInputType) {
  await requireAuth();
  const data = parseInput(NowInput, input);
  const item = await db.nowItem.update({ where: { id }, data });
  invalidate();
  return { ok: true as const, data: item };
}

export async function deleteNowItem(id: string) {
  await requireAuth();
  await db.nowItem.delete({ where: { id } });
  invalidate();
  return { ok: true as const };
}

export async function reorderNowItems(orderedIds: string[]) {
  await requireAuth();
  await db.$transaction(
    orderedIds.map((id, idx) => db.nowItem.update({ where: { id }, data: { order: idx } }))
  );
  invalidate();
  return { ok: true as const };
}
