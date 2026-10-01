import { PrismaClient, Locale } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { projectSeedData } from './projects.data';
import { profileCopy, nowItemsCopy, researchCopy, trajectoryCopy } from './content.data';

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'jauxance@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'change-me-after-first-login';

  // Admin
  const hash = await bcrypt.hash(adminPassword, 12);
  await db.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hash },
    create: { email: adminEmail, passwordHash: hash },
  });

  // Profile (singleton)
  const existingProfile = await db.profile.findFirst();
  const profileData = {
    name: 'Auxance Jourdan',
    handle: 'Auxance',
    emailPublic: 'jauxance@gmail.com',
    github: 'https://github.com/JAuxance',
    linkedin: 'https://linkedin.com/in/auxance',
    twitter: 'https://x.com/Auxance_J',
    readcv: 'https://read.cv/auxance',
    ...profileCopy,
    contactBlurbEn:
      'Open to ML research collaborations, and quiet conversations about the path',
    contactBlurbFr:
      'Ouvert aux collaborations de recherche ML, et aux conversations posées sur le chemin.',
    defaultLocale: Locale.EN,
  };
  if (existingProfile) {
    await db.profile.update({ where: { id: existingProfile.id }, data: profileData });
  } else {
    await db.profile.create({ data: profileData });
  }

  // Now items
  await db.nowItem.deleteMany({});
  await db.nowItem.createMany({ data: nowItemsCopy });

  // Projects
  await db.project.deleteMany({});
  await db.project.createMany({ data: projectSeedData });

  await db.researchTopic.deleteMany({});
  await db.researchTopic.createMany({ data: researchCopy });

  // References
  await db.reference.deleteMany({});
  await db.reference.createMany({
    data: [
      {
        citation: 'Elhage et al. (2022). Toy Models of Superposition. Anthropic.',
        order: 0,
      },
      {
        citation: 'Nanda, N. (2023). 200 Concrete Open Problems in Mechanistic Interpretability.',
        order: 1,
      },
      {
        citation: 'Guo, D. et al. (2025). DeepSeek-R1: Incentivizing Reasoning in LLMs via RL.',
        order: 2,
      },
      {
        citation: 'Olsson et al. (2022). In-context Learning and Induction Heads. Anthropic.',
        order: 3,
      },
    ],
  });

  // Trajectory
  await db.trajectoryStation.deleteMany({});
  await db.trajectoryStation.createMany({ data: trajectoryCopy });

  console.log('Seed completed.');
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
