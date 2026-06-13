'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { parseInput } from '@/lib/validate';

const RefInput = z.object({
  citation: z.string().min(1),
  published: z.boolean().default(true),
});

type RefInputType = z.infer<typeof RefInput>;

async function requireAuth() {
  const s = await auth();
  if (!s) throw new Error('unauthorized');
}

function invalidate() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/references');
}

export async function createReference(input: Partial<RefInputType>) {
  await requireAuth();
  const last = await db.reference.findFirst({ orderBy: { order: 'desc' } });
  const order = (last?.order ?? -1) + 1;
  const data = parseInput(RefInput, {
    citation: input.citation ?? '',
    published: input.published ?? true,
  });
  const item = await db.reference.create({ data: { ...data, order } });
  invalidate();
  return { ok: true as const, data: item };
}

export async function updateReference(id: string, input: RefInputType) {
  await requireAuth();
  const data = parseInput(RefInput, input);
  const item = await db.reference.update({ where: { id }, data });
  invalidate();
  return { ok: true as const, data: item };
}

export async function deleteReference(id: string) {
  await requireAuth();
  await db.reference.delete({ where: { id } });
  invalidate();
  return { ok: true as const };
}

export async function reorderReferences(orderedIds: string[]) {
  await requireAuth();
  await db.$transaction(
    orderedIds.map((id, idx) => db.reference.update({ where: { id }, data: { order: idx } }))
  );
  invalidate();
  return { ok: true as const };
}
