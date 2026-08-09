/**
 * i18n audit (SPEC.md §5): every UI key and every plane-string key present in
 * English must exist in every locale. Fails CI with a per-locale missing-key
 * list. English is the source of truth; extra keys in other locales are
 * reported as warnings (drift), missing keys are errors.
 */
import { LOCALES } from "../app/i18n/config";

type Dict = Record<string, unknown>;

function flattenKeys(obj: Dict, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === "object" && v !== null ? flattenKeys(v as Dict, key) : [key];
  });
}

async function loadLocale(locale: string): Promise<Dict | null> {
  try {
    const ui = (await import(`../app/i18n/ui/${locale}`)) as { default?: Dict; ui?: Dict };
    const planes = (await import(`../app/i18n/planes/${locale}`)) as {
      default?: Dict;
      planes?: Dict;
    };
    return {
      ui: (ui.default ?? ui.ui ?? {}) as Dict,
      planes: (planes.default ?? planes.planes ?? {}) as Dict,
    };
  } catch {
    return null;
  }
}

const en = await loadLocale("en");
if (!en) {
  console.error("i18n-audit: English dictionaries missing - nothing to audit against.");
  process.exit(1);
}
const enKeys = new Set(flattenKeys(en));

let failed = false;
for (const locale of LOCALES) {
  if (locale === "en") continue;
  const dict = await loadLocale(locale);
  if (!dict) {
    console.error(`i18n-audit: [${locale}] dictionaries missing entirely.`);
    failed = true;
    continue;
  }
  const keys = new Set(flattenKeys(dict));
  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  if (missing.length > 0) {
    console.error(`i18n-audit: [${locale}] MISSING ${missing.length} keys:`);
    for (const k of missing.slice(0, 40)) console.error(`  - ${k}`);
    if (missing.length > 40) console.error(`  ...and ${missing.length - 40} more`);
    failed = true;
  }
  if (extra.length > 0) {
    console.warn(`i18n-audit: [${locale}] ${extra.length} extra keys not in en (drift warning).`);
  }
}

if (failed) process.exit(1);
console.log(`i18n-audit: OK - ${enKeys.size} keys consistent across ${LOCALES.length} locales.`);
