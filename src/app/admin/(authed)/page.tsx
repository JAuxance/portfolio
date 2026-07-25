import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  FolderKanban,
  Quote,
  Route,
  UserRound,
} from 'lucide-react';
import { db } from '@/lib/db';
import { countBookWords } from '@/lib/book-html';
import { PageShell } from '@/components/admin/page-shell';

function countWords(value: string) {
  return countBookWords(value);
}

export default async function AdminDashboard() {
  const [book, projects, nowItems, research, references, stations] =
    await Promise.all([
      db.book.findFirst({
        include: { chapters: { orderBy: { order: 'asc' } } },
      }),
      db.project.count(),
      db.nowItem.count(),
      db.researchTopic.count(),
      db.reference.count(),
      db.trajectoryStation.count(),
    ]);

  const totalWords =
    book?.chapters.reduce(
      (sum, chapter) => sum + countWords(chapter.content),
      0
    ) ?? 0;
  const targetWords = book?.targetWords ?? 50000;
  const progress =
    targetWords > 0
      ? Math.min(100, Math.round((totalWords / targetWords) * 100))
      : 0;
  const lastChapter = book?.chapters
    .slice()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];

  const mainLinks = [
    {
      href: '/admin/work',
      label: 'Projets',
      detail: `${projects} projet${projects > 1 ? 's' : ''}`,
      icon: FolderKanban,
    },
    {
      href: '/admin/now',
      label: 'En ce moment',
      detail: `${nowItems} élément${nowItems > 1 ? 's' : ''}`,
      icon: Activity,
    },
    {
      href: '/admin/profile',
      label: 'Profil',
      detail: 'Identité et liens',
      icon: UserRound,
    },
  ];

  const contextLinks = [
    {
      href: '/admin/research',
      label: 'Recherche',
      value: research,
      icon: BrainCircuit,
    },
    {
      href: '/admin/trajectory',
      label: 'Parcours',
      value: stations,
      icon: Route,
    },
    {
      href: '/admin/references',
      label: 'Références',
      value: references,
      icon: Quote,
    },
  ];

  return (
    <PageShell
      breadcrumb={['Accueil']}
      title="Bonjour Auxance."
      subtitle="Tout ce dont tu as besoin pour écrire et maintenir ton portfolio, sans bruit."
    >
      <Link
        href="/admin/book"
        className="group relative mb-7 block overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] p-6 transition-colors hover:border-white/[0.15] hover:bg-white/[0.05] md:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-violet-300/[0.08] blur-[80px]"
        />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
              <BookOpen size={12} />
              Reprendre l’écriture
            </span>
            <h2
              className="max-w-[640px] text-[28px] font-medium leading-[1.08] text-white md:text-[38px]"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
              }}
            >
              {book?.title ?? 'Ton livre commence ici.'}
            </h2>
            <p className="mt-3 text-[13px] text-white/40">
              {lastChapter
                ? `Dernier chapitre modifié : ${lastChapter.title}`
                : 'Crée le premier chapitre et commence à écrire.'}
            </p>
          </div>
          <div className="min-w-[220px]">
            <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
              <span>{totalWords.toLocaleString('fr-FR')} mots</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-white/75 transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="mt-4 inline-flex items-center gap-2 text-[12px] text-white/60 transition-transform group-hover:translate-x-1">
              Ouvrir le studio
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>

      <div className="grid gap-3 md:grid-cols-3">
        {mainLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.035]"
            >
              <div className="mb-8 flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-white/55">
                  <Icon size={17} />
                </span>
                <ArrowRight
                  size={14}
                  className="text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-white/60"
                />
              </div>
              <h3 className="text-[15px] font-medium text-white/85">{item.label}</h3>
              <p className="mt-1 text-[11px] text-white/30">{item.detail}</p>
            </Link>
          );
        })}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="text-[14px] font-medium text-white/70">
              Contexte de Heather
            </h2>
            <p className="mt-1 text-[11px] text-white/30">
              Ces contenus nourrissent l’assistante, ils ne sont pas affichés sur
              le site.
            </p>
          </div>
        </div>
        <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.06] bg-white/[0.012]">
          {contextLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 text-[12px] text-white/45 hover:bg-white/[0.025] hover:text-white"
              >
                <Icon size={14} />
                <span className="flex-1">{item.label}</span>
                <span className="font-mono text-[9px] text-white/25">
                  {item.value}
                </span>
                <ArrowRight size={12} />
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
