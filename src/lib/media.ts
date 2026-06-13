/** Where admin uploads live on disk — outside public/ on purpose: the
 * standalone prod server only serves public/ files that existed at build
 * time, so runtime uploads are streamed by app/uploads/[name]/route.ts
 * instead. In Docker prod this directory is a named volume. */
export const UPLOADS_DIR_NAME = 'uploads';

/** True when the URL points at a video file (query strings/hashes ignored). */
export function isVideoUrl(url: string): boolean {
  return /\.(webm|mp4)$/i.test(url.split(/[?#]/)[0]);
}
