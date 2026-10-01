import { Prisma, StationState } from '@prisma/client';

/**
 * Site copy shared by prisma/seed.ts (full reset) and prisma/sync-content.ts
 * (targeted update that leaves the rest of the database alone).
 */

export const profileCopy = {
  abstractEn:
    'Full-stack developer in training (Flask, PostgreSQL, Docker), in a RNCP level 5 Web & Mobile Web Developer programme. I am preparing for AI/ML and, later, research. I build small things end to end and write down what I actually ended up understanding.',
  abstractFr:
    "Développeur full-stack en formation (Flask, PostgreSQL, Docker), en RNCP niveau 5 Développeur Web & Web Mobile. Je me prépare à l'IA/ML et, plus tard, à la recherche. Je construis de petits projets de bout en bout et j'écris ce que j'ai fini par comprendre.",
};

export const nowItemsCopy: Prisma.NowItemCreateManyInput[] = [
  {
    label: 'BUILDING',
    titleEn: 'TaskFlow — project and task management',
    titleFr: 'TaskFlow — gestion de projets et de tâches',
    bodyEn:
      'A Flask app for freelancers and small teams: Workspace → Projects → Tasks, four roles (owner, admin, member, guest), centralised permission checks, workspace chat and direct messages. Docker Compose, Caddy, Gunicorn, PostgreSQL, Redis. Not finished — it is the project behind my RNCP5 certification file, due 31 December 2026. A demo runs at taskflow.auxance.dev.',
    bodyFr:
      "Une application Flask pour freelances et petites équipes : Workspace → Projets → Tâches, quatre rôles (owner, admin, member, guest), contrôle des permissions centralisé, chat de workspace et messages directs. Docker Compose, Caddy, Gunicorn, PostgreSQL, Redis. Pas terminé — c'est le projet de mon dossier de certification RNCP5, à rendre le 31 décembre 2026. Une démo tourne sur taskflow.auxance.dev.",
    stack: 'Flask · PostgreSQL · Docker',
    order: 0,
    published: true,
  },
  {
    label: 'LEARNING',
    titleEn: 'AI Journey — Word2Vec in PyTorch',
    titleFr: 'AI Journey — Word2Vec en PyTorch',
    bodyEn:
      'I implemented Word2Vec in PyTorch: input and output embeddings, negative sampling, BCEWithLogitsLoss, plain SGD. It sits in my sandbox folder, not in the released one — I am still working out what each piece does. Next: a V2 of the portfolio bot with sentence embeddings, compared honestly against the V1 (TF-IDF + logistic regression, macro F1 0.629).',
    bodyFr:
      "J'ai implémenté Word2Vec en PyTorch : embeddings d'entrée et de sortie, negative sampling, BCEWithLogitsLoss, SGD simple. Il est dans mon dossier sandbox, pas dans celui des modèles publiés — je finis encore de comprendre le rôle de chaque pièce. Ensuite : une V2 du bot de portfolio avec des sentence embeddings, comparée honnêtement à la V1 (TF-IDF + régression logistique, F1 macro 0,629).",
    stack: 'PyTorch · Python',
    order: 1,
    published: true,
  },
  {
    label: 'LEARNING',
    titleEn: 'Maths for AI',
    titleFr: "Maths pour l'IA",
    bodyEn: 'Linear algebra first, in notebooks, with NumPy.',
    bodyFr: "L'algèbre linéaire d'abord, en notebooks, avec NumPy.",
    stack: 'NumPy · Jupyter',
    order: 2,
    published: true,
  },
  {
    label: 'LEARNING',
    titleEn: 'Mandarin',
    titleFr: 'Mandarin',
    bodyEn: 'Beginner. Pinyin and tones for now.',
    bodyFr: 'Débutant. Pinyin et tons pour l’instant.',
    stack: '',
    order: 3,
    published: true,
  },
  {
    label: 'PAUSED',
    titleEn: 'The book — on pause',
    titleFr: 'Le livre — en pause',
    bodyEn:
      'The book is on pause for now. The chapters already published stay readable here.',
    bodyFr:
      'Le livre est en pause pour le moment. Les chapitres déjà publiés restent lisibles ici.',
    stack: 'Book Studio',
    order: 4,
    published: true,
  },
];

export const researchCopy: Prisma.ResearchTopicCreateManyInput[] = [
  {
    number: '01',
    titleEn: 'Understanding models from the inside',
    titleFr: "Comprendre les modèles de l'intérieur",
    bodyEn:
      'I want to know how models represent things, not just use them. For now that means rebuilding small pieces by hand (embeddings, classifiers) and reading papers I only partly follow. Mechanistic interpretability is the area that pulls me; I am a long way from doing any of it.',
    bodyFr:
      "Je veux savoir comment les modèles représentent les choses, pas seulement les utiliser. Pour l'instant, ça veut dire reconstruire de petites pièces à la main (embeddings, classifieurs) et lire des papiers que je ne suis qu'en partie. L'interprétabilité mécaniste est le domaine qui m'attire ; je suis loin d'en faire.",
    order: 0,
    published: true,
  },
  {
    number: '02',
    titleEn: 'Calibration and distribution shift',
    titleFr: 'Calibration et décalage de distribution',
    bodyEn:
      'A topic I have read about and find interesting: what happens to a model’s confidence once the data stops looking like the training set. Something I want to understand, not something I have worked on.',
    bodyFr:
      "Un sujet sur lequel j'ai lu et qui m'intéresse : ce qu'il advient de la confiance d'un modèle quand les données ne ressemblent plus à celles d'entraînement. Quelque chose que je veux comprendre, pas quelque chose sur lequel j'ai travaillé.",
    order: 1,
    published: true,
  },
  {
    number: '03',
    titleEn: 'Cross-lingual representations (EN / 中文)',
    titleFr: 'Représentations cross-lingues (EN / 中文)',
    bodyEn:
      'Do models represent the same concept the same way across languages? It ties into why I am learning Mandarin. A question for now, not a project.',
    bodyFr:
      "Les modèles représentent-ils le même concept de la même façon d'une langue à l'autre ? Ça rejoint la raison pour laquelle j'apprends le mandarin. Une question pour l'instant, pas un projet.",
    order: 2,
    published: true,
  },
];

export const trajectoryCopy: Prisma.TrajectoryStationCreateManyInput[] = [
  {
    year: '2025 — 2026',
    instEn: 'Holberton School',
    instFr: 'École Holberton',
    objEn:
      'C, systems, networking, Python and web fundamentals. Where I learned how a machine actually works.',
    objFr:
      'C, systèmes, réseau, Python et bases du web. Là où j’ai appris comment une machine fonctionne vraiment.',
    state: StationState.PAST,
    order: 0,
  },
  {
    year: '2026',
    instEn: 'RNCP5 — Web & Mobile Web Developer',
    instFr: 'RNCP5 — Développeur Web & Web Mobile',
    objEn:
      'Finish TaskFlow and the certification file, due 31 December 2026. Alongside: maths for AI, AI Journey, Mandarin.',
    objFr:
      'Terminer TaskFlow et le dossier de certification, à rendre le 31 décembre 2026. En parallèle : maths pour l’IA, AI Journey, mandarin.',
    state: StationState.CURRENT,
    order: 1,
  },
  {
    year: '2027',
    instEn: 'Baccalauréat, as a candidat libre',
    instFr: 'Bac de français et bac en candidat libre',
    objEn:
      'The French bac (bac de français) and the baccalauréat as a candidat libre, to open the door to a bachelor’s degree.',
    objFr:
      'Le bac de français puis le baccalauréat en candidat libre, pour ouvrir la porte à une licence.',
    state: StationState.PLANNED,
    order: 2,
  },
  {
    year: '~2028 — 2031',
    instEn: 'Bachelor’s degree, France',
    instFr: 'Licence, France',
    objEn: 'A bachelor’s degree in France, with the foundations in maths and computer science. Not applied for yet.',
    objFr:
      'Une licence en France, pour les bases en maths et en informatique. Pas encore de candidature.',
    state: StationState.PLANNED,
    order: 3,
  },
  {
    year: '~2031 — 2033',
    instEn: 'Master’s degree, France',
    instFr: 'Master, France',
    objEn: 'A demanding master’s in France, aimed at ML.',
    objFr: 'Un master exigeant en France, orienté ML.',
    state: StationState.PLANNED,
    order: 4,
  },
  {
    year: '~2033 →',
    instEn: 'PhD in China',
    instFr: 'Thèse en Chine',
    objEn:
      'Live, study and work in China, and build a network there. Mandarin is the key to being part of it rather than watching from outside. This is a plan, not a promise.',
    objFr:
      "Vivre, étudier et travailler en Chine, et y construire un réseau. Le mandarin est la clé pour en faire partie plutôt que regarder de l'extérieur. C'est un plan, pas une promesse.",
    state: StationState.GOAL,
    order: 5,
  },
];
