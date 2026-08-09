/**
 * basePath-safe link building. Cloudflare Pages (primary) serves from the
 * domain root, but the GitHub Pages fallback serves from /flight-school, so no
 * component may hard-code a leading-slash href.
 *
 * Trailing slashes are kept on directory routes so the static export resolves
 * the same way under `next dev`, `serve out`, and both hosts.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** `href("/en/")` -> "/flight-school/en/" under the GitHub Pages fallback. */
export function href(path: string): string {
  return `${BASE}${path}`;
}

export function hangarHref(locale: string): string {
  return href(`/${locale}/`);
}

export function preflightHref(locale: string, planeId: string): string {
  return href(`/${locale}/plane/${planeId}/`);
}

export function tutorialHref(locale: string, planeId: string): string {
  return href(`/${locale}/plane/${planeId}/fold/`);
}

export function completionHref(locale: string, planeId: string): string {
  return href(`/${locale}/plane/${planeId}/wings/`);
}
