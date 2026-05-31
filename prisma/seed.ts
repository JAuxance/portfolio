import { PrismaClient, ProjectStatus, StationState, Locale } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
    github: 'https://github.com/auxance',
    linkedin: 'https://linkedin.com/in/auxance',
    twitter: 'https://twitter.com/auxance',
    readcv: 'https://read.cv/auxance',
    abstractEn:
      'Full-stack student at Holberton building production systems by day, training myself toward ML research by night. Five years from now I want to be inside a frontier lab in China — this site is the receipt for that bet.',
    abstractFr:
      "Étudiant full-stack à Holberton, je construis des systèmes en production le jour et m'entraîne à la recherche ML la nuit. Dans cinq ans, je veux être dans un laboratoire de pointe en Chine — ce site est la preuve de ce pari.",
    contactBlurbEn:
      'Open to ML research collaborations, full-stack contracts, and quiet conversations about the path between them.',
    contactBlurbFr:
      'Ouvert aux collaborations de recherche ML, aux contrats full-stack, et aux conversations posées sur le chemin entre les deux.',
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
        label: 'BUILDING',
        titleEn: 'JobMatch — AI hiring engine',
        titleFr: 'JobMatch — moteur de recrutement IA',
        bodyEn:
          'A multi-agent system that parses résumés and matches candidates to roles with calibrated confidence. Going live with three pilot partners this spring.',
        bodyFr:
          "Un système multi-agents qui analyse les CV et matche les candidats aux postes avec une confiance calibrée. En production chez trois partenaires pilotes ce printemps.",
        stack: 'Next.js · Anthropic API · Postgres · Vector search',
        order: 0,
        published: true,
      },
      {
        label: 'LEARNING',
        titleEn: 'Mechanistic interpretability',
        titleFr: 'Interprétabilité mécaniste',
        bodyEn:
          'Working through Neel Nanda’s 200 concrete problems, replicating circuits papers, and writing weekly notes on what bends my intuition.',
        bodyFr:
          'Je travaille les 200 problèmes concrets de Neel Nanda, je réplique des papers sur les circuits, et je publie chaque semaine ce qui plie mon intuition.',
        stack: 'PyTorch · TransformerLens · NumPy',
        order: 1,
        published: true,
      },
      {
        label: 'STUDYING',
        titleEn: 'Mandarin (HSK 3 → 4)',
        titleFr: 'Mandarin (HSK 3 → 4)',
        bodyEn:
          'Two hours daily, six days a week. Reading short ML papers in Chinese to make the technical vocabulary stick.',
        bodyFr:
          'Deux heures par jour, six jours sur sept. Je lis de courts papers ML en chinois pour ancrer le vocabulaire technique.',
        stack: 'Anki · Du Chinese · HelloChinese · Real papers',
        order: 2,
        published: true,
      },
    ],
  });

  // Projects
  await db.project.deleteMany({});
  await db.project.createMany({
    data: [
      {
        slug: 'jobmatch',
        nameEn: 'JobMatch',
        nameFr: 'JobMatch',
        taglineEn:
          'An AI hiring engine that reads résumés the way a senior recruiter would, then explains its reasoning.',
        taglineFr:
          "Un moteur de recrutement IA qui lit les CV comme le ferait un recruteur sénior, puis explique son raisonnement.",
        status: ProjectStatus.BUILDING,
        stack: ['Next.js', 'Anthropic API', 'Postgres', 'pgvector', 'Tailwind'],
        liveUrl: 'https://jobmatch.example.com',
        repoUrl: 'https://github.com/auxance/jobmatch',
        featured: true,
        order: 0,
        published: true,
        contextEn: [
          'Recruiting tools today do one of two things: keyword-match résumés to job descriptions, or hand the whole problem to an LLM with no scaffolding. The first misses every nuance; the second hallucinates confidently. JobMatch is the middle path.',
          'It uses a multi-agent pipeline — a parser, a normalizer, a matcher, and a critic — each with a narrow job and a verifiable output. Calibrated confidence scores are first-class citizens. Every score is explainable down to the résumé span and the job-description criterion that produced it.',
          'Three pilot partners are running it on live pipelines this spring. The goal: cut time-to-shortlist in half while making the shortlist auditable.',
        ],
        contextFr: [
          "Les outils de recrutement font aujourd'hui l'une de deux choses : matcher des mots-clés aux descriptions de poste, ou remettre tout le problème à un LLM sans garde-fous. Le premier rate chaque nuance ; le second hallucine avec aplomb. JobMatch est la voie médiane.",
          "Le pipeline multi-agents — parseur, normaliseur, matcher, et critique — donne à chacun un rôle étroit et une sortie vérifiable. Les scores de confiance calibrés sont des citoyens de première classe. Chaque score se trace jusqu'au passage du CV et au critère du poste qui l'ont produit.",
          'Trois partenaires pilotes le font tourner sur des pipelines réels ce printemps. Objectif : diviser par deux le temps avant short-list tout en la rendant auditable.',
        ],
        architecture: [
          {
            layer: 'Frontend',
            primary: 'Next.js 15 · App Router · RSC',
            notesEn: 'Server Components for recruiter dashboards; client islands for the candidate drawer.',
            notesFr: 'Server Components pour les dashboards recruteur ; îlots client pour le drawer candidat.',
          },
          {
            layer: 'Backend',
            primary: 'Server Actions · tRPC for typed RPC',
            notesEn: 'Mutations stay typed end-to-end. Long-running jobs go to a Vercel queue.',
            notesFr: 'Les mutations restent typées de bout en bout. Les jobs longs partent en queue Vercel.',
          },
          {
            layer: 'Data',
            primary: 'Postgres + pgvector',
            notesEn: '1536-dim embeddings indexed with HNSW. JSONB for résumé spans.',
            notesFr: 'Embeddings 1536-d indexés en HNSW. JSONB pour les passages de CV.',
          },
          {
            layer: 'AI Parsing',
            primary: 'Anthropic claude-sonnet-4-6 with structured outputs',
            notesEn: 'Zod schemas validate every agent output before it enters the pipeline.',
            notesFr: 'Des schémas Zod valident chaque sortie d’agent avant qu’elle n’entre dans le pipeline.',
          },
          {
            layer: 'Matching',
            primary: 'Hybrid: dense embeddings + structured criteria',
            notesEn: 'A critic agent reranks and produces the audit trail recruiters see.',
            notesFr: 'Un agent critique re-classe et produit la piste d’audit que voient les recruteurs.',
          },
        ],
        decisions: [
          {
            n: '01',
            titleEn: 'Multi-agent over single-prompt',
            titleFr: 'Multi-agents plutôt qu’un prompt unique',
            bodyEn:
              'A single prompt is cheap and confident — and wrong in ways you cannot diagnose. Four narrow agents let each output be tested in isolation, which is the only way I trust putting this in front of a hiring manager.',
            bodyFr:
              "Un prompt unique est bon marché et confiant — et faux d'une manière indiagnosticable. Quatre agents étroits permettent de tester chaque sortie en isolation, seule façon dont j'accepte de mettre ça devant un recruteur.",
          },
          {
            n: '02',
            titleEn: 'Calibrated confidence, not raw scores',
            titleFr: 'Confiance calibrée, pas de scores bruts',
            bodyEn:
              'Recruiters do not need a 0.87 — they need to know whether a candidate is worth ten minutes of their time. The system outputs three buckets, each with a target precision the matching layer is held against.',
            bodyFr:
              "Les recruteurs n'ont pas besoin d'un 0,87 — ils ont besoin de savoir si un candidat vaut dix minutes de leur temps. Le système renvoie trois bins, chacun avec une précision cible à laquelle le matching est tenu.",
          },
          {
            n: '03',
            titleEn: 'Explainability over accuracy',
            titleFr: 'Explicabilité avant précision',
            bodyEn:
              'A model that is 3% more accurate but cannot say why a candidate ranked where they did is, in this domain, worse. Every score links back to verbatim spans.',
            bodyFr:
              "Un modèle 3% plus précis mais incapable de dire pourquoi un candidat a son rang est, dans ce domaine, pire. Chaque score se lie à des passages verbatim.",
          },
        ],
        lessons: [
          {
            label: 'TECHNICAL',
            textEn:
              'Constraining LLM output with Zod plus a critic agent gets you 90% of the way to reliability. The remaining 10% is observability — logs you can actually search.',
            textFr:
              "Contraindre la sortie LLM avec Zod plus un agent critique vous amène à 90% de fiabilité. Les 10% restants, c'est l'observabilité — des logs vraiment cherchables.",
          },
          {
            label: 'PRODUCT',
            textEn:
              'Recruiters do not want AI to decide. They want AI to triage. Reframing the product around that one sentence cut the feature scope in half.',
            textFr:
              "Les recruteurs ne veulent pas que l'IA décide. Ils veulent qu'elle trie. Reformuler le produit autour de cette phrase a coupé le scope de moitié.",
          },
          {
            label: 'TEAM',
            textEn:
              'Working solo on a multi-agent system means you have to be your own staff engineer at 11pm. Writing decision docs to my future self saved me four times.',
            textFr:
              'Travailler seul sur un système multi-agents oblige à être son propre staff engineer à 23h. Écrire des decision docs à mon futur moi m’a sauvé quatre fois.',
          },
          {
            label: 'TRANSITION',
            textEn:
              'Every shipped pipeline brings me closer to the research side: I now know what production constraints look like, which is the half of ML research undergrads never see.',
            textFr:
              "Chaque pipeline livré me rapproche de la recherche : je vois maintenant à quoi ressemblent les contraintes de production, la moitié de la recherche ML que les étudiants ne voient jamais.",
          },
        ],
        timelineEn: '2024 — 2026',
        timelineFr: '2024 — 2026',
        roleEn: 'Solo founder / engineer',
        roleFr: 'Fondateur / ingénieur solo',
        teamEn: '1 (plus three design partners)',
        teamFr: '1 (plus trois partenaires de design)',
        contextLabelEn: 'Independent startup',
        contextLabelFr: 'Startup indépendante',
      },
      {
        slug: 'transformer-from-scratch',
        nameEn: 'Transformer from scratch',
        nameFr: 'Transformer depuis zéro',
        taglineEn: 'A 124M-param decoder trained on a single GPU, with a journal of every wrong turn.',
        taglineFr: 'Un decoder 124M-params entraîné sur un seul GPU, avec un journal de chaque erreur.',
        status: ProjectStatus.SHIPPED,
        stack: ['PyTorch', 'CUDA', 'WandB'],
        liveUrl: null,
        repoUrl: 'https://github.com/auxance/transformer',
        featured: false,
        order: 1,
        published: true,
        contextEn: [
          'I built a 124M-parameter decoder-only transformer from scratch — tokenizer, attention, training loop, eval — over six weekends. The point was not to compete with GPT-2; it was to know every line of the stack.',
        ],
        contextFr: [
          'J’ai construit un transformer decoder-only 124M-params depuis zéro — tokenizer, attention, training loop, eval — sur six week-ends. Le but n’était pas de concurrencer GPT-2 ; c’était de connaître chaque ligne de la stack.',
        ],
      },
      {
        slug: 'holberton-printf',
        nameEn: 'C — _printf rebuild',
        nameFr: 'C — refonte de _printf',
        taglineEn: 'A pair-coded reimplementation of printf in C, with a varargs system that does not leak.',
        taglineFr: 'Une réimplémentation en pair-coding de printf en C, avec un système varargs qui ne fuit pas.',
        status: ProjectStatus.SHIPPED,
        stack: ['C', 'Make', 'valgrind'],
        liveUrl: null,
        repoUrl: 'https://github.com/auxance/printf',
        featured: false,
        order: 2,
        published: true,
        contextEn: ['Holberton low-level fundamentals project. Paired with a classmate; we wrote it in two sittings and spent a third hardening it against valgrind.'],
        contextFr: ['Projet bas niveau de Holberton. En binôme avec un camarade ; deux sessions pour l’écrire, une troisième pour le durcir contre valgrind.'],
      },
      {
        slug: 'airbnb-clone',
        nameEn: 'AirBnB clone',
        nameFr: 'Clone AirBnB',
        taglineEn: 'A four-stage Holberton project: object storage, HTTP API, Flask UI, deployment with Nginx.',
        taglineFr: 'Un projet Holberton en quatre étapes : storage objet, API HTTP, UI Flask, déploiement Nginx.',
        status: ProjectStatus.SHIPPED,
        stack: ['Python', 'Flask', 'MySQL', 'Nginx'],
        liveUrl: null,
        repoUrl: 'https://github.com/auxance/airbnb',
        featured: false,
        order: 3,
        published: true,
        contextEn: ['Four-month long Holberton capstone. The most valuable lesson was watching the same domain model evolve from in-memory dicts to a relational schema.'],
        contextFr: ['Capstone Holberton de quatre mois. Leçon la plus précieuse : voir le même modèle de domaine passer de dicts en mémoire à un schéma relationnel.'],
      },
      {
        slug: 'interp-notes',
        nameEn: 'Interpretability notes',
        nameFr: 'Notes d’interprétabilité',
        taglineEn: 'Weekly write-ups replicating circuits papers and noting what surprised me.',
        taglineFr: 'Notes hebdomadaires reproduisant des papers sur les circuits et ce qui m’a surpris.',
        status: ProjectStatus.LEARNING,
        stack: ['PyTorch', 'TransformerLens'],
        liveUrl: 'https://auxance.dev/notes',
        repoUrl: null,
        featured: false,
        order: 4,
        published: true,
        contextEn: ['A public notebook where I replicate one interpretability paper per week and write the surprising parts in plain English.'],
        contextFr: ['Un cahier public où je réplique un paper d’interprétabilité par semaine et où j’écris en clair les parties surprenantes.'],
      },
    ],
  });

  // Research
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
