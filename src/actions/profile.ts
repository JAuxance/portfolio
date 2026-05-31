'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Locale } from '@prisma/client';

const ProfileInput = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  emailPublic: z.string().email(),
  github: z.string().url().optional().nullable().or(z.literal('')),
  linkedin: z.string().url().optional().nullable().or(z.literal('')),
  twitter: z.string().url().optional().nullable().or(z.literal('')),
  readcv: z.string().url().optional().nullable().or(z.literal('')),
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
  const data = ProfileInput.parse(input);
  const normalized = {
    ...data,
    github: data.github === '' ? null : data.github ?? null,
    linkedin: data.linkedin === '' ? null : data.linkedin ?? null,
    twitter: data.twitter === '' ? null : data.twitter ?? null,
    readcv: data.readcv === '' ? null : data.readcv ?? null,
  };
  const existing = await db.profile.findFirst();
  const profile = existing
    ? await db.profile.update({ where: { id: existing.id }, data: normalized })
    : await db.profile.create({ data: normalized });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/profile');
  return { ok: true as const, data: profile };
}
