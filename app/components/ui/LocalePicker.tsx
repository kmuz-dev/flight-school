"use client";

/**
 * Language switch, in the hangar nav and again in the preflight header.
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
 *
 * Every colour here is `currentColor` rather than an ink token, because this
 * control now sits on two very different grounds: the cream preflight header
 * and the Hangar's photographed room. Pinned to ink it was invisible on the
 * second - and a `tone` prop would only be a way of saying the same thing
 * twice, since both grounds already set a text colour the picker can inherit.
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
    // A wrapping <label> would fold the arrow glyph into the accessible name
    // ("Choose a language ▾"), so the name goes straight on the control.
    <span className="relative inline-flex items-center">
      <select
        data-testid="locale-picker"
        aria-label={a11yLabel}
        value={locale}
        onChange={(event) => {
          const next = event.target.value;
          writeStored((prev) => ({ ...prev, locale: next }));
          window.location.assign(localeHref(window.location.pathname, next));
        }}
        className={`appearance-none rounded-input border border-current/40 bg-transparent py-sm ps-md pe-[26px] font-mono text-micro font-semibold tracking-[0.08em] text-current uppercase transition-colors duration-150 ease-move hover:bg-current/10 ${FOCUS_RING}`}
      >
        {LOCALES.map((code) => (
          // Option text is the OS's to render, so it stays unstyled and in the
          // language's own script - which is the point of naming them natively.
          // `text-ink` on the option, not `currentColor`: the popup is drawn by
          // the OS on its own light surface, so a colour inherited from the dark
          // Hangar nav would render white on white.
          <option key={code} value={code} className="normal-case text-ink">
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-[10px] text-micro text-current opacity-70"
      >
        ▾
      </span>
    </span>
  );
}
