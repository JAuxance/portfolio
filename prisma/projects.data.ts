import { Prisma, ProjectStatus } from '@prisma/client';

/**
 * The real projects — single source of truth shared by prisma/seed.ts and
 * one-off sync scripts. Content sourced from the actual repos
 * (github.com/JAuxance/*) and managerladger.com. heroImage stays null:
 * the owner uploads media through the admin.
 */
export const projectSeedData: Prisma.ProjectCreateManyInput[] = [
  {
    slug: 'taskflow',
    nameEn: 'TaskFlow',
    nameFr: 'TaskFlow',
    taglineEn:
      'A project and task management app for freelancers and small teams: workspaces, roles, a Kanban board and built-in chat. Work in progress — the project behind my RNCP5 certification file.',
    taglineFr:
      "Une application de gestion de projets et de tâches pour freelances et petites équipes : workspaces, rôles, tableau Kanban et chat intégré. En cours — le projet de mon dossier de certification RNCP5.",
    status: ProjectStatus.BUILDING,
    stack: ['Flask', 'PostgreSQL', 'Docker', 'Caddy', 'Gunicorn', 'Redis', 'Socket.IO'],
    liveUrl: 'https://taskflow.auxance.dev',
    repoUrl: 'https://github.com/JAuxance/TaskFlow',
    heroImage: null,
    featured: true,
    order: 1,
    published: true,
    contextEn: [
      'Work is organised as Workspace → Projects → Tasks. Tasks have a status, a priority, an assignee and a due date, and are shown on a Kanban board. Each workspace has members with a role: owner, admin, member or guest. There is a chat per workspace and direct messages between users.',
      'The backend is Flask, split into blueprints (auth, workspaces, projects, tasks, direct messages). It talks to PostgreSQL 17 with plain SQL through psycopg, and uses Socket.IO for the chat. The frontend is HTML, CSS and vanilla JavaScript with no build step. Passwords are hashed with Argon2, sessions are cookie-based, and Redis backs the rate limiter. In production it runs on Docker Compose behind Caddy, with Gunicorn serving Flask.',
      'Status: not finished. It is the project for my RNCP5 certification file, due 31 December 2026, and a demo is online. The tests use test doubles for the database: they cover selected authentication, permission, validation, messaging and health-check paths, but not the PostgreSQL queries or the browser rendering, which still need a running database and manual checks.',
    ],
    contextFr: [
      "Le travail est organisé en Workspace → Projets → Tâches. Les tâches ont un statut, une priorité, un assigné et une échéance, et s'affichent sur un tableau Kanban. Chaque workspace a des membres avec un rôle : owner, admin, member ou guest. Il y a un chat par workspace et des messages directs entre utilisateurs.",
      "Le backend est en Flask, découpé en blueprints (auth, workspaces, projets, tâches, messages directs). Il parle à PostgreSQL 17 en SQL brut via psycopg, et utilise Socket.IO pour le chat. Le frontend est en HTML, CSS et JavaScript vanilla, sans étape de build. Les mots de passe sont hachés avec Argon2, les sessions passent par cookie, et Redis sert au rate limiting. En production, il tourne sur Docker Compose derrière Caddy, avec Gunicorn pour servir Flask.",
      "Statut : pas terminé. C'est le projet de mon dossier de certification RNCP5, à rendre le 31 décembre 2026, et une démo est en ligne. Les tests utilisent des doubles pour la base de données : ils couvrent une sélection de chemins d'authentification, de permissions, de validation, de messagerie et de health check, mais pas les requêtes PostgreSQL ni le rendu dans le navigateur, qui demandent une base réelle et des vérifications manuelles.",
    ],
    architecture: [
      {
        layer: 'Backend',
        primary: 'Flask · blueprints · psycopg',
        notesEn: 'One blueprint per area (auth, workspaces, projects, tasks, direct messages); plain SQL, no ORM.',
        notesFr: 'Un blueprint par domaine (auth, workspaces, projets, tâches, messages directs) ; SQL brut, pas d’ORM.',
      },
      {
        layer: 'Permissions',
        primary: 'app/permissions.py',
        notesEn: 'A single file holds the checks. A project or task resolves to its workspace, then to the user’s role in workspace_members.',
        notesFr: 'Un seul fichier contient les contrôles. Un projet ou une tâche remonte à son workspace, puis au rôle de l’utilisateur dans workspace_members.',
      },
      {
        layer: 'Database',
        primary: 'PostgreSQL 17',
        notesEn: 'users, workspaces, workspace_members, projects, tasks, sessions, workspace_messages, direct_messages.',
        notesFr: 'users, workspaces, workspace_members, projects, tasks, sessions, workspace_messages, direct_messages.',
      },
      {
        layer: 'Deployment',
        primary: 'Docker Compose · Caddy · Gunicorn · Redis',
        notesEn: 'Caddy serves the static frontend and proxies /api and /socket.io to Flask; Redis stores rate-limit counters.',
        notesFr: 'Caddy sert le frontend statique et proxifie /api et /socket.io vers Flask ; Redis stocke les compteurs de rate limiting.',
      },
    ],
    decisions: [
      {
        n: '01',
        titleEn: 'Permissions in one place',
        titleFr: 'Les permissions au même endroit',
        bodyEn:
          'Routes do not decide who may do what. They call check_workspace_permission with the allowed roles. A user who is not a member of the workspace gets a 404, a member with too low a role gets a 403, so the existence of a workspace does not leak.',
        bodyFr:
          "Les routes ne décident pas qui a le droit de faire quoi. Elles appellent check_workspace_permission avec les rôles autorisés. Un utilisateur qui n'est pas membre du workspace reçoit un 404, un membre au rôle insuffisant reçoit un 403 : l'existence d'un workspace ne fuite pas.",
      },
      {
        n: '02',
        titleEn: 'Membership is a table, not a flag',
        titleFr: 'L’appartenance est une table, pas un drapeau',
        bodyEn:
          'workspace_members links a user to a workspace with a role. Projects and tasks carry no permissions of their own: they inherit them from their workspace, which keeps the rules in one direction.',
        bodyFr:
          "workspace_members relie un utilisateur à un workspace avec un rôle. Les projets et les tâches n'ont pas de permissions propres : elles viennent de leur workspace, ce qui garde les règles dans un seul sens.",
      },
    ],
    timelineEn: '2026 → certification file due 31 December 2026',
    timelineFr: '2026 → dossier de certification à rendre le 31 décembre 2026',
    roleEn: 'Design & engineering, solo',
    roleFr: 'Design & ingénierie, solo',
    teamEn: 'Solo',
    teamFr: 'Solo',
    contextLabelEn: 'RNCP5 certification project',
    contextLabelFr: 'Projet de certification RNCP5',
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
    stack: ['Python', 'PyTorch', 'NumPy', 'pandas', 'scikit-learn', 'Jupyter'],
    liveUrl: null,
    repoUrl: 'https://github.com/JAuxance/ai_journey',
    heroImage: '/projects/ai-journey.webp',
    featured: false,
    order: 0,
    published: true,
    contextEn: [
      'A structured roadmap from foundations to research: advanced Python and algorithms, the math for AI (linear algebra, calculus, probability, optimization), classical machine learning, then deep learning with PyTorch — each stage with notes, exercises and implementations, logged day by day.',
      'Where I am: word embeddings. I implemented Word2Vec in PyTorch (input and output embeddings, negative sampling, BCEWithLogitsLoss, SGD); it lives in the sandbox folder, not the released one, because I am still working out what each piece does. The only measured result so far is Trail, a portfolio bot: a V1 intent classifier trained by hand, TF-IDF + logistic regression, F1 macro 0.629 on 5-fold cross-validation.',
      'Next: a V2 of Trail based on sentence embeddings (transfer learning), compared objectively with V1. No V2 result yet.',
      'House rules: clean, documented code; every project ships with results and conclusions; fundamentals over hype.',
    ],
    contextFr: [
      "Une feuille de route structurée des fondations vers la recherche : Python avancé et algorithmique, les maths pour l'IA (algèbre linéaire, calcul, probabilités, optimisation), le machine learning classique, puis le deep learning avec PyTorch — chaque étape avec notes, exercices et implémentations, consignée jour après jour.",
      "Où j'en suis : les word embeddings. J'ai implémenté Word2Vec en PyTorch (embeddings d'entrée et de sortie, negative sampling, BCEWithLogitsLoss, SGD) ; il est dans le dossier sandbox, pas dans celui des modèles publiés, parce que je finis encore de comprendre le rôle de chaque pièce. Le seul résultat mesuré pour l'instant est Trail, un bot de portfolio : un classifieur d'intentions V1 entraîné à la main, TF-IDF + régression logistique, F1 macro 0,629 en validation croisée 5-fold.",
      'Ensuite : une V2 de Trail basée sur des sentence embeddings (transfer learning), comparée objectivement à la V1. Pas encore de résultat pour la V2.',
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
