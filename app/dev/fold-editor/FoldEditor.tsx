"use client";

/**
 * The fold editor for one plane (SPEC 4.4).
 *
 * Three views of the same step, side by side, because a geometry bug shows up as
 * a DISAGREEMENT between them:
 *   1. the live 3D stage, exactly the engine the product ships;
 *   2. `renderStateToSvg`, the deterministic projection the geometry snapshot
 *      tests compare against - the ground truth;
 *   3. the table-space plan, where crease coordinates are literal millimetres.
 *
 * `key={planeId}` on this component in page.tsx makes a plane switch a remount,
 * so the engine, the step index and every selection reset together rather than
 * being unwound by hand.
 */
import { useCallback, useMemo, useState } from "react";
import type { FoldEngineHandle, Vec2 } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { computeFoldState, validateSequence } from "@/engine/core/state";
import { renderStateToSvg } from "@/engine/core/svgRender";
import { Stage3D } from "./Stage3D";
import { TablePlan } from "./TablePlan";
import { DiagnosticsPanel, FacetTable, Panel, StepList, ValidationPanel } from "./panels";
import { facetRows, formatVec, issuesByStep, stepDiagnostics } from "./inspect";
import { creaseOverlay, planView, tablePlan } from "./plan";

type Phase = "before" | "after";

const BUTTON =
  "border border-ink-12 bg-raised px-sm py-xs font-mono text-micro font-semibold tracking-[0.1em] text-ink uppercase transition-colors duration-150 ease-move hover:bg-ink-12 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red";
const BUTTON_ON = "border border-ink bg-ink px-sm py-xs font-mono text-micro font-semibold tracking-[0.1em] text-paper uppercase";

export function FoldEditor({ structure }: { structure: PlaneStructure }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("before");
  const [selectedFacetId, setSelectedFacetId] = useState<number | null>(null);
  const [pointer, setPointer] = useState<Vec2 | null>(null);
  const [progress, setProgress] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [handle, setHandle] = useState<FoldEngineHandle | null>(null);

  const lastIndex = Math.max(structure.steps.length - 1, 0);
  const step = structure.steps[stepIndex];

  const issues = useMemo(() => validateSequence(structure), [structure]);
  const byStep = useMemo(() => issuesByStep(issues), [issues]);
  const issueCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const [index, list] of byStep) counts.set(index, list.length);
    return counts;
  }, [byStep]);

  const diagnostics = useMemo(
    () => stepDiagnostics(structure, stepIndex),
    [structure, stepIndex],
  );

  /**
   * "before" is the state the crease was authored against; "after" is what the
   * step produced. Both views and the facet table follow this one switch so the
   * three panels always describe the same geometry.
   */
  const inspectedIndex = phase === "before" ? stepIndex - 1 : stepIndex;
  const inspectedState = useMemo(
    () => computeFoldState(structure, inspectedIndex),
    [structure, inspectedIndex],
  );

  const polygons = useMemo(() => tablePlan(inspectedState), [inspectedState]);
  const rows = useMemo(() => facetRows(inspectedState), [inspectedState]);
  const svgTruth = useMemo(() => renderStateToSvg(inspectedState), [inspectedState]);

  const sheetOutline = useMemo(() => {
    const fresh = tablePlan(computeFoldState(structure, -1));
    return fresh[0]?.points ?? [];
  }, [structure]);

  // The view has to know the crease endpoints before the overlay can be clipped
  // to it, so the crease is read twice: once for framing, once for drawing.
  const view = useMemo(() => {
    const action = step?.action;
    const creasePoints: Vec2[] =
      action?.type === "fold"
        ? [action.crease.a, action.crease.b]
        : action?.type === "cut"
          ? [action.line.a, action.line.b]
          : [];
    return planView([...polygons.map((p) => p.points), sheetOutline, creasePoints]);
  }, [polygons, sheetOutline, step]);

  const overlay = useMemo(
    () => (step ? creaseOverlay(step.action, view) : null),
    [step, view],
  );

  const goTo = useCallback(
    (index: number) => {
      setStepIndex(Math.max(0, Math.min(index, lastIndex)));
      setPlaying(true);
      setProgress(0);
    },
    [lastIndex],
  );

  const onProgress = useCallback((t: number) => {
    setProgress(t);
    if (t >= 1) setPlaying(false);
  }, []);

  const scrub = (value: number) => {
    handle?.timeline.progress(value);
    setProgress(value);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (!handle) return;
    if (playing) {
      handle.timeline.pause();
      setPlaying(false);
    } else {
      handle.timeline.play();
      setPlaying(true);
    }
  };

  const highlightCss =
    selectedFacetId === null
      ? ""
      : `#fe-svg-truth svg [data-facet="${selectedFacetId}"]{fill:var(--color-red);fill-opacity:0.45;stroke:var(--color-red);stroke-width:1.4;}`;

  return (
    <div className="grid gap-md xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-md">
        {/* Views */}
        <div className="grid gap-md lg:grid-cols-3">
          <Panel title="3D stage" aside="createFoldEngine" className="overflow-hidden">
            <div className="relative h-[360px] bg-paper">
              <Stage3D
                structure={structure}
                stepIndex={stepIndex}
                onHandle={setHandle}
                onProgress={onProgress}
              />
            </div>
          </Panel>

          <Panel
            title="SVG ground truth"
            aside="renderStateToSvg"
            className="overflow-hidden"
          >
            <div className="h-[360px] bg-paper p-sm">
              {highlightCss ? <style>{highlightCss}</style> : null}
              <div
                id="fe-svg-truth"
                className="size-full [&>svg]:size-full"
                // Engine-generated markup only; there is no user input on this route.
                dangerouslySetInnerHTML={{ __html: svgTruth }}
              />
            </div>
          </Panel>

          <Panel
            title="Table plan + crease"
            aside={pointer ? `${formatVec(pointer)} mm` : "hover to read mm"}
            className="overflow-hidden"
          >
            <div className="h-[360px] bg-paper p-sm">
              <TablePlan
                polygons={polygons}
                view={view}
                overlay={overlay}
                sheetOutline={sheetOutline}
                selectedFacetId={selectedFacetId}
                onSelectFacet={setSelectedFacetId}
                onPointer={setPointer}
                pointer={pointer}
              />
            </div>
          </Panel>
        </div>

        {/* Transport */}
        <Panel
          title="Transport"
          aside={`step ${Math.min(stepIndex + 1, Math.max(structure.steps.length, 1))} / ${structure.steps.length}`}
        >
          <div className="flex flex-wrap items-center gap-sm px-md py-sm">
            <button
              type="button"
              className={BUTTON}
              onClick={() => goTo(stepIndex - 1)}
              disabled={stepIndex <= 0}
            >
              Prev
            </button>
            <button
              type="button"
              className={BUTTON}
              onClick={() => goTo(stepIndex + 1)}
              disabled={stepIndex >= lastIndex}
              data-testid="next-step"
            >
              Next
            </button>
            <button type="button" className={BUTTON} onClick={togglePlay} disabled={!handle}>
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className={BUTTON}
              onClick={() => {
                handle?.replay();
                setPlaying(true);
                setProgress(0);
              }}
              disabled={!handle}
            >
              Replay
            </button>
            <button
              type="button"
              className={BUTTON}
              onClick={() => goTo(lastIndex)}
              disabled={stepIndex >= lastIndex}
              data-testid="last-step"
            >
              Last step
            </button>

            <span className="ms-auto flex items-center gap-xs">
              <span className="font-mono text-micro tracking-[0.1em] text-ink-60 uppercase">
                inspect
              </span>
              {(["before", "after"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={phase === value}
                  className={phase === value ? BUTTON_ON : BUTTON}
                  onClick={() => setPhase(value)}
                >
                  {value}
                </button>
              ))}
            </span>
          </div>

          <div className="grid gap-sm px-md pb-md sm:grid-cols-2">
            <label className="flex items-center gap-sm">
              <span className="font-mono text-micro tracking-[0.1em] text-ink-60 uppercase">
                step
              </span>
              <input
                type="range"
                min={0}
                max={lastIndex}
                step={1}
                value={stepIndex}
                onChange={(e) => goTo(Number(e.target.value))}
                className="min-w-0 flex-1 accent-[var(--color-red)]"
                aria-label="Step index"
              />
              <span className="font-mono text-micro tabular-nums text-ink">
                {String(stepIndex + 1).padStart(2, "0")}
              </span>
            </label>
            <label className="flex items-center gap-sm">
              <span className="font-mono text-micro tracking-[0.1em] text-ink-60 uppercase">
                scrub
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={progress}
                onChange={(e) => scrub(Number(e.target.value))}
                className="min-w-0 flex-1 accent-[var(--color-red)]"
                aria-label="Progress within the step"
              />
              <span className="font-mono text-micro tabular-nums text-ink">
                {progress.toFixed(2)}
              </span>
            </label>
          </div>

          <p className="border-t border-ink-12 px-md py-sm font-mono text-micro text-ink-60">
            Inspecting the state {phase === "before" ? "BEFORE" : "AFTER"} this step
            {overlay
              ? `. Red wash = the ${overlay.movingSide} half, which ${overlay.kind === "cut" ? "is discarded" : "moves"}.`
              : ". This step has no crease (flip, rotate or unfold)."}
          </p>
        </Panel>

        <FacetTable
          rows={rows}
          selectedFacetId={selectedFacetId}
          onSelect={setSelectedFacetId}
          aside={`${rows.length} facets ${phase} step ${stepIndex + 1}`}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-md">
        <ValidationPanel issues={issues} onSelectStep={goTo} />
        <DiagnosticsPanel diagnostics={diagnostics} />
        <StepList
          steps={structure.steps}
          stepIndex={stepIndex}
          issueCounts={issueCounts}
          onSelect={goTo}
        />
      </div>
    </div>
  );
}
