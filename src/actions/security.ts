'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateTotpSecret, totpUri, verifyTotp } from '@/lib/totp';

async function requireAdmin() {
  const s = await auth();
  const id = s?.user?.id;
  if (!id) throw new Error('unauthorized');
  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) throw new Error('unauthorized');
  return user;
}

/** Starts (or restarts) enrollment: stores a fresh secret, not yet enforced. */
export async function startTotpSetup() {
  const user = await requireAdmin();
  if (user.totpEnabled) throw new Error('La double authentification est déjà active.');
  const secret = generateTotpSecret();
  await db.adminUser.update({
    where: { id: user.id },
    data: { totpSecret: secret, totpLastStep: null },
  });
  return { secret, uri: totpUri(secret, user.email) };
}

/** Enables 2FA once the phone proves it holds the secret. */
export async function confirmTotpSetup(code: string) {
  const user = await requireAdmin();
  if (!user.totpSecret || user.totpEnabled) return { ok: false as const };
  const step = verifyTotp(user.totpSecret, code);
  if (step === null) return { ok: false as const };
  await db.adminUser.update({
    where: { id: user.id },
    data: { totpEnabled: true, totpLastStep: step },
  });
  revalidatePath('/admin/settings');
  return { ok: true as const };
}

/** Turning 2FA off requires a current code, so a stolen session alone can't. */
export async function disableTotp(code: string) {
  const user = await requireAdmin();
  if (!user.totpEnabled || !user.totpSecret) return { ok: false as const };
  if (verifyTotp(user.totpSecret, code, user.totpLastStep) === null) return { ok: false as const };
  await db.adminUser.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null, totpLastStep: null },
  });
  revalidatePath('/admin/settings');
  return { ok: true as const };
}
