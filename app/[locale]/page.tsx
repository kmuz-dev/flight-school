/**
 * The Hangar (catalog) - placeholder until Phase 2's T6 builds the real screen
 * per SCREENS.md §1. Kept minimal so Gate 0 has a building, exporting route.
 */
export default function HangarPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-lg py-2xl">
      <h1 className="font-display text-display font-bold uppercase tracking-tight">
        The Hangar
      </h1>
      <div className="dashed-rule my-md" />
      <p className="font-mono text-small text-ink-60">
        FLIGHT SCHOOL - SCAFFOLD BUILD. AIRCRAFT ARRIVING IN PHASE 2.
      </p>
    </main>
  );
}
