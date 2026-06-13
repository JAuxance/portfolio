import { z } from 'zod';

/**
 * Lenient URL field for admin forms that save on blur: trims, treats '' as
 * null, and prepends https:// when the scheme is missing — so typing
 * "github.com/x" saves instead of 500ing on a strict .url() check.
 */
export const flexibleUrl = z.preprocess((v) => {
  if (typeof v !== 'string') return v ?? null;
  const s = v.trim();
  if (!s) return null;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`;
}, z.string().url().nullable());

/**
 * parse() that throws a readable Error ("field: message") instead of a raw
 * ZodError — admin clients catch it and flip the save indicator to error,
 * and the server log stays legible.
 */
export function parseInput<Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: unknown
): z.infer<Schema> {
  const r = schema.safeParse(input);
  if (!r.success) {
    const msg = r.error.issues
      .map((i) => `${i.path.join('.') || 'input'}: ${i.message}`)
      .join(' · ');
    throw new Error(`Validation failed — ${msg}`);
  }
  return r.data;
}
