'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { flexibleUrl, parseInput } from '@/lib/validate';
import { Locale } from '@prisma/client';

const ProfileInput = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  emailPublic: z.string().email(),
  github: flexibleUrl,
  linkedin: flexibleUrl,
  twitter: flexibleUrl,
  readcv: flexibleUrl,
  abstractEn: z.string().min(1),
  abstractFr: z.string().min(1),
  contactBlurbEn: z.string().min(1),
  contactBlurbFr: z.string().min(1),
  defaultLocale: z.nativeEnum(Locale),
});

type ProfileInputType = z.infer<typeof ProfileInput>;

async function requireAuth() {
  const s = await auth();
  if (!s) throw new Error('unauthorized');
}

export async function updateProfile(input: ProfileInputType) {
  await requireAuth();
  const data = parseInput(ProfileInput, input);
  const existing = await db.profile.findFirst();
  const profile = existing
    ? await db.profile.update({ where: { id: existing.id }, data })
    : await db.profile.create({ data });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/profile');
  return { ok: true as const, data: profile };
}
