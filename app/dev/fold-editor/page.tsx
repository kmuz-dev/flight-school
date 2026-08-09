"use client";

/**
 * /dev/fold-editor - the fold-sequence authoring and debugging tool (SPEC 4.4).
 *
 * DEV-ONLY ROUTE. It ships in the static export (SPEC 4.4: "internal, ships
 * hidden") but is never linked from product navigation, is marked noindex by
 * app/dev/layout.tsx, and deliberately lives OUTSIDE the localised `[locale]`
 * tree.
 *
 * i18n EXEMPTION, and it is the only one: every user-facing string in this
 * project routes through app/i18n. This route's labels are literal English
 * because it has exactly one audience - whoever is authoring plane geometry -
 * and translating "det(flatMap)" would make it worse, not better. Do not cite
 * this file as precedent for product copy.
 *
 * Content hot reload comes free: PLANES is a static import, so editing
 * app/content/planes/*.ts re-renders the tool in `next dev`.
 */
import { useMemo, useState } from "react";
import { PLANES } from "@/content";
import { FoldEditor } from "./FoldEditor";

export default function FoldEditorPage() {
  // Iterated generically: planes are added to the registry by other tracks and
  // must appear here without this file changing.
  const planeIds = useMemo(() => Object.keys(PLANES).sort(), []);
  const [planeId, setPlaneId] = useState(() => planeIds[0] ?? "");
  const structure = PLANES[planeId];

  return (
    <main className="min-h-screen bg-paper px-md py-md">
      <div className="chevron-bar mb-md" aria-hidden="true" />

      <header className="mb-md flex flex-wrap items-end justify-between gap-md">
        <div>
          <p className="font-mono text-micro tracking-[0.18em] text-red uppercase">
            Internal tooling - not part of the product
          </p>
          <h1 className="font-display text-h1 font-bold tracking-tight text-ink uppercase">
            Fold editor
          </h1>
          <p className="mt-2xs max-w-[70ch] text-small text-ink-60">
            Live fold-sequence inspector. Coordinates are table-space millimetres,
            origin at the sheet centre, y up. Creases are authored against the
            silhouette as it looks at the start of their step.
          </p>
        </div>

        <label className="flex items-center gap-sm">
          <span className="font-mono text-micro tracking-[0.12em] text-ink-60 uppercase">
            Plane
          </span>
          <select
            value={planeId}
            onChange={(e) => setPlaneId(e.target.value)}
            data-testid="plane-picker"
            className="rounded-input border border-ink-12 bg-raised px-sm py-xs font-mono text-small text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
          >
            {planeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
      </header>

      {structure ? (
        <FoldEditor key={planeId} structure={structure} />
      ) : (
        <p className="font-mono text-small text-ink-60">
          No planes are registered in app/content yet.
        </p>
      )}
    </main>
  );
}
