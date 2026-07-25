'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

interface ToolButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-full transition-colors disabled:opacity-25',
        active
          ? 'bg-[#22211f] text-white'
          : 'text-[#777169] hover:bg-[#efede7] hover:text-[#22211f]'
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
}: RichTextEditorProps) {
  const alignmentMenuRef = useRef<HTMLDetailsElement | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      Placeholder.configure({
        placeholder:
          'Commence à écrire… Le texte se sauvegarde automatiquement pendant que tu avances.',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'book-editor-writing book-editor-content',
        spellcheck: 'true',
        'aria-label': 'Contenu du chapitre',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    onBlur,
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '<p></p>';
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-[64vh]" aria-hidden />;
  }

  const currentAlignment = (
    editor.getAttributes('paragraph').textAlign ||
    editor.getAttributes('heading').textAlign ||
    'left'
  ) as 'left' | 'center' | 'right' | 'justify';
  const alignmentOptions = [
    { value: 'left' as const, label: 'Gauche', icon: AlignLeft },
    { value: 'center' as const, label: 'Centré', icon: AlignCenter },
    { value: 'right' as const, label: 'Droite', icon: AlignRight },
    { value: 'justify' as const, label: 'Justifié', icon: AlignJustify },
  ];
  const CurrentAlignmentIcon =
    alignmentOptions.find((option) => option.value === currentAlignment)?.icon ??
    AlignLeft;

  function setLink() {
    const previousUrl = editor?.getAttributes('link').href as string | undefined;
    const url = window.prompt('Adresse du lien', previousUrl ?? 'https://');
    if (url === null || !editor) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run();
  }

  return (
    <div className="mt-9">
      <div
        className="sticky top-[60px] z-10 flex flex-wrap items-center gap-1 border-y border-[#e8e4dc] bg-[#fbfaf7]/95 py-2 backdrop-blur"
        role="toolbar"
        aria-label="Mise en forme du texte"
      >
        <ToolButton
          label="Annuler"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={14} />
        </ToolButton>
        <ToolButton
          label="Rétablir"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={14} />
        </ToolButton>
        <span className="mx-1 h-4 w-px bg-[#ddd8cf]" />
        <ToolButton
          label="Gras"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </ToolButton>
        <ToolButton
          label="Italique"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </ToolButton>
        <ToolButton
          label="Barré"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={14} />
        </ToolButton>
        <details ref={alignmentMenuRef} className="group/alignment relative">
          <summary
            className="flex h-8 cursor-pointer list-none items-center gap-1 rounded-full px-2 text-[#777169] transition-colors hover:bg-[#efede7] hover:text-[#22211f]"
            aria-label="Alignement du texte"
            title="Alignement du texte"
          >
            <CurrentAlignmentIcon size={14} />
            <ChevronDown
              size={11}
              className="transition-transform group-open/alignment:rotate-180"
            />
          </summary>
          <div className="absolute left-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-[#ddd8cf] bg-white p-1.5 shadow-[0_14px_35px_rgba(40,35,28,0.16)]">
            {alignmentOptions.map(({ value: alignment, label, icon: Icon }) => (
              <button
                key={alignment}
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextAlign(alignment).run();
                  alignmentMenuRef.current?.removeAttribute('open');
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#4f4b45] hover:bg-[#f3f0ea]"
              >
                <Icon size={15} />
                <span className="flex-1">{label}</span>
                {currentAlignment === alignment && <Check size={14} />}
              </button>
            ))}
          </div>
        </details>
        <ToolButton
          label="Lien"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          <Link2 size={14} />
        </ToolButton>
        <span className="mx-1 h-4 w-px bg-[#ddd8cf]" />
        <ToolButton
          label="Grand titre"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={15} />
        </ToolButton>
        <ToolButton
          label="Petit titre"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={15} />
        </ToolButton>
        <ToolButton
          label="Citation"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={14} />
        </ToolButton>
        <ToolButton
          label="Liste"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolButton>
        <ToolButton
          label="Liste numérotée"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolButton>
        <ToolButton
          label="Bloc de code"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={14} />
        </ToolButton>
        <ToolButton
          label="Séparateur"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </ToolButton>
        <span className="ml-auto pr-2 text-[10px] text-[#9b958b]">
          mise en forme directe
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
