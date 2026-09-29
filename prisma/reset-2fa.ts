// Emergency escape hatch if the 2FA phone is lost: turns TOTP off for an admin.
// Needs direct DB access, so it's only runnable by whoever controls the server:
//
//   docker compose -f docker-compose.prod.yml run --rm migrate \
//     node_modules/.bin/tsx prisma/reset-2fa.ts [email]
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  if (!email) throw new Error('usage: tsx prisma/reset-2fa.ts <email>');
  const { count } = await db.adminUser.updateMany({
    where: { email },
    data: { totpEnabled: false, totpSecret: null, totpLastStep: null },
  });
  console.log(count ? `2FA disabled for ${email}` : `No admin with email ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
