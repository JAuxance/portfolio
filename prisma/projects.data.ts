import { Prisma, ProjectStatus } from '@prisma/client';

/**
 * The real projects — single source of truth shared by prisma/seed.ts and
 * one-off sync scripts. Content sourced from the actual repos
 * (github.com/JAuxance/*) and managerladger.com. heroImage stays null:
 * the owner uploads media through the admin.
 */
export const projectSeedData: Prisma.ProjectCreateManyInput[] = [
  {
    slug: 'jobmatch',
    nameEn: 'JobMatch',
    nameFr: 'JobMatch',
    taglineEn:
      'A CV ↔ job-offer matching platform: a local LLM reads the résumé, then every aggregated offer gets an explainable 0–100 compatibility score.',
    taglineFr:
      "Une plateforme de matching CV ↔ offres d'emploi : un LLM local lit le CV, puis chaque offre agrégée reçoit un score de compatibilité sur 100, explicable.",
    status: ProjectStatus.BUILDING,
    stack: ['FastAPI', 'React 19', 'TypeScript', 'Ollama', 'PostgreSQL', 'Tailwind v4'],
    liveUrl: null,
    repoUrl: 'https://github.com/JAuxance/JobMatch',
    heroImage: '/projects/jobmatch.webp',
    featured: true,
    order: 1,
    published: true,
    contextEn: [
      'The user drops a CV as a PDF; a locally-run LLM — an Ollama model purpose-built for the task — extracts the profile: trade, city, skills, experience. Nothing leaves the machine: no third-party AI service ever sees the document.',
      'Offers are aggregated from France Travail, Greenhouse, Lever and Ashby, re-synced every six hours. Each one is scored against the profile across five weighted dimensions — skills (35), trade (30), experience (15), location (10), contract (10) — so a candidate sees why an offer ranks where it does.',
      'FastAPI serves a React 19 SPA (Vite, Tailwind v4, Motion), SQLite by default with Postgres in production. Fully bilingual FR/EN, aiming for WCAG 2.2 AA. Demoday is July 2026.',
    ],
    contextFr: [
      "L'utilisateur dépose son CV en PDF ; un LLM exécuté en local — un modèle Ollama construit pour la tâche — en extrait le profil : métier, ville, compétences, expérience. Rien ne quitte la machine : aucun service IA tiers ne voit le document.",
      "Les offres sont agrégées depuis France Travail, Greenhouse, Lever et Ashby, resynchronisées toutes les six heures. Chacune est scorée contre le profil sur cinq dimensions pondérées — compétences (35), métier (30), expérience (15), localisation (10), contrat (10) — pour qu'un candidat voie pourquoi une offre est classée là où elle est.",
      'FastAPI sert une SPA React 19 (Vite, Tailwind v4, Motion), SQLite par défaut et Postgres en production. Entièrement bilingue FR/EN, avec une cible WCAG 2.2 AA. Demoday en juillet 2026.',
    ],
    architecture: [
      {
        layer: 'Backend',
        primary: 'FastAPI',
        notesEn: 'API under /api with a static SPA fallback; APScheduler re-syncs offers every 6 hours.',
        notesFr: 'API sous /api avec fallback SPA statique ; APScheduler resynchronise les offres toutes les 6 heures.',
      },
      {
        layer: 'Frontend',
        primary: 'React 19 · Vite · Tailwind v4',
        notesEn: 'Bilingual FR/EN with typed i18n, light/dark theme, WCAG 2.2 AA target.',
        notesFr: 'Bilingue FR/EN avec i18n typé, thème clair/sombre, cible WCAG 2.2 AA.',
      },
      {
        layer: 'CV extraction',
        primary: 'Ollama — custom jobmatch-cv model',
        notesEn: 'Runs entirely locally; the résumé never reaches a third-party service.',
        notesFr: 'Tourne entièrement en local ; le CV ne part jamais vers un service tiers.',
      },
      {
        layer: 'Scoring',
        primary: 'Five weighted dimensions',
        notesEn: 'Skills 35 · trade 30 · experience 15 · location 10 · contract 10 — every score is explainable.',
        notesFr: 'Compétences 35 · métier 30 · expérience 15 · localisation 10 · contrat 10 — chaque score est explicable.',
      },
    ],
    decisions: [
      {
        n: '01',
        titleEn: 'A local LLM, not an API',
        titleFr: 'Un LLM local, pas une API',
        bodyEn:
          'A résumé is among the most personal documents a person owns. Extraction runs on a self-hosted Ollama model so the PDF never leaves the infrastructure — privacy as an architecture decision, not a policy page.',
        bodyFr:
          "Un CV est l'un des documents les plus personnels qui soient. L'extraction tourne sur un modèle Ollama auto-hébergé : le PDF ne quitte jamais l'infrastructure — la confidentialité comme décision d'architecture, pas comme page de politique.",
      },
      {
        n: '02',
        titleEn: 'Weighted criteria over a black box',
        titleFr: 'Des critères pondérés plutôt qu’une boîte noire',
        bodyEn:
          'The score is a transparent five-dimension formula rather than an opaque model output. A candidate can see exactly which dimension costs them points on a given offer — and what to change.',
        bodyFr:
          "Le score est une formule transparente à cinq dimensions plutôt qu'une sortie de modèle opaque. Un candidat voit exactement quelle dimension lui coûte des points sur une offre donnée — et quoi changer.",
      },
    ],
    timelineEn: '2026 → Demoday, July 2026',
    timelineFr: '2026 → Demoday, juillet 2026',
    roleEn: 'Full-stack & ML integration',
    roleFr: 'Full-stack & intégration ML',
    teamEn: null,
    teamFr: null,
    contextLabelEn: 'Demoday project',
    contextLabelFr: 'Projet Demoday',
  },
  {
    slug: 'manager',
    nameEn: 'Manager',
    nameFr: 'Manager',
    taglineEn:
      'Count the days, keep the log — a local-first desktop app for discipline: day counter, focus timer, planner, journal. Free forever, no account, no tracking.',
    taglineFr:
      'Compter les jours, tenir le journal — une app desktop local-first pour la discipline : compteur de jours, timer de focus, planning, journal. Gratuite à vie, sans compte, sans tracking.',
    status: ProjectStatus.SHIPPED,
    stack: ['Tauri', 'React', 'SQLite', 'Supabase'],
    liveUrl: 'https://managerladger.com',
    repoUrl: 'https://github.com/JAuxance/manager-releases',
    heroImage: '/projects/manager.webp',
    featured: false,
    order: 2,
    published: true,
    contextEn: [
      'Manager is a stoic productivity app: a day counter with streaks, daily tasks with priorities, a weekly time-block planner, a Pomodoro-style focus timer with an always-on-top widget, a daily journal and progress charts. The philosophy is accountability — what you did, black on white, no reframing.',
      'It is local-first by design: SQLite on disk, no account required, no telemetry, fully usable offline. The core app is free forever; an optional AI coach, Dona, comes by subscription (from €1.99/month, student pricing included) or by bringing your own API key.',
      'Shipped on Windows and Linux (.deb and AUR, releases verified with minisign), with macOS on the way — distributed through managerladger.com.',
    ],
    contextFr: [
      "Manager est une app de productivité stoïque : compteur de jours avec streaks, tâches quotidiennes avec priorités, planning hebdomadaire en time-blocks, timer de focus façon Pomodoro avec widget always-on-top, journal quotidien et graphiques de progression. La philosophie : la responsabilité — ce que tu as fait, noir sur blanc, sans reformulation.",
      "Local-first par conception : SQLite sur disque, aucun compte requis, zéro télémétrie, entièrement utilisable hors ligne. Le cœur de l'app est gratuit à vie ; un coach IA optionnel, Dona, s'ajoute par abonnement (dès 1,99 €/mois, tarif étudiant inclus) ou en apportant sa propre clé API.",
      'Livré sur Windows et Linux (.deb et AUR, releases vérifiées avec minisign), macOS en route — distribué via managerladger.com.',
    ],
    timelineEn: 'Shipped · 2026',
    timelineFr: 'Livré · 2026',
    roleEn: 'Design & engineering, solo',
    roleFr: 'Design & ingénierie, solo',
    teamEn: 'Solo',
    teamFr: 'Solo',
    contextLabelEn: 'Personal product',
    contextLabelFr: 'Produit personnel',
  },
  {
    slug: 'stela',
    nameEn: 'Stela',
    nameFr: 'Stela',
    taglineEn:
      'A minimalist, glassy Markdown notes app for Windows — plain .md files synced straight to your own Google Drive. No server, no tracking, no lock-in.',
    taglineFr:
      'Une app de notes Markdown minimaliste et glassy pour Windows — des fichiers .md synchronisés directement dans votre propre Google Drive. Sans serveur, sans tracking, sans lock-in.',
    status: ProjectStatus.SHIPPED,
    stack: ['Tauri v2', 'Rust', 'React 19', 'TypeScript', 'Google Drive API'],
    liveUrl: null,
    repoUrl: 'https://github.com/JAuxance/Stela',
    heroImage: '/projects/stela.webm',
    featured: false,
    order: 3,
    published: true,
    contextEn: [
      'Stela is WYSIWYG Markdown that round-trips losslessly to plain .md — no split-pane preview, no syntax noise — in a black-and-white, frosted-glass interface with a gliding caret. Rich content is built in: KaTeX math, Mermaid diagrams, Chart.js charts, Excalidraw drawings, images, video and voice notes with a live waveform.',
      'There is no Stela server. Notes live as .md files in the user’s own Google Drive: OAuth 2.0 with PKCE, the drive.file scope only — Stela can touch nothing but the files it created — and the refresh token sits in the OS keychain, never in plain text.',
      'Bilingual FR/EN spell-checking runs fully offline via Hunspell in a background worker. Built with Tauri v2 — a Rust shell around a React 19 front — and shipped as a Windows installer. No analytics, no telemetry.',
    ],
    contextFr: [
      "Stela, c'est du Markdown WYSIWYG qui fait l'aller-retour sans perte vers du .md brut — pas de preview en double panneau, pas de bruit syntaxique — dans une interface noir et blanc en verre dépoli, avec un curseur qui glisse. Le contenu riche est intégré : maths KaTeX, diagrammes Mermaid, graphiques Chart.js, dessins Excalidraw, images, vidéo et notes vocales avec waveform en direct.",
      "Il n'y a pas de serveur Stela. Les notes vivent en fichiers .md dans le Google Drive de l'utilisateur : OAuth 2.0 avec PKCE, le scope drive.file uniquement — Stela ne peut toucher que les fichiers qu'elle a créés — et le refresh token est stocké dans le trousseau de l'OS, jamais en clair.",
      "La correction orthographique bilingue FR/EN tourne entièrement hors ligne via Hunspell dans un worker en arrière-plan. Construit avec Tauri v2 — une coque Rust autour d'un front React 19 — et livré en installateur Windows. Aucune analytics, aucune télémétrie.",
    ],
    architecture: [
      {
        layer: 'Shell',
        primary: 'Tauri v2 + Rust',
        notesEn: 'Native Windows shell; OAuth tokens live in the OS keychain (Credential Manager).',
        notesFr: 'Coque native Windows ; les tokens OAuth vivent dans le trousseau de l’OS (Credential Manager).',
      },
      {
        layer: 'Editor',
        primary: 'React 19 · WYSIWYG Markdown',
        notesEn: 'Inline formatting with a lossless .md round-trip; the note title is simply its first # H1.',
        notesFr: 'Mise en forme inline avec aller-retour .md sans perte ; le titre d’une note est simplement son premier # H1.',
      },
      {
        layer: 'Sync',
        primary: 'Google Drive · drive.file scope',
        notesEn: 'PKCE auth, debounced auto-save, background polling, explicit conflict handling.',
        notesFr: 'Auth PKCE, auto-save debouncé, polling en arrière-plan, gestion explicite des conflits.',
      },
      {
        layer: 'Spell check',
        primary: 'Hunspell FR/EN, offline',
        notesEn: 'Runs in a background worker with automatic language detection — nothing leaves the machine.',
        notesFr: 'Tourne dans un worker en arrière-plan avec détection automatique de la langue — rien ne quitte la machine.',
      },
    ],
    decisions: [
      {
        n: '01',
        titleEn: 'Your Drive is the backend',
        titleFr: 'Votre Drive est le backend',
        bodyEn:
          'Running zero servers is a feature: nothing to breach, nothing to subscribe to, no lock-in. The drive.file scope keeps the blast radius at exactly the files Stela created.',
        bodyFr:
          "Ne faire tourner aucun serveur est une fonctionnalité : rien à compromettre, rien à payer, aucun lock-in. Le scope drive.file limite la surface exactement aux fichiers créés par Stela.",
      },
      {
        n: '02',
        titleEn: 'Plain .md or nothing',
        titleFr: 'Du .md brut ou rien',
        bodyEn:
          'The editor is WYSIWYG but the file on disk stays clean Markdown that any other tool can open. If Stela disappears tomorrow, the notes lose nothing.',
        bodyFr:
          "L'éditeur est WYSIWYG mais le fichier sur le disque reste du Markdown propre que n'importe quel autre outil peut ouvrir. Si Stela disparaît demain, les notes ne perdent rien.",
      },
    ],
    timelineEn: 'May — June 2026',
    timelineFr: 'Mai — juin 2026',
    roleEn: 'Design & engineering, solo',
    roleFr: 'Design & ingénierie, solo',
    teamEn: 'Solo',
    teamFr: 'Solo',
    contextLabelEn: 'Personal product',
    contextLabelFr: 'Produit personnel',
  },
  {
    slug: 'ai-journey',
    nameEn: 'AI Journey',
    nameFr: 'AI Journey',
    taglineEn:
      'The public log of a transition from systems programming to AI — math, ML fundamentals and end-to-end projects, with one rule: never train a model I can’t explain.',
    taglineFr:
      "Le journal public d'une transition du systems programming vers l'IA — maths, fondamentaux ML et projets de bout en bout, avec une règle : ne jamais entraîner un modèle que je ne sais pas expliquer.",
    status: ProjectStatus.LEARNING,
    stack: ['Python', 'NumPy', 'pandas', 'scikit-learn', 'Jupyter'],
    liveUrl: null,
    repoUrl: 'https://github.com/JAuxance/ai-journey',
    heroImage: '/projects/ai-journey.webp',
    featured: false,
    order: 0,
    published: true,
    contextEn: [
      'A structured roadmap from foundations to research: advanced Python and algorithms, the math for AI (linear algebra, calculus, probability, optimization), classical machine learning, then deep learning with PyTorch — each stage with notes, exercises and implementations, logged day by day.',
      'Current focus: Trail, a portfolio bot. The V1 intent classifier is trained by hand — TF-IDF + logistic regression, F1 macro 0.629 on 5-fold cross-validation — and is being integrated behind a FastAPI endpoint with a confidence threshold and a response policy.',
      'House rules: clean, documented code; every project ships with results and conclusions; fundamentals over hype.',
    ],
    contextFr: [
      "Une feuille de route structurée des fondations vers la recherche : Python avancé et algorithmique, les maths pour l'IA (algèbre linéaire, calcul, probabilités, optimisation), le machine learning classique, puis le deep learning avec PyTorch — chaque étape avec notes, exercices et implémentations, consignée jour après jour.",
      "Focus actuel : Trail, un bot de portfolio. Le classifieur d'intentions V1 est entraîné à la main — TF-IDF + régression logistique, F1 macro 0,629 en validation croisée 5-fold — et s'intègre derrière un endpoint FastAPI avec seuil de confiance et politique de réponse.",
      'Règles maison : du code propre et documenté ; chaque projet livre ses résultats et ses conclusions ; les fondamentaux avant le hype.',
    ],
    timelineEn: '2026 — ongoing',
    timelineFr: '2026 — en cours',
    roleEn: 'Self-directed curriculum',
    roleFr: 'Curriculum auto-dirigé',
    teamEn: 'Solo',
    teamFr: 'Solo',
    contextLabelEn: 'Open log',
    contextLabelFr: 'Journal ouvert',
  },
];
