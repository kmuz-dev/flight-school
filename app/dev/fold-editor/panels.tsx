"use client";

/**
 * The inspector panels: step rail, validation, per-step diagnostics, facet table.
 *
 * Presentation only - every number shown here is derived in ./inspect.ts, which
 * is where the tests live. Styling is the project's own tokens (DESIGN.md), just
 * plainer than the product screens: this is an instrument panel, not a stage.
 */
import type { FoldStep, ValidationIssue } from "@/engine/core/types";
import {
  describeAction,
  formatVec,
  mm,
  type FacetRow,
  type StepDiagnostics,
} from "./inspect";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red";

export function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-card border border-ink-12 bg-raised ${className}`}>
      <header className="flex items-baseline justify-between gap-sm border-b border-ink-12 px-md py-sm">
        <h2 className="font-display text-micro font-bold tracking-[0.16em] text-ink uppercase">
          {title}
        </h2>
        {aside ? <div className="font-mono text-micro text-ink-60">{aside}</div> : null}
      </header>
      {children}
    </section>
  );
}

/** A label/value pair in the technical-document voice. */
export function Field({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "normal" | "warn";
}) {
  return (
    <div className="flex items-baseline justify-between gap-sm py-2xs">
      <span className="font-mono text-micro tracking-[0.08em] text-ink-60 uppercase">
        {label}
      </span>
      <span
        className={`font-mono text-small tabular-nums ${tone === "warn" ? "font-bold text-error" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function StepList({
  steps,
  stepIndex,
  issueCounts,
  onSelect,
}: {
  steps: readonly FoldStep[];
  stepIndex: number;
  issueCounts: ReadonlyMap<number, number>;
  onSelect: (index: number) => void;
}) {
  return (
    <Panel title="Sequence" aside={`${steps.length} steps`} className="overflow-hidden">
      <ol className="max-h-[520px] overflow-y-auto" data-testid="step-list">
        {steps.map((step, index) => {
          const active = index === stepIndex;
          const issues = issueCounts.get(index) ?? 0;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className={`flex w-full items-baseline gap-sm border-b border-ink-12 px-md py-sm text-left transition-colors duration-150 ease-move ${FOCUS} ${
                  active ? "bg-ink text-paper" : "text-ink hover:bg-ink-12/50"
                }`}
              >
                <span className="font-mono text-micro tabular-nums opacity-70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-small">{step.id}</span>
                  <span
                    className={`block truncate font-mono text-micro ${active ? "opacity-70" : "text-ink-60"}`}
                  >
                    {describeAction(step.action)}
                  </span>
                </span>
                {issues > 0 ? (
                  <span className="bg-error px-xs py-2xs font-mono text-micro font-bold text-paper">
                    {issues}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
        {steps.length === 0 ? (
          <li className="px-md py-sm font-mono text-small text-ink-60">
            This plane has no steps yet.
          </li>
        ) : null}
      </ol>
    </Panel>
  );
}

export function ValidationPanel({
  issues,
  onSelectStep,
}: {
  issues: readonly ValidationIssue[];
  onSelectStep: (index: number) => void;
}) {
  const clean = issues.length === 0;
  return (
    <Panel
      title="Validation"
      aside={clean ? "clean" : `${issues.length} issues`}
      className="overflow-hidden"
    >
      <div data-testid="validation-panel" data-clean={clean ? "true" : "false"}>
        {clean ? (
          <p className="flex items-center gap-sm px-md py-md font-mono text-small text-green">
            <span aria-hidden="true" className="size-2 rounded-full bg-green" />
            validateSequence found no issues.
          </p>
        ) : (
          <ul>
            {issues.map((issue, i) => (
              <li key={`${issue.stepId}-${issue.code}-${i}`}>
                <button
                  type="button"
                  onClick={() => onSelectStep(issue.stepIndex)}
                  className={`w-full border-b border-ink-12 px-md py-sm text-left hover:bg-ink-12/50 ${FOCUS}`}
                >
                  <span className="flex items-baseline gap-sm">
                    <span className="bg-error px-xs py-2xs font-mono text-micro font-bold text-paper uppercase">
                      {issue.code}
                    </span>
                    <span className="font-mono text-micro text-ink-60">
                      step {issue.stepIndex + 1} / {issue.stepId}
                    </span>
                  </span>
                  <span className="mt-2xs block text-small text-ink">{issue.message}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

export function DiagnosticsPanel({ diagnostics }: { diagnostics: StepDiagnostics }) {
  const d = diagnostics;
  const delta = d.delta;
  return (
    <Panel
      title="Step diagnostics"
      aside={d.stepId ?? "fresh sheet"}
      className="overflow-hidden"
    >
      <div className="px-md py-sm" data-testid="diagnostics">
        <Field label="action" value={d.action ? describeAction(d.action) : "-"} />
        <Field label="facets" value={d.facetCount} />
        <Field label="max layer" value={d.maxLayer} />
        <Field
          label="total area"
          value={`${mm(d.totalArea)} mm2`}
          tone={d.areaDrifted ? "warn" : "normal"}
        />
        <Field label="sheet area" value={`${mm(d.sheetArea)} mm2`} />
        <Field
          label="area drift"
          value={d.areaDrifted ? `${mm(d.areaDrift)} mm2 - paper is not conserved` : "none"}
          tone={d.areaDrifted ? "warn" : "normal"}
        />

        <hr className="my-sm border-0 border-t border-ink-12" />

        {/* How this state stands up when it is put down. Identity until the
            first partial fold, so these read 0 for most of a sequence. */}
        <p className="pb-xs font-mono text-micro tracking-[0.08em] text-ink-60 uppercase">
          rest frame
        </p>
        <Field label="roll" value={`${d.rest.rollDeg.toFixed(1)} deg`} />
        <Field label="rise" value={`${mm(d.rest.liftMm)} mm`} />
        <Field
          label="span x length x height"
          value={`${mm(d.rest.span)} x ${mm(d.rest.length)} x ${mm(d.rest.height)} mm`}
        />

        <hr className="my-sm border-0 border-t border-ink-12" />

        <p className="pb-xs font-mono text-micro tracking-[0.08em] text-ink-60 uppercase">
          step delta
        </p>
        {delta ? (
          <>
            <Field label="kind" value={delta.kind} />
            {/* "angle" said one thing and meant two. The arc the animation
                sweeps comes from `side`; the bend a partial fold stores comes
                from `direction`, and they are only equal by accident. */}
            <Field label="sweep (arc)" value={`${delta.angleDeg} deg`} />
            <Field label="lift (turn)" value={`${mm(delta.liftMm ?? 0)} mm`} />
            <Field
              label="axis origin"
              value={
                delta.axis
                  ? formatVec([delta.axis.origin[0], delta.axis.origin[1]])
                  : "none"
              }
            />
            <Field
              label="axis dir"
              value={delta.axis ? formatVec([delta.axis.dir[0], delta.axis.dir[1]], 3) : "none"}
            />
            <Field
              label="moving facets"
              value={
                delta.movingFacetIds.length > 0 ? delta.movingFacetIds.join(", ") : "none"
              }
            />
            <Field label="layer changes" value={d.layerChanges.length} />
            {d.layerChanges.length > 0 ? (
              <p className="pt-2xs font-mono text-micro break-words text-ink-60">
                {d.layerChanges.map((c) => `${c.facetId}: ${c.from} -> ${c.to}`).join("  ")}
              </p>
            ) : null}
            {/* The reading that would have caught two thirds of the catalogue
                sweeping paper through the floor. Every other number on this
                panel looks at the endpoints, and the paper went under the table
                strictly between them. */}
            <Field
              label="lowest z in sweep"
              value={
                d.divesUnderTable
                  ? `${mm(d.lowestZ)} mm - dives ${mm(d.endpointZ - d.lowestZ)} mm below its endpoints`
                  : `${mm(d.lowestZ)} mm`
              }
              tone={d.divesUnderTable ? "warn" : "normal"}
            />
          </>
        ) : (
          <p className="font-mono text-small text-ink-60">
            No delta: this is the sheet before any step has run.
          </p>
        )}
      </div>
    </Panel>
  );
}

export function FacetTable({
  rows,
  selectedFacetId,
  onSelect,
  aside,
}: {
  rows: readonly FacetRow[];
  selectedFacetId: number | null;
  onSelect: (id: number | null) => void;
  aside: string;
}) {
  return (
    <Panel title="Facets" aside={aside} className="overflow-hidden">
      <div className="max-h-[420px] overflow-auto">
        <table
          className="w-full border-collapse font-mono text-micro tabular-nums"
          data-testid="facet-table"
        >
          <thead className="sticky top-0 bg-raised">
            <tr className="text-ink-60">
              <th scope="col" className="px-sm py-xs text-left font-medium">
                id
              </th>
              <th scope="col" className="px-sm py-xs text-right font-medium">
                layer
              </th>
              <th scope="col" className="px-sm py-xs text-right font-medium">
                area mm2
              </th>
              <th scope="col" className="px-sm py-xs text-right font-medium">
                centroid (table mm)
              </th>
              <th scope="col" className="px-sm py-xs text-right font-medium">
                parity
              </th>
              <th scope="col" className="px-sm py-xs text-right font-medium">
                verts
              </th>
              <th scope="col" className="px-sm py-xs text-right font-medium">
                bent
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = row.id === selectedFacetId;
              return (
                <tr
                  key={row.id}
                  data-facet-row={row.id}
                  data-selected={selected ? "true" : "false"}
                  className={`border-t border-ink-12 ${selected ? "bg-red/12" : ""}`}
                >
                  <th scope="row" className="p-0 text-left font-normal">
                    <button
                      type="button"
                      onClick={() => onSelect(selected ? null : row.id)}
                      aria-pressed={selected}
                      className={`w-full px-sm py-xs text-left ${selected ? "font-bold text-red" : "text-ink hover:text-red"} ${FOCUS}`}
                    >
                      {row.id}
                    </button>
                  </th>
                  <td className="px-sm py-xs text-right">{row.layer}</td>
                  <td className="px-sm py-xs text-right">{mm(row.area)}</td>
                  <td className="px-sm py-xs text-right">{formatVec(row.centroid)}</td>
                  <td
                    className={`px-sm py-xs text-right ${row.parity < 0 ? "text-sky" : "text-ink-60"}`}
                  >
                    {row.parity > 0 ? "+1" : "-1"}
                  </td>
                  <td className="px-sm py-xs text-right text-ink-60">{row.vertexCount}</td>
                  <td
                    className={`px-sm py-xs text-right ${row.bent ? "font-bold text-warning" : "text-ink-38"}`}
                  >
                    {row.bent ? `yes (${row.bendCount})` : "no"}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-sm py-md text-ink-60">
                  No facets in this state.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
