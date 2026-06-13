/**
 * Substack journal feed.
 *
 * Fetched server-side only (from the [locale] page, a Server Component), so
 * Substack's CORS restrictions never apply — the browser never talks to it.
 * Next caches the response for an hour (`revalidate: 3600`); any failure
 * (network, non-200, unparseable XML) resolves to `[]` so the page renders
 * its empty state instead of breaking.
 */

// TODO(auxance): remplace par ton vrai sous-domaine Substack une fois le journal publié.
const SUBSTACK_URL = 'https://YOUR-SUBSTACK.substack.com';

export const substackHomeUrl = SUBSTACK_URL;
export const substackSubscribeUrl = `${SUBSTACK_URL}/subscribe`;
/**
 * False until the real subdomain replaces the placeholder above. Gates every
 * Substack-bound link in the UI so the site never ships a dead URL.
 */
export const substackConfigured = !SUBSTACK_URL.includes('YOUR-SUBSTACK');

export interface JournalPost {
  title: string;
  link: string;
  /** ISO string — keeps the object serializable across the RSC boundary. */
  publishedAt: string;
  excerpt: string;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);
}

/**
 * Inner text of the first `<tag>` in `xml`, with CDATA unwrapped. Entities are
 * NOT decoded here — callers strip HTML first, then decode, so escaped angle
 * brackets meant as text (`&lt;code&gt;`) survive into excerpts.
 */
function tagContent(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max - 40 ? lastSpace : max)}…`;
}

export async function getJournalPosts(limit = 6): Promise<JournalPost[]> {
  // Never hit the placeholder host: the subdomain is claimable by a third
  // party, and every build/revalidation would otherwise pay a dead fetch.
  if (!substackConfigured) return [];
  try {
    const res = await fetch(`${SUBSTACK_URL}/feed`, {
      next: { revalidate: 3600 },
      headers: { accept: 'application/rss+xml, application/xml, text/xml' },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

    const posts: JournalPost[] = [];
    for (const item of items) {
      const title = decodeEntities(tagContent(item, 'title'));
      const link = decodeEntities(tagContent(item, 'link'));
      const date = new Date(tagContent(item, 'pubDate'));
      if (!title || !link || Number.isNaN(date.getTime())) continue;
      posts.push({
        title,
        link,
        publishedAt: date.toISOString(),
        excerpt: truncate(decodeEntities(stripHtml(tagContent(item, 'description'))), 220),
      });
    }

    return posts
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}
