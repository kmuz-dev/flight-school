"use client";

/**
 * Language switch, in the hangar nav next to the Night Flight placard.
 *
 * A native `<select>`, dressed to match the mono placards around it. A custom
 * listbox would have to re-implement keyboard roving, type-ahead, the focus
 * ring, dismissal, and a scroll container for twelve options - and would hand a
 * phone a floating div instead of the OS picker. The one thing the native
 * control costs is the arrow glyph, which is worth it.
 *
 * Switching navigates rather than re-rendering, because a static export has one
 * prerendered HTML per locale: the Spanish hangar is a different document, not
 * a different state. The choice is stored first so the root redirect sends the
 * cadet back to the language they picked next time.
 */
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { localeHref } from "@/lib/paths";
import { writeStored } from "@/lib/storage";
import { FOCUS_RING } from "./focus";

export type LocalePickerProps = {
  readonly locale: Locale;
  readonly a11yLabel: string;
};

export function LocalePicker({ locale, a11yLabel }: LocalePickerProps) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{a11yLabel}</span>
      <select
        data-testid="locale-picker"
        value={locale}
        onChange={(event) => {
          const next = event.target.value;
          writeStored((prev) => ({ ...prev, locale: next }));
          window.location.assign(localeHref(window.location.pathname, next));
        }}
        className={`appearance-none rounded-input border border-ink-38 bg-transparent py-sm ps-md pe-[26px] font-mono text-micro font-semibold tracking-[0.08em] text-ink uppercase transition-colors duration-150 ease-move hover:bg-ink-12 ${FOCUS_RING}`}
      >
        {LOCALES.map((code) => (
          // Option text is the OS's to render, so it stays unstyled and in the
          // language's own script - which is the point of naming them natively.
          <option key={code} value={code} className="normal-case">
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-[10px] text-micro text-ink-60"
      >
        ▾
      </span>
    </label>
  );
}
