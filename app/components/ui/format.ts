/**
 * Dictionary placeholder interpolation. Every screen shares these; the tutorial
 * module re-exports them so its own imports keep reading naturally.
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
