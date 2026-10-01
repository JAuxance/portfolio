/**
 * Targeted content update for an existing database.
 *
 * Unlike prisma/seed.ts this does NOT wipe everything: it leaves the admin
 * user, profile contact details, references, Manager, Stela and any hero
 * image uploaded through /admin untouched.
 *
 *   npm run db:sync
 */
import { PrismaClient, BookStatus } from '@prisma/client';
import { projectSeedData } from './projects.data';
import { profileCopy, nowItemsCopy, researchCopy, trajectoryCopy } from './content.data';

const db = new PrismaClient();
const SYNCED_PROJECTS = ['taskflow', 'ai-journey'];

async function main() {
  const profile = await db.profile.findFirst();
  if (profile) {
    await db.profile.update({ where: { id: profile.id }, data: profileCopy });
    console.log('profile: abstract updated');
  }

  await db.nowItem.deleteMany({});
  await db.nowItem.createMany({ data: nowItemsCopy });
  console.log(`now: ${nowItemsCopy.length} items`);

  const removed = await db.project.deleteMany({ where: { slug: 'jobmatch' } });
  console.log(`projects: removed jobmatch (${removed.count})`);
  for (const data of projectSeedData.filter((p) => SYNCED_PROJECTS.includes(p.slug))) {
    // Keep whatever hero image was uploaded in the admin.
    await db.project.upsert({
      where: { slug: data.slug },
      update: { ...data, heroImage: undefined },
      create: data,
    });
    console.log(`projects: upserted ${data.slug}`);
  }

  await db.researchTopic.deleteMany({});
  await db.researchTopic.createMany({ data: researchCopy });
  await db.trajectoryStation.deleteMany({});
  await db.trajectoryStation.createMany({ data: trajectoryCopy });
  console.log('research + trajectory replaced');

  const book = await db.book.findFirst({ where: { published: true } });
  if (book) {
    await db.book.update({ where: { id: book.id }, data: { status: BookStatus.PAUSED } });
    console.log('book: status PAUSED');
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
