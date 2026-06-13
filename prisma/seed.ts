import { PrismaClient, ProjectStatus, StationState, Locale } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { projectSeedData } from './projects.data';

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
    twitter: 'https://x.com/AuxanceJ',
    readcv: 'https://read.cv/auxance',
    abstractEn:
      'Full-stack student at Holberton building production systems by day, training myself toward ML research by night. Five years from now I want to be inside a frontier lab in China — this site is the receipt for that bet.',
    abstractFr:
      "Étudiant full-stack à Holberton, je construis des systèmes en production le jour et m'entraîne à la recherche ML la nuit. Dans cinq ans, je veux être dans un laboratoire de pointe en Chine — ce site est la preuve de ce pari.",
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
  await db.nowItem.createMany({
    data: [
      {
        label: 'LEARNING',
        titleEn: 'AI Journey — word embeddings, by hand',
        titleFr: 'AI Journey — les word embeddings, à la main',
        bodyEn:
          'Deep in the representations chapter of AI Journey: how words become vectors — co-occurrence, word2vec, skip-gram, negative sampling — implemented in NumPy before any framework touches it. The rule stands: never train a model I can’t explain.',
        bodyFr:
          "En plein chapitre représentations d'AI Journey : comment les mots deviennent des vecteurs — co-occurrence, word2vec, skip-gram, negative sampling — implémentés en NumPy avant de toucher un framework. La règle tient : ne jamais entraîner un modèle que je ne sais pas expliquer.",
        stack: 'NumPy · word2vec · scikit-learn',
        order: 0,
        published: true,
      },
      {
        label: 'BUILDING',
        titleEn: 'JobMatch — Demoday, July 2026',
        titleFr: 'JobMatch — Demoday, juillet 2026',
        bodyEn:
          'Shipping the matching platform for Demoday: local CV extraction with Ollama, offers aggregated from four sources, an explainable 0–100 score.',
        bodyFr:
          "Je prépare la plateforme de matching pour le Demoday : extraction de CV en local avec Ollama, offres agrégées depuis quatre sources, un score sur 100 explicable.",
        stack: 'FastAPI · React 19 · Ollama',
        order: 1,
        published: true,
      },
      {
        label: 'WRITING',
        titleEn: 'The Substack journal',
        titleFr: 'Le journal Substack',
        bodyEn:
          'Writing the first entries of the road-to-the-PhD journal — what I learn, what breaks, what changes my mind. It plugs into the Journal section the moment it goes live.',
        bodyFr:
          "J'écris les premières entrées du journal de route vers le doctorat — ce que j'apprends, ce qui casse, ce qui me fait changer d'avis. Il se branchera dans la section Journal dès la mise en ligne.",
        stack: 'Substack',
        order: 2,
        published: true,
      },
    ],
  });

  // Projects
  await db.project.deleteMany({});
  await db.project.createMany({ data: projectSeedData });

  await db.researchTopic.deleteMany({});
  await db.researchTopic.createMany({
    data: [
      {
        number: '01',
        titleEn: 'Mechanistic interpretability of agentic systems',
        titleFr: 'Interprétabilité mécaniste des systèmes agentiques',
        bodyEn:
          'How do you trace a decision back through a chain of LLM calls when the chain itself is dynamic? The current literature treats agents as black boxes whose inputs and outputs we audit — I want to open the box.',
        bodyFr:
          "Comment tracer une décision à travers une chaîne d'appels LLM quand la chaîne elle-même est dynamique ? La littérature actuelle traite les agents comme des boîtes noires dont on audite les entrées et sorties — je veux ouvrir la boîte.",
        order: 0,
        published: true,
      },
      {
        number: '02',
        titleEn: 'Calibration under distribution shift',
        titleFr: 'Calibration sous décalage de distribution',
        bodyEn:
          'Most calibration work assumes a stationary world. The world is not stationary. I want to understand when a calibrated model stops being calibrated and what cheap signals detect it.',
        bodyFr:
          'La plupart des travaux de calibration supposent un monde stationnaire. Le monde ne l’est pas. Je veux comprendre quand un modèle calibré cesse de l’être et quels signaux pas chers le détectent.',
        order: 1,
        published: true,
      },
      {
        number: '03',
        titleEn: 'Cross-lingual interpretability (EN / 中文)',
        titleFr: 'Interprétabilité cross-lingue (EN / 中文)',
        bodyEn:
          'Do the same circuits implement the same concepts across languages, or do they merely converge on the same outputs by different means? This is the question that will pull me toward the Chinese research ecosystem.',
        bodyFr:
          "Les mêmes circuits implémentent-ils les mêmes concepts à travers les langues, ou convergent-ils seulement sur les mêmes sorties par d'autres moyens ? C'est la question qui me tirera vers l'écosystème de recherche chinois.",
        order: 2,
        published: true,
      },
    ],
  });

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
  await db.trajectoryStation.createMany({
    data: [
      {
        year: '2023 — 2024',
        instEn: 'Holberton School — Foundations',
        instFr: 'École Holberton — Fondations',
        objEn: 'Low-level C, systems, networking. The year I learned how a machine actually works.',
        objFr: 'C bas niveau, systèmes, réseau. L’année où j’ai appris comment une machine fonctionne vraiment.',
        state: StationState.PLANNED,
        order: 0,
      },
      {
        year: '2024 — 2025',
        instEn: 'Holberton School — Specialization',
        instFr: 'École Holberton — Spécialisation',
        objEn: 'Full-stack, ML fundamentals, JobMatch as the capstone artifact.',
        objFr: 'Full-stack, fondamentaux ML, JobMatch comme artefact capstone.',
        state: StationState.PLANNED,
        order: 1,
      },
      {
        year: '2025 — 2026',
        instEn: 'JobMatch — production',
        instFr: 'JobMatch — production',
        objEn:
          'Ship JobMatch with three paying partners. Use the revenue to fund six months of dedicated research training.',
        objFr:
          "Mettre JobMatch en production avec trois partenaires payants. Utiliser le revenu pour financer six mois d'entraînement dédié à la recherche.",
        state: StationState.CURRENT,
        order: 2,
      },
      {
        year: '2026 — 2027',
        instEn: 'Research apprenticeship',
        instFr: 'Apprentissage de la recherche',
        objEn:
          'Apply to research engineer roles at frontier labs. Publish at least one workshop paper on interpretability of agentic systems.',
        objFr:
          "Postuler à des postes d'ingénieur de recherche dans des labos de pointe. Publier au moins un workshop paper sur l'interprétabilité des systèmes agentiques.",
        state: StationState.PLANNED,
        order: 3,
      },
      {
        year: '2027 — 2029',
        instEn: 'Master’s in ML / China',
        instFr: 'Master ML / Chine',
        objEn:
          'Reach HSK 5, then enrol in a Chinese master’s program. The goal is to be inside the ecosystem, not commenting on it from the outside.',
        objFr:
          "Atteindre HSK 5, puis intégrer un master en Chine. L'objectif est d'être dans l'écosystème, pas de commenter depuis l'extérieur.",
        state: StationState.PLANNED,
        order: 4,
      },
      {
        year: '2030 →',
        instEn: 'Frontier lab — research scientist',
        instFr: 'Laboratoire de pointe — chercheur',
        objEn: 'Inside the room where the questions get decided.',
        objFr: 'Dans la pièce où les questions se décident.',
        state: StationState.GOAL,
        order: 5,
      },
    ],
  });

  console.log('Seed completed.');
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
