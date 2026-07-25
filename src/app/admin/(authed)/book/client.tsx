'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookStatus,
  ChapterStatus,
  Locale,
  type Book,
  type Chapter,
} from '@prisma/client';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  Eye,
  FileText,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react';
import {
  createChapter,
  deleteChapter,
  reorderChapters,
  updateBook,
  updateChapter,
} from '@/actions/book';
import { RichText } from '@/components/book/rich-text';
import { RichTextEditor } from '@/components/book/rich-text-editor';
import { PageShell } from '@/components/admin/page-shell';
import {
  Button,
  Field,
  Input,
  Textarea,
  Toggle,
} from '@/components/admin/ui';
import { useSaveState } from '@/components/admin/save-state-context';
import { countBookWords } from '@/lib/book-html';
import { cn } from '@/lib/cn';

type BookWithChapters = Book & { chapters: Chapter[] };
type EditorMode = 'write' | 'preview';

const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  WRITING: 'En écriture',
  PAUSED: 'En pause',
  COMPLETE: 'Terminé',
};

const CHAPTER_STATUS_LABELS: Record<ChapterStatus, string> = {
  DRAFT: 'Brouillon',
  REVIEW: 'À relire',
  PUBLISHED: 'Publié',
};

export function BookStudioClient({ initialBook }: { initialBook: BookWithChapters }) {
  const router = useRouter();
  const [book, setBook] = useState<Book>(initialBook);
  const [chapters, setChapters] = useState<Chapter[]>(initialBook.chapters);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialBook.chapters[0]?.id ?? null
  );
  const [mode, setMode] = useState<EditorMode>('write');
  const [pending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedDraftRef = useRef<Chapter | null>(null);
  const revisionRef = useRef(0);
  const { setSaving, setSaved, setError } = useSaveState();

  const selected = selectedId
    ? chapters.find((chapter) => chapter.id === selectedId) ?? null
    : null;

  useEffect(() => {
    selectedDraftRef.current = selected;
  }, [selected]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const totalWords = useMemo(
    () => chapters.reduce((sum, chapter) => sum + countBookWords(chapter.content), 0),
    [chapters]
  );
  const progress =
    book.targetWords > 0
      ? Math.min(100, Math.round((totalWords / book.targetWords) * 100))
      : 0;

  async function persistChapter(chapter: Chapter, revision: number) {
    try {
      const response = await updateChapter(chapter.id, {
        slug: chapter.slug,
        title: chapter.title,
        summary: chapter.summary,
        content: chapter.content,
        status: chapter.status,
      });
      setChapters((current) =>
        current.map((item) =>
          item.id === chapter.id && revision === revisionRef.current
            ? response.data
            : item
        )
      );
      if (revision === revisionRef.current) setSaved();
    } catch {
      if (revision === revisionRef.current) setError();
    }
  }

  function scheduleChapterSave(chapter: Chapter) {
    if (timerRef.current) clearTimeout(timerRef.current);
    const revision = ++revisionRef.current;
    setSaving();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void persistChapter(chapter, revision);
    }, 900);
  }

  function flushChapterSave() {
    if (!timerRef.current || !selectedDraftRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    void persistChapter(selectedDraftRef.current, revisionRef.current);
  }

  function patchChapter(patch: Partial<Chapter>) {
    if (!selected) return;
    const next = { ...selected, ...patch };
    selectedDraftRef.current = next;
    setChapters((current) =>
      current.map((chapter) => (chapter.id === next.id ? next : chapter))
    );
    scheduleChapterSave(next);
  }

  function selectChapter(id: string) {
    flushChapterSave();
    setSelectedId(id);
    setMode('write');
  }

  function handleCreateChapter() {
    flushChapterSave();
    startTransition(async () => {
      try {
        setSaving();
        const response = await createChapter(book.id);
        setChapters((current) => [...current, response.data]);
        setSelectedId(response.data.id);
        setMode('write');
        setSaved();
        router.refresh();
      } catch {
        setError();
      }
    });
  }

  async function handleDeleteChapter() {
    if (!selected || !confirm(`Supprimer « ${selected.title} » ?`)) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    try {
      setSaving();
      await deleteChapter(selected.id);
      const remaining = chapters.filter((chapter) => chapter.id !== selected.id);
      setChapters(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setSaved();
      router.refresh();
    } catch {
      setError();
    }
  }

  function moveChapter(index: number, delta: -1 | 1) {
    const destination = index + delta;
    if (destination < 0 || destination >= chapters.length) return;
    const next = [...chapters];
    [next[index], next[destination]] = [next[destination], next[index]];
    setChapters(next);
    startTransition(async () => {
      try {
        setSaving();
        await reorderChapters(
          book.id,
          next.map((chapter) => chapter.id)
        );
        setSaved();
      } catch {
        setError();
      }
    });
  }

  async function saveBook(nextBook: Book = book) {
    try {
      setSaving();
      const response = await updateBook(nextBook.id, {
        slug: nextBook.slug,
        title: nextBook.title,
        subtitle: nextBook.subtitle,
        description: nextBook.description,
        language: nextBook.language,
        status: nextBook.status,
        targetWords: Number(nextBook.targetWords) || 0,
        published: nextBook.published,
      });
      setBook(response.data);
      setSaved();
      router.refresh();
    } catch {
      setError();
    }
  }

  function patchBook<K extends keyof Book>(key: K, value: Book[K]) {
    setBook((current) => ({ ...current, [key]: value }));
  }

  return (
    <PageShell
      breadcrumb={['Écrire', 'Livre']}
      title="Ton manuscrit"
      subtitle="Écris dans une page calme, chapitre après chapitre. Tout est sauvegardé automatiquement."
      wide
      action={
        <Button onClick={handleCreateChapter} disabled={pending}>
          <Plus size={15} />
          Nouveau chapitre
        </Button>
      }
    >
      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
            <span>
              {totalWords.toLocaleString('fr-FR')} mots sur{' '}
              {book.targetWords.toLocaleString('fr-FR')}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-white/65 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
          <BookOpen size={13} />
          {chapters.length} chapitre{chapters.length > 1 ? 's' : ''}
        </span>
      </div>

      <details className="group mb-5 rounded-xl border border-white/[0.07] bg-white/[0.018]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5">
          <span className="flex items-center gap-3 text-[12px] font-medium text-[var(--color-text-primary)]">
            <Settings2 size={14} />
            Informations du livre
          </span>
          <span className="truncate text-[11px] text-[var(--color-text-tertiary)]">
            {book.title} · {BOOK_STATUS_LABELS[book.status]}
          </span>
        </summary>
        <div className="border-t border-white/[0.06] p-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Titre">
              <Input
                value={book.title}
                onChange={(event) => patchBook('title', event.target.value)}
              />
            </Field>
            <Field label="Sous-titre">
              <Input
                value={book.subtitle ?? ''}
                onChange={(event) => patchBook('subtitle', event.target.value)}
              />
            </Field>
            <Field label="Objectif de mots">
              <Input
                type="number"
                min={0}
                value={book.targetWords}
                onChange={(event) =>
                  patchBook('targetWords', Number(event.target.value))
                }
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={4}
                value={book.description ?? ''}
                onChange={(event) => patchBook('description', event.target.value)}
              />
            </Field>
            <div className="grid content-start gap-5 sm:grid-cols-2">
              <Field label="État">
                <select
                  value={book.status}
                  onChange={(event) =>
                    patchBook('status', event.target.value as BookStatus)
                  }
                  className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#111114] px-3 text-[13px] text-[var(--color-text-primary)] outline-none"
                >
                  {Object.entries(BOOK_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Langue">
                <select
                  value={book.language}
                  onChange={(event) =>
                    patchBook('language', event.target.value as Locale)
                  }
                  className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#111114] px-3 text-[13px] text-[var(--color-text-primary)] outline-none"
                >
                  <option value={Locale.FR}>Français</option>
                  <option value={Locale.EN}>English</option>
                </select>
              </Field>
              <Field label="Page publique">
                <div className="flex h-10 items-center gap-3">
                  <Toggle
                    checked={book.published}
                    onChange={(value) => {
                      const next = { ...book, published: value };
                      setBook(next);
                      void saveBook(next);
                    }}
                    label="Rendre la page du livre publique"
                  />
                  <span className="text-[12px] text-[var(--color-text-secondary)]">
                    {book.published ? 'Visible' : 'Privée'}
                  </span>
                </div>
              </Field>
            </div>
          </div>
          <div className="mt-5 flex justify-end border-t border-white/[0.06] pt-5">
            <Button variant="primary" onClick={() => saveBook()}>
              <Check size={15} />
              Enregistrer
            </Button>
          </div>
        </div>
      </details>

      <div className="book-studio-grid grid min-h-[760px] overflow-hidden rounded-[14px] border border-white/[0.08] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.07] bg-[#0d0d0f] lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
              Sommaire
            </span>
            <button
              type="button"
              onClick={handleCreateChapter}
              className="grid h-7 w-7 place-items-center rounded-md text-white/45 hover:bg-white/[0.06] hover:text-white"
              aria-label="Ajouter un chapitre"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="max-h-[280px] overflow-y-auto p-2 lg:max-h-[calc(100vh-190px)]">
            {chapters.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <FileText size={21} className="mx-auto mb-3 text-white/25" />
                <p className="text-[12px] leading-relaxed text-white/35">
                  Crée ton premier chapitre pour commencer.
                </p>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={cn(
                    'group mb-1 flex items-center rounded-lg border transition-colors',
                    selectedId === chapter.id
                      ? 'border-white/[0.10] bg-white/[0.07]'
                      : 'border-transparent hover:bg-white/[0.035]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => selectChapter(chapter.id)}
                    className="min-w-0 flex-1 px-3 py-3 text-left"
                  >
                    <span className="mb-1.5 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">
                      Chapitre {String(index + 1).padStart(2, '0')}
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          chapter.status === ChapterStatus.PUBLISHED
                            ? 'bg-emerald-300/80'
                            : chapter.status === ChapterStatus.REVIEW
                              ? 'bg-amber-200/70'
                              : 'bg-white/20'
                        )}
                      />
                    </span>
                    <span className="block truncate font-[var(--font-book)] text-[15px] font-semibold text-white/90">
                      {chapter.title}
                    </span>
                    <span className="mt-1 block text-[10px] text-white/30">
                      {countBookWords(chapter.content).toLocaleString('fr-FR')} mots
                    </span>
                  </button>
                  <span className="mr-2 hidden flex-col gap-0.5 group-hover:flex">
                    <button
                      type="button"
                      disabled={index === 0 || pending}
                      onClick={() => moveChapter(index, -1)}
                      className="grid h-5 w-5 place-items-center rounded text-white/30 hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
                      aria-label={`Monter ${chapter.title}`}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === chapters.length - 1 || pending}
                      onClick={() => moveChapter(index, 1)}
                      className="grid h-5 w-5 place-items-center rounded text-white/30 hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
                      aria-label={`Descendre ${chapter.title}`}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="book-studio-paper min-w-0 bg-[#fbfaf7] text-[#22211f]">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e3da] px-5 py-3 md:px-8">
                <span className="text-[11px] text-[#8a857d]">
                  {book.title} <span aria-hidden>·</span>{' '}
                  {CHAPTER_STATUS_LABELS[selected.status]}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-full border border-[#ddd8cf] bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setMode('write')}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-[10px] transition-colors',
                        mode === 'write'
                          ? 'bg-[#22211f] text-white'
                          : 'text-[#777169] hover:text-[#22211f]'
                      )}
                    >
                      Écrire
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        flushChapterSave();
                        setMode('preview');
                      }}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-[10px] transition-colors',
                        mode === 'preview'
                          ? 'bg-[#22211f] text-white'
                          : 'text-[#777169] hover:text-[#22211f]'
                      )}
                    >
                      Aperçu
                    </button>
                  </div>
                  <select
                    value={selected.status}
                    onChange={(event) =>
                      patchChapter({ status: event.target.value as ChapterStatus })
                    }
                    className="h-8 rounded-full border border-[#ddd8cf] bg-white px-3 text-[10px] text-[#4f4b45] outline-none"
                    aria-label="État du chapitre"
                  >
                    {Object.entries(CHAPTER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mx-auto max-w-[760px] px-6 py-10 md:px-10 md:py-14">
                <input
                  value={selected.title}
                  onChange={(event) => patchChapter({ title: event.target.value })}
                  onBlur={flushChapterSave}
                  className="book-editor-title w-full bg-transparent text-[#1f1e1b] outline-none placeholder:text-[#aaa49a]"
                  placeholder="Titre du chapitre"
                  aria-label="Titre du chapitre"
                />
                <input
                  value={selected.summary ?? ''}
                  onChange={(event) =>
                    patchChapter({ summary: event.target.value })
                  }
                  onBlur={flushChapterSave}
                  className="book-editor-deck mt-4 w-full bg-transparent text-[#706b63] outline-none placeholder:text-[#aaa49a]"
                  placeholder="Ajoute un sous-titre ou une courte introduction…"
                  aria-label="Résumé du chapitre"
                />

                {mode === 'write' ? (
                  <RichTextEditor
                    key={selected.id}
                    value={selected.content}
                    onChange={(content) => patchChapter({ content })}
                    onBlur={flushChapterSave}
                  />
                ) : selected.content.trim() ? (
                  <RichText content={selected.content} className="mt-10" />
                ) : (
                  <div className="grid min-h-[440px] place-items-center text-center">
                    <div>
                      <Eye size={22} className="mx-auto mb-3 text-[#aaa49a]" />
                      <p className="text-[13px] text-[#8a857d]">
                        L’aperçu apparaîtra dès que tu commenceras à écrire.
                      </p>
                    </div>
                  </div>
                )}

                <details className="mt-10 border-t border-[#e8e4dc] pt-5">
                  <summary className="cursor-pointer text-[11px] text-[#8a857d]">
                    Réglages du chapitre
                  </summary>
                  <div className="mt-4">
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-[#9b958b]">
                      Adresse du chapitre
                    </label>
                    <input
                      value={selected.slug}
                      onChange={(event) => patchChapter({ slug: event.target.value })}
                      onBlur={flushChapterSave}
                      className="mt-2 h-9 w-full rounded-md border border-[#ddd8cf] bg-white px-3 font-mono text-[11px] text-[#5e5952] outline-none"
                    />
                  </div>
                </details>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e7e3da] px-5 py-3.5 md:px-8">
                <span className="text-[10px] text-[#8a857d]">
                  {countBookWords(selected.content).toLocaleString('fr-FR')} mots
                  <span className="mx-2">·</span>
                  sauvegarde automatique
                </span>
                <div className="flex items-center gap-2">
                  {book.published &&
                    selected.status === ChapterStatus.PUBLISHED && (
                      <Link
                        href={`/fr/book/${selected.slug}`}
                        target="_blank"
                        className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[11px] text-[#6f6a62] hover:bg-[#efede7] hover:text-[#22211f]"
                      >
                        <Eye size={13} />
                        Voir en ligne
                      </Link>
                    )}
                  <button
                    type="button"
                    onClick={handleDeleteChapter}
                    className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[11px] text-[#9a514b] hover:bg-[#f4e8e5]"
                  >
                    <Trash2 size={13} />
                    Supprimer
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="grid min-h-[760px] place-items-center px-6 text-center">
              <div className="max-w-[320px]">
                <BookOpen size={29} className="mx-auto mb-4 text-[#aaa49a]" />
                <h2 className="font-[var(--font-book)] text-[24px] font-semibold text-[#22211f]">
                  La première page est blanche.
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#777169]">
                  Crée un chapitre et commence à écrire. Tu choisiras plus tard ce
                  que tu veux publier.
                </p>
                <Button className="mt-5" onClick={handleCreateChapter}>
                  <Plus size={14} />
                  Créer le premier chapitre
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </PageShell>
  );
}
