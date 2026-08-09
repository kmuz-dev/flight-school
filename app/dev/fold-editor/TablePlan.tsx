"use client";

/**
 * The table-space plan: the editor's authoring surface.
 *
 * Every coordinate on this drawing is a literal table-space millimetre, so the
 * crease overlay, the coordinate readout and the content file all speak the same
 * numbers. The moving half-plane is washed red and the stationary half is left
 * clean, because the two authoring bugs that actually happen are "side is
 * backwards" and "the crease misses the silhouette", and both are obvious the
 * moment the moving side is drawn.
 *
 * All geometry comes from ./plan.ts; this file is presentation only.
 */
import { useCallback } from "react";
import type { Vec2 } from "@/engine/core/types";
import {
  gridLines,
  planUnit,
  planViewBox,
  pointerToTable,
  pointsAttr,
  facetRole,
  type CreaseOverlay,
  type PlanPolygon,
  type PlanView,
} from "./plan";

const GRID_MM = 50;

const ROLE_STROKE: Record<string, string> = {
  moving: "var(--color-red)",
  stationary: "var(--color-ink-38)",
  split: "var(--color-warning)",
};

export type TablePlanProps = {
  readonly polygons: readonly PlanPolygon[];
  readonly view: PlanView;
  readonly overlay: CreaseOverlay | null;
  /** The unfolded sheet, drawn as a dotted reference frame. */
  readonly sheetOutline: readonly Vec2[];
  readonly selectedFacetId: number | null;
  readonly onSelectFacet: (id: number | null) => void;
  /** Table-space pointer position, or null when the pointer leaves. */
  readonly onPointer: (position: Vec2 | null) => void;
  readonly pointer: Vec2 | null;
};

export function TablePlan({
  polygons,
  view,
  overlay,
  sheetOutline,
  selectedFacetId,
  onSelectFacet,
  onPointer,
  pointer,
}: TablePlanProps) {
  const u = planUnit(view);
  const grid = gridLines(view, GRID_MM);

  const handleMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      onPointer(
        pointerToTable(
          view,
          { width: rect.width, height: rect.height },
          event.clientX - rect.left,
          event.clientY - rect.top,
        ),
      );
    },
    [onPointer, view],
  );

  return (
    <svg
      viewBox={planViewBox(view)}
      role="img"
      aria-label="Table-space plan with crease overlay"
      data-testid="table-plan"
      className="size-full touch-none"
      onPointerMove={handleMove}
      onPointerLeave={() => onPointer(null)}
    >
      {/* Grid and axes: the eye's coordinate system. */}
      <g stroke="var(--color-ink-12)" strokeWidth={u * 0.15} fill="none">
        {grid.xs.map((x) => (
          <line key={`gx${x}`} x1={x} y1={-view.maxY} x2={x} y2={-view.minY} />
        ))}
        {grid.ys.map((y) => (
          <line key={`gy${y}`} x1={view.minX} y1={-y} x2={view.maxX} y2={-y} />
        ))}
      </g>
      <g stroke="var(--color-ink-38)" strokeWidth={u * 0.2} strokeDasharray={`${u} ${u}`}>
        <line x1={0} y1={-view.maxY} x2={0} y2={-view.minY} />
        <line x1={view.minX} y1={0} x2={view.maxX} y2={0} />
      </g>

      {/* The unfolded sheet, so a folded silhouette always has a frame of reference. */}
      {sheetOutline.length > 2 ? (
        <polygon
          points={pointsAttr(sheetOutline)}
          fill="none"
          stroke="var(--color-ink-38)"
          strokeWidth={u * 0.25}
          strokeDasharray={`${u * 2} ${u * 1.5}`}
        />
      ) : null}

      {/* Facets, bottom layer first. */}
      {polygons.map((poly) => {
        const role = overlay ? facetRole(poly.points, overlay) : "stationary";
        const selected = poly.facetId === selectedFacetId;
        return (
          <polygon
            key={poly.facetId}
            points={pointsAttr(poly.points)}
            fill={poly.faceUp ? "var(--color-raised)" : "#EDE7D7"}
            fillOpacity={0.86}
            stroke={selected ? "var(--color-red)" : (ROLE_STROKE[role] ?? "var(--color-ink-38)")}
            strokeWidth={selected ? u * 0.9 : u * 0.28}
            strokeDasharray={role === "split" && !selected ? `${u} ${u * 0.7}` : undefined}
            strokeLinejoin="round"
            className="cursor-pointer"
            data-facet={poly.facetId}
            data-role={role}
            onClick={() => onSelectFacet(selected ? null : poly.facetId)}
          />
        );
      })}

      {/* The moving half-plane, washed so "which side moves" is never a guess. */}
      {overlay && overlay.movingRegion.length > 2 ? (
        <polygon
          points={pointsAttr(overlay.movingRegion)}
          fill="var(--color-red)"
          fillOpacity={0.12}
          stroke="none"
          pointerEvents="none"
          data-testid="moving-region"
        />
      ) : null}

      {/* The crease itself: solid between the authored endpoints, dashed beyond. */}
      {overlay ? (
        <g pointerEvents="none">
          {overlay.span ? (
            <line
              x1={overlay.span[0][0]}
              y1={-overlay.span[0][1]}
              x2={overlay.span[1][0]}
              y2={-overlay.span[1][1]}
              stroke="var(--color-red)"
              strokeWidth={u * 0.3}
              strokeDasharray={`${u * 1.5} ${u * 1.5}`}
              strokeOpacity={0.55}
            />
          ) : null}
          <line
            x1={overlay.line.a[0]}
            y1={-overlay.line.a[1]}
            x2={overlay.line.b[0]}
            y2={-overlay.line.b[1]}
            stroke="var(--color-red)"
            strokeWidth={u * 0.55}
            data-testid="crease-line"
          />
          {[overlay.line.a, overlay.line.b].map((p, i) => {
            // Endpoints often sit on the paper's edge, so labels are turned
            // inward near a boundary rather than running off the drawing.
            const nearRight = p[0] > (view.minX + view.maxX) / 2;
            const nearTop = p[1] > (view.minY + view.maxY) / 2;
            return (
              <g key={i === 0 ? "crease-a" : "crease-b"}>
                <circle cx={p[0]} cy={-p[1]} r={u * 1.1} fill="var(--color-red)" />
                <text
                  x={p[0] + (nearRight ? -u * 2 : u * 2)}
                  y={-p[1] + (nearTop ? u * 4.2 : -u * 1.8)}
                  textAnchor={nearRight ? "end" : "start"}
                  fontSize={u * 3.4}
                  fontFamily="var(--font-mono), monospace"
                  fill="var(--color-ink)"
                  stroke="var(--color-paper)"
                  strokeWidth={u * 0.9}
                  paintOrder="stroke"
                >
                  {i === 0 ? "a " : "b "}
                  {p[0].toFixed(1)}, {p[1].toFixed(1)}
                </text>
              </g>
            );
          })}
        </g>
      ) : null}

      {/* Pointer crosshair, paired with the numeric readout below the panel. */}
      {pointer ? (
        <g pointerEvents="none" stroke="var(--color-sky)" strokeWidth={u * 0.25}>
          <line x1={pointer[0]} y1={-view.maxY} x2={pointer[0]} y2={-view.minY} />
          <line x1={view.minX} y1={-pointer[1]} x2={view.maxX} y2={-pointer[1]} />
        </g>
      ) : null}
    </svg>
  );
}
