/**
 * Dictionary placeholder interpolation, shared by the catalog, preflight and
 * completion screens.
 *
 * The tutorial module carries an identical pair in `components/tutorial/types`
 * (written before this file existed); they should be consolidated here when the
 * tutorial module is next touched.
 */

/** `{placeholder}` interpolation. Unknown placeholders are left untouched. */
export function format(
  template: string,
  vars: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const value = vars[key];
    return value === undefined ? whole : String(value);
  });
}

/** Counters read as "04", matching the mono placard style of the mockups. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
