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

/**
 * The same page in another language: swap the locale segment, keep the rest.
 *
 * Rebuilding the route from its parts instead would mean the picker has to know
 * which of the four screens it is sitting on, and it would drop the cadet back
 * at the hangar from step nine of a fold. Every route in this app is
 * `/{locale}/...`, so the segment swap is the whole rule.
 */
export function localeHref(pathname: string, locale: string): string {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const segments = rest.split("/");
  // ["", "en", "plane", ...]: index 1 is the locale on every route, and on "/"
  // it is the empty string, which becomes the locale's hangar.
  segments[1] = locale;
  const swapped = segments.join("/");
  return href(swapped.endsWith("/") ? swapped : `${swapped}/`);
}
