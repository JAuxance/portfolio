'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { StationState } from '@prisma/client';

const StationInput = z.object({
  year: z.string().min(1),
  instEn: z.string().min(1),
  instFr: z.string().min(1),
  objEn: z.string().min(1),
  objFr: z.string().min(1),
  state: z.nativeEnum(StationState),
});

type StationInputType = z.infer<typeof StationInput>;

async function requireAuth() {
  const s = await auth();
  if (!s) throw new Error('unauthorized');
}

function invalidate() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/trajectory');
}

export async function createStation(input: Partial<StationInputType>) {
  await requireAuth();
  const last = await db.trajectoryStation.findFirst({ orderBy: { order: 'desc' } });
  const order = (last?.order ?? -1) + 1;
  const data = StationInput.parse({
    year: input.year ?? '20XX',
    instEn: input.instEn ?? 'Untitled',
    instFr: input.instFr ?? 'Sans titre',
    objEn: input.objEn ?? '',
    objFr: input.objFr ?? '',
    state: input.state ?? StationState.PLANNED,
  });
  const item = await db.trajectoryStation.create({ data: { ...data, order } });
  invalidate();
  return { ok: true as const, data: item };
}

export async function updateStation(id: string, input: StationInputType) {
  await requireAuth();
  const data = StationInput.parse(input);
  const item = await db.trajectoryStation.update({ where: { id }, data });
  invalidate();
  return { ok: true as const, data: item };
}

export async function deleteStation(id: string) {
  await requireAuth();
  await db.trajectoryStation.delete({ where: { id } });
  invalidate();
  return { ok: true as const };
}

export async function reorderStations(orderedIds: string[]) {
  await requireAuth();
  await db.$transaction(
    orderedIds.map((id, idx) => db.trajectoryStation.update({ where: { id }, data: { order: idx } }))
  );
  invalidate();
  return { ok: true as const };
}
