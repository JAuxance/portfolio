/**
 * Heather — Auxance's portfolio AI assistant.
 *
 * This module is the ONE place to wire in your own model. The `/api/chat`
 * route imports `streamHeatherReply` and pipes its yielded chunks to the
 * client over Server-Sent Events. Nothing else needs to change.
 *
 * To plug in a real LLM later:
 *   1. Replace the body of `streamHeatherReply` with your own streaming call.
 *      It must be an async generator that yields plain text chunks.
 *   2. Use `buildSiteContext(locale)` to ground answers in the portfolio's
 *      content (Profile, NowItems, Projects, ResearchTopics, References,
 *      TrajectoryStations). It's already fetched from Prisma for you.
 *   3. Set `HEATHER_ENABLED` to true (env var or hardcode) so the route
 *      stops returning the offline 503.
 *
 * Until then, the stub below "types out" a friendly placeholder so the chat
 * UI stays alive and feels real during development.
 */

import { db } from './db';
import { substackHomeUrl, substackConfigured } from './substack';

export type HeatherLocale = 'en' | 'fr';
export type HeatherMessage = { role: 'user' | 'assistant'; content: string };

export const HEATHER_ENABLED = process.env.HEATHER_ENABLED === 'true';

interface BuildContextOptions {
  locale: HeatherLocale;
}

/** Pulls all public-facing content from the DB and renders it as plain text. */
export async function buildSiteContext({ locale }: BuildContextOptions): Promise<string> {
  const [profile, now, projects, research, refs, stations] = await Promise.all([
    db.profile.findFirst(),
    db.nowItem.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.project.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.researchTopic.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.reference.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.trajectoryStation.findMany({ orderBy: { order: 'asc' } }),
  ]);

  const fr = locale === 'fr';
  const pick = <T,>(en: T, frv: T) => (fr ? frv : en);

  const lines: string[] = [];
  if (profile) {
    lines.push(`# ${profile.name} (${profile.handle})`, `Email: ${profile.emailPublic}`, '');
    lines.push('## Abstract', pick(profile.abstractEn, profile.abstractFr), '');
    lines.push('## Contact blurb', pick(profile.contactBlurbEn, profile.contactBlurbFr));
    // Pillar links — so Heather routes visitors to the same canonical homes
    // the page's information architecture defines.
    lines.push('', '## Links');
    if (profile.github) lines.push(`- GitHub (all code): ${profile.github}`);
    if (substackConfigured) lines.push(`- Journal (Substack, PhD-road log): ${substackHomeUrl}`);
    lines.push(`- Email: ${profile.emailPublic}`);
  }
  if (now.length) {
    lines.push('', '## Right now');
    for (const n of now) {
      lines.push(
        `- [${n.label}] ${pick(n.titleEn, n.titleFr)} — ${pick(n.bodyEn, n.bodyFr)} (stack: ${n.stack})`
      );
    }
  }
  if (projects.length) {
    lines.push('', '## Projects');
    for (const p of projects) {
      lines.push(
        `- ${pick(p.nameEn, p.nameFr)} (${p.status}, /work/${p.slug}) — ${pick(p.taglineEn, p.taglineFr)} · stack: ${p.stack.join(', ')}`
      );
      const ctx = pick(p.contextEn, p.contextFr);
      if (ctx?.length) lines.push(`  context: ${ctx.join(' ')}`);
    }
  }
  if (research.length) {
    lines.push('', '## Research questions');
    for (const r of research) {
      lines.push(`- ${r.number}. ${pick(r.titleEn, r.titleFr)}: ${pick(r.bodyEn, r.bodyFr)}`);
    }
  }
  if (refs.length) {
    lines.push('', '## References');
    for (const r of refs) lines.push(`- ${r.citation}`);
  }
  if (stations.length) {
    lines.push('', '## Trajectory');
    for (const s of stations) {
      lines.push(`- [${s.state}] ${s.year} · ${pick(s.instEn, s.instFr)} — ${pick(s.objEn, s.objFr)}`);
    }
  }
  return lines.join('\n');
}

interface StreamReplyOptions {
  message: string;
  locale: HeatherLocale;
  history: HeatherMessage[];
  context: string;
}

/**
 * STUB. Replace this whole function body when your model is ready.
 *
 * Contract: an async generator that yields text chunks (any size). The route
 * handler wraps each yielded chunk in an SSE `data: {"type":"delta", ...}` event.
 *
 * Example with a hypothetical streaming client:
 *
 *   const stream = await myModel.stream({
 *     system: buildSystemPrompt(opts.locale, opts.context),
 *     messages: [...opts.history, { role: 'user', content: opts.message }],
 *   });
 *   for await (const chunk of stream) yield chunk.text;
 */
export async function* streamHeatherReply(
  opts: StreamReplyOptions
): AsyncGenerator<string, void, unknown> {
  const placeholder =
    opts.locale === 'fr'
      ? `Je suis Heather, mais Auxance ne m'a pas encore connectée à un modèle. En attendant : tu peux explorer les sections **Now**, **Journal** et **Work** plus bas — tout y est. Et pour les questions précises, l'email dans **Contact** marche très bien.`
      : `I'm Heather, but Auxance hasn't wired me up to a model yet. In the meantime: the **Now**, **Journal**, and **Work** sections below have everything. For specific questions, the email in **Contact** is the fastest route.`;

  // Type out the placeholder so the streaming UI feels real.
  const words = placeholder.split(/(\s+)/);
  for (const w of words) {
    yield w;
    await new Promise((r) => setTimeout(r, 24));
  }
}

/** Reference system-prompt builder. Use this from your real implementation. */
export function buildSystemPrompt(locale: HeatherLocale, siteContext: string): string {
  if (locale === 'fr') {
    return `Tu es Heather, l'assistante IA personnelle d'Auxance Jourdan, intégrée à son portfolio.

Ton rôle : répondre aux visiteurs sur le travail, la recherche et la trajectoire d'Auxance, en t'appuyant strictement sur le contenu du site fourni ci-dessous.

Style :
- Concise et directe. Max 4 phrases sauf si on demande des détails.
- Voix calme, troisième personne à propos d'Auxance.
- Si une question dépasse le site, dis-le honnêtement et propose ce que tu sais.
- N'invente jamais. Si ce n'est pas dans le contexte, tu ne l'affirmes pas.

--- CONTENU DU SITE ---
${siteContext}
--- FIN ---`;
  }
  return `You are Heather, Auxance Jourdan's personal AI assistant, embedded in his portfolio.

Your role: answer visitor questions about Auxance's work, research, and trajectory, strictly grounded in the site content below.

Style:
- Concise. Max 4 sentences unless asked for depth.
- Calm voice, third person about Auxance.
- If a question goes beyond the site, say so honestly and offer what you do know.
- Never invent. If it's not in the context, you don't assert it.

--- SITE CONTENT ---
${siteContext}
--- END ---`;
}
