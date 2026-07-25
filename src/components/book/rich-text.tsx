import { isBookHtml } from '@/lib/book-html';

interface RichTextProps {
  content: string;
  className?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function RichText({ content, className }: RichTextProps) {
  const html = isBookHtml(content) ? content : plainTextToHtml(content);

  return (
    <div
      className={className ? `book-prose ${className}` : 'book-prose'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

