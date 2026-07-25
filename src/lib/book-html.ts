const HTML_PATTERN = /<\/?[a-z][\s\S]*>/i;

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function isBookHtml(value: string) {
  return HTML_PATTERN.test(value);
}

export function bookPlainText(value: string) {
  if (!value) return '';
  const withoutMarkup = isBookHtml(value)
    ? value
        .replace(/<(br|hr)\s*\/?>/gi, '\n')
        .replace(/<\/(p|h[1-6]|blockquote|li|pre)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
    : value
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s+/gm, '')
        .replace(/^\s*(?:[-*]|\d+\.)\s+/gm, '')
        .replace(/[*_`~]/g, '');

  return decodeEntities(withoutMarkup).replace(/\s+/g, ' ').trim();
}

export function countBookWords(value: string) {
  return (
    bookPlainText(value).match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ??
    0
  );
}

