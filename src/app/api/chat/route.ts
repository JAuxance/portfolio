/**
 * /api/chat — Heather's transport layer.
 *
 * This file is intentionally model-agnostic. It validates the request,
 * pulls the site context from the DB, and pipes whatever
 * `streamHeatherReply` yields back to the browser as Server-Sent Events.
 *
 * To plug in your own model, edit `src/lib/heather.ts` — not this file.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { buildSiteContext, streamHeatherReply } from '@/lib/heather';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  message: z.string().min(1).max(2000),
  locale: z.enum(['en', 'fr']).default('en'),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const context = await buildSiteContext({ locale: body.locale });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamHeatherReply({
          message: body.message,
          locale: body.locale,
          history: body.history ?? [],
          context,
        })) {
          const payload = JSON.stringify({ type: 'delta', text: chunk });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'stream_error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
}
