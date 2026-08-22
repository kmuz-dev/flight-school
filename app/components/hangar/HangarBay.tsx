"use client";

/**
 * The bay: a photographed hangar with one aircraft floating in it.
 *
 * Six cards became one aircraft, which is a trade rather than a simplification.
 * What the grid did well was let you see the whole fleet and every wings stamp
 * at a glance; what it did badly was show any single aircraft at a size worth
 * looking at. The dot strip below pays back the first - one marker per
 * aircraft, filled when its wings are earned - and this pays for the second.
 *
 * Two things this component is careful about:
 *
 * 1. The renderer is never requested by arriving, hovering, or focusing. Only a
 *    deliberate act asks for it: the named button, or a short drag, which is a
 *    deliberate act in a way that a pointer passing over is not. Three.js is
 *    the heaviest thing the site ships and the hangar is its front door.
 *
 * 2. There is at most one live scene, ever. The grid could hold two; a carousel
 *    that leaves the old aircraft's context alive while flying in the next one
 *    would accumulate them until the browser started dropping contexts, so
 *    changing aircraft disposes the scene and returns to beauty art.
 */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadFoldEngine, type FoldEngineFactory } from "@/engine";
import { usePlaneProgress } from "@/lib/progress";
import type { FoldEngineHandle } from "@/engine/core/types";
import type { PlaneId } from "@/content/types";
import { EngineSvg } from "@/components/ui/EngineSvg";
import { FOCUS_RING } from "@/components/ui/focus";
import { useRenderActivity } from "@/components/ui/renderActivity";
import { format } from "@/components/ui/format";
import hangarInterior from "@/assets/hangar/hangar-interior.jpg";
import { beginSwap, frame, pruneFlights, type Flight } from "./flight";
import type { HangarPlaneView, HangarUiStrings } from "./types";

/** Past this, in CSS pixels, a horizontal drag is a request for another plane. */
const SWIPE_THRESHOLD = 90;
/** Below this the pointer has not really moved; it was a click, not a drag. */
const DRAG_SLOP = 6;

export type HangarBayProps = {
  ui: HangarUiStrings;
  planes: readonly HangarPlaneView[];
  index: number;
  /** Changes for every distinct selection, including a return to the same plane. */
  selectionKey: number | "initial" | "hydrated";
  reducedMotion: boolean;
  /** Reading direction, so a swipe and the arrow keys agree with the page. */
  rtl: boolean;
  onSelect: (index: number, dir: 1 | -1) => void;
  createEngine?: FoldEngineFactory;
};

export function HangarBay({
  ui,
  planes,
  index,
  selectionKey,
  reducedMotion,
  rtl,
  onSelect,
  createEngine,
}: HangarBayProps) {
  const bayRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FoldEngineHandle | null>(null);
  const nodesRef = useRef(new Map<string, HTMLElement>());
  const shadowRef = useRef<HTMLDivElement>(null);
  const flightsRef = useRef<Flight[]>([]);
  const indexRef = useRef(index);
  /*
   * Whether the live stage has taken over the drawing.
   *
   * A ref rather than a class on the shadow, because the frame loop below sets
   * that element's opacity sixty times a second and would simply overwrite one.
   * Written from an effect, so the frame loop reads a committed value.
   */
  const handedOverRef = useRef(false);

  /*
   * The bay is the top of the home page and the marker strip sits below it, so
   * a phone scrolling to the strip can push a live stage most of the way off
   * screen while it keeps drawing.
   */
  const syncRenderActivity = useRenderActivity(bayRef, engineRef);

  /*
   * WHICH aircraft is being inspected, not whether one is.
   *
   * A boolean looked equivalent and was not. Selection and `inspecting` update
   * in the same commit, but the mount effect also depends on the selected
   * structure - so with a boolean the effect saw "still inspecting, new
   * aircraft", tore the old scene down and built a scene for an aircraft nobody
   * had asked to inspect, only to dispose that one too when the reset landed.
   * Two contexts created and destroyed per arrow press, on the front door of
   * the site. Holding the id makes `inspecting` false the instant the aircraft
   * changes, so the effect cleans up and builds nothing.
   */
  const [inspection, setInspection] = useState<{
    readonly planeId: string;
    readonly selectionKey: HangarBayProps["selectionKey"];
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  /*
   * The stage that is actually drawing, tagged with WHOSE it is.
   *
   * A `ready` boolean beside a `renderMode` had to be reset every time the
   * aircraft changed, which meant clearing state from inside the mount effect -
   * a synchronous setState in an effect, and a cascading render for every arrow
   * press. Tagging the result with the aircraft it belongs to makes a stale
   * entry simply stop matching, so there is nothing to reset and the only write
   * happens where the news actually arrives: the engine's own callback.
   */
  const [stage, setStage] = useState<{
    readonly planeId: string;
    readonly selectionKey: HangarBayProps["selectionKey"];
    readonly mode: FoldEngineHandle["renderMode"];
  } | null>(null);
  const [artFailed, setArtFailed] = useState<ReadonlySet<string>>(new Set());

  const selected = planes[index]!;
  const inspecting =
    inspection?.planeId === selected.id && inspection.selectionKey === selectionKey;

  /*
   * The swap is started here rather than in an effect on `index`, because the
   * legs have to be built from the CURRENT positions of anything already in the
   * air. Running it from a render pass would sample the clock at whatever point
   * React chose to commit, which is what turns a held arrow key into a stutter.
   */
  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (next === indexRef.current) return;
      setInspection(null);
      setStage(null);
      const from = planes[indexRef.current]!;
      const to = planes[next]!;
      flightsRef.current = beginSwap({
        fromId: from.id,
        toId: to.id,
        dir,
        now: performance.now(),
        inFlight: flightsRef.current,
        reducedMotion,
      });
      indexRef.current = next;
      onSelect(next, dir);
    },
    [onSelect, planes, reducedMotion],
  );

  // Selection can also arrive from outside the bay - a dot, an arrow key, or
  // the first-unfinished pick once storage hydrates - so the ref follows it.
  useEffect(() => {
    if (index === indexRef.current) return;
    const from = planes[indexRef.current];
    const to = planes[index];
    if (from && to) {
      flightsRef.current = beginSwap({
        fromId: from.id,
        toId: to.id,
        dir: index > indexRef.current ? 1 : -1,
        now: performance.now(),
        inFlight: flightsRef.current,
        reducedMotion,
      });
    }
    indexRef.current = index;
  }, [index, planes, reducedMotion]);

  /**
   * One RAF chain for the life of the component, writing transforms straight to
   * the DOM.
   *
   * Deliberately outside React: sixty commits a second, each re-rendering six
   * images to change a transform, is work React should never be asked to do,
   * and none of it is state anything else reads.
   */
  useEffect(() => {
    const bay = bayRef.current;
    if (!bay) return;
    let raf = 0;

    const tick = (now: number): void => {
      const size = { width: bay.clientWidth, height: bay.clientHeight };
      if (size.width > 0 && size.height > 0) {
        const { placements, shadow } = frame({
          restId: planes[indexRef.current]!.id,
          flights: flightsRef.current,
          now,
          size,
          reducedMotion,
          scaleOf: (id) => planes.find((p) => p.id === id)?.presentation.hangarScale ?? 1,
        });

        for (const node of nodesRef.current.values()) node.style.opacity = "0";
        for (const p of placements) {
          const node = nodesRef.current.get(p.planeId);
          if (!node) continue;
          node.style.opacity = String(p.alpha);
          node.style.transform =
            `translate3d(calc(-50% + ${p.x.toFixed(2)}px), calc(-50% + ${p.y.toFixed(2)}px), 0)` +
            ` scale(${p.scale.toFixed(4)}) rotate(${p.rollDeg.toFixed(2)}deg)`;
          const width = `${p.width.toFixed(1)}px`;
          if (node.style.width !== width) node.style.width = width;
        }

        flightsRef.current = pruneFlights(flightsRef.current, now);

        const shadowNode = shadowRef.current;
        if (shadowNode) {
          shadowNode.style.opacity = handedOverRef.current ? "0" : String(shadow.opacity);
          shadowNode.style.transform = `translate(-50%, -50%) scale(${shadow.scaleX.toFixed(3)}, ${shadow.scaleY.toFixed(3)})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [planes, reducedMotion]);

  /**
   * The one live scene.
   *
   * Changing aircraft makes `inspecting` false in the same commit, so this
   * effect's cleanup disposes the old stage and its body builds nothing - the
   * bay is beauty art again until the cadet asks for the NEW aircraft in 3D.
   */
  useEffect(() => {
    if (!inspecting) return;
    const mount = mountRef.current;
    if (!mount) return;

    let handle: FoldEngineHandle | null = null;
    let stopped = false;
    let stopWebglLost = (): void => {};
    let stopRendererFailed = (): void => {};
    const onResize = (): void => handle?.resize();

    const start = (create: FoldEngineFactory): void => {
      // The bay can change aircraft, or unmount, while the renderer chunk is
      // still in flight. Building the stage then would leave a canvas with
      // nobody to dispose it.
      if (stopped) return;
      handle = create(mount, selected.structure, {
        display: true,
        displayView: selected.presentation.displayView,
        rest: true,
        quality: "preview",
        // The bay's ground is a photograph, not a colour. An opaque stage
        // replaced the room the aircraft stands in with a field of cream.
        transparent: true,
        onReady: () => {
          // Both engines signal during construction. Defer until the factory has
          // returned its public handle, then read the mode from that seam rather
          // than coupling the bay to engine-owned DOM.
          queueMicrotask(() => {
            if (stopped || !handle) return;
            setStage({ planeId: selected.id, selectionKey, mode: handle.renderMode });
          });
        },
      });
      engineRef.current = handle;
      syncRenderActivity();
      const markUnavailable = (): void => {
        if (stopped || !handle) return;
        const failed = handle;
        setStage({ planeId: selected.id, selectionKey, mode: "svg" });
        failed.dispose();
        if (engineRef.current === failed) engineRef.current = null;
      };
      stopWebglLost = handle.on("webglLost", markUnavailable);
      stopRendererFailed = handle.on("rendererFailed", markUnavailable);
      handle.gotoStep(selected.stepCount - 1, { animate: false });
      window.addEventListener("resize", onResize);
    };

    if (createEngine) start(createEngine);
    else void loadFoldEngine().then(start);

    return () => {
      stopped = true;
      window.removeEventListener("resize", onResize);
      stopWebglLost();
      stopRendererFailed();
      handle?.dispose();
      if (engineRef.current === handle) engineRef.current = null;
      handle = null;
    };
  }, [
    inspecting,
    createEngine,
    selected.id,
    selected.structure,
    selected.stepCount,
    selected.presentation.displayView,
    selectionKey,
    attempt,
    syncRenderActivity,
  ]);

  /*
   * Pointer gestures, and the reason there are two of them.
   *
   * A long horizontal flick changes aircraft, because that is the gesture a
   * phone reaches for first in anything that looks like a carousel. A SHORT
   * drag means "let me turn this thing", and is the moment the renderer may
   * mount - it is deliberate in a way that hover and focus are not, which is
   * what the release spec forbids requesting WebGL on.
   *
   * Neither runs while a scene is live: the canvas owns the pointer then, and
   * orbiting the aircraft must not also fly it out of the bay.
   */
  const dragRef = useRef<{ x: number; moved: boolean } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (inspecting) return;
    /*
     * A press that starts on a control is that control's, not the bay's.
     *
     * Not a nicety: the capture below retargets every later pointer event to
     * the bay, and a `click` is only dispatched to the element that saw both
     * halves of the press. Capturing indiscriminately therefore swallowed the
     * click on the Inspect button sitting inside the bay - the button rendered,
     * highlighted, and did nothing, on every pointer device. Nothing in jsdom
     * shows this, because nothing in jsdom implements pointer capture.
     */
    if (event.target instanceof Element && event.target.closest("button, a, select, input")) return;
    dragRef.current = { x: event.clientX, moved: false };
    bayRef.current?.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (drag && Math.abs(event.clientX - drag.x) > DRAG_SLOP) drag.moved = true;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      // Swiping left moves forward the way pages turn - which is the other way
      // round in Arabic, where the fleet reads right to left.
      const forward = rtl ? dx > 0 : dx < 0;
      const dir: 1 | -1 = forward ? 1 : -1;
      goTo((index + dir + planes.length) % planes.length, dir);
    } else if (drag.moved) {
      setStage(null);
      setInspection({ planeId: selected.id, selectionKey });
    }
  };

  /*
   * The beauty art stays until the stage is genuinely drawing, never merely
   * requested: swapping on the click would leave a hole where the aircraft was
   * for as long as a 644 KB chunk takes to arrive.
   */
  const live =
    inspecting &&
    stage?.planeId === selected.id &&
    stage.selectionKey === selectionKey
      ? stage.mode
      : null;
  const showStage = live === "webgl";
  const unavailable = live === "svg";

  // The frame loop reads this rather than a class, because it writes the
  // shadow's opacity itself sixty times a second.
  useEffect(() => {
    handedOverRef.current = showStage;
  }, [showStage]);

  return (
    <div className="hangar-bay-column">
      <div
        ref={bayRef}
        data-testid="hangar-bay"
        data-inspecting={inspecting ? "true" : "false"}
        className="hangar-bay"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <div className="hangar-room" aria-hidden="true">
          <Image
            src={hangarInterior}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hangar-photo"
          />
          <div className="hangar-depth" />
          <div className="hangar-glaze" />
          <div className="hangar-vignette" />
        </div>

        <p className="hangar-hint" aria-hidden="true">
          {ui.bayHint}
        </p>

        {/*
          Two shadows would be one too many. The live stage draws its own
          contact shadow, measured from the actual keel, so the painted one
          steps aside for it rather than doubling up beneath the aircraft.
        */}
        <div ref={shadowRef} className="hangar-shadow" aria-hidden="true" />

        {/*
          Every aircraft is built once and reused, so a swap never waits on an
          image decode. They are hidden from assistive technology as a group:
          the placard beside the bay already names the selected aircraft, and
          the live region announces a change, so six alt texts would only be six
          ways to say the same thing badly.
        */}
        <div className={`hangar-layer ${showStage ? "is-hidden" : ""}`} aria-hidden="true">
          {planes.map((plane) => (
            <div
              key={plane.id}
              ref={(node) => {
                if (node) nodesRef.current.set(plane.id, node);
                else nodesRef.current.delete(plane.id);
              }}
              data-plane={plane.id}
              className="hangar-aircraft"
              style={{ opacity: 0 }}
            >
              {artFailed.has(plane.id) ? (
                <EngineSvg svg={plane.svg} className="h-full w-full" />
              ) : (
                <Image
                  src={plane.presentation.artwork}
                  alt=""
                  width={1280}
                  height={1024}
                  priority={plane.id === selected.id}
                  onError={() =>
                    setArtFailed((prev) => new Set(prev).add(plane.id))
                  }
                  className="h-auto w-full"
                  style={{ objectPosition: plane.presentation.objectPosition }}
                />
              )}
            </div>
          ))}
        </div>

        {/*
          The stage sits over the art rather than replacing it, and the art stays
          visible underneath until the stage is actually drawing. Swapping first
          would put a blank rectangle where the aircraft was for as long as a
          644 KB chunk takes to arrive.
        */}
        {inspecting ? (
          <div
            ref={mountRef}
            data-testid="hangar-stage"
            aria-hidden="true"
            className={`hangar-stage ${showStage ? "is-live" : ""}`}
          />
        ) : null}

        <div className="hangar-bay-status">
          {inspecting && live !== "webgl" ? (
            <p aria-live="polite" className="hangar-badge">
              {unavailable ? ui.unavailable3d : ui.loading3d}
            </p>
          ) : null}
          {showStage ? (
            <button
              type="button"
              data-testid="hangar-reset-view"
              onClick={() => engineRef.current?.resetView()}
              className={`hangar-reset ${FOCUS_RING}`}
            >
              {ui.resetView}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          data-testid="hangar-inspect"
          aria-pressed={inspecting}
          onClick={() => {
            if (unavailable) {
              setStage(null);
              setAttempt((value) => value + 1);
              return;
            }
            setStage(null);
            setInspection(
              inspecting ? null : { planeId: selected.id, selectionKey },
            );
          }}
          className={`hangar-inspect ${FOCUS_RING}`}
        >
          {unavailable
            ? ui.retry3d
            : inspecting
              ? ui.showArtwork
              : format(ui.inspect3d, { name: selected.name })}
        </button>
      </div>

      <div className="hangar-controls">
        <button
          type="button"
          data-testid="hangar-prev"
          aria-label={ui.previousAircraft}
          onClick={() => goTo((index - 1 + planes.length) % planes.length, -1)}
          className={`hangar-arrow hangar-arrow-prev ${FOCUS_RING}`}
        >
          <span aria-hidden="true">{rtl ? "→" : "←"}</span>
        </button>

        <div role="group" aria-label={ui.chooseAircraft} className="hangar-dots">
          {planes.map((plane, i) => (
            <HangarDot
              key={plane.id}
              plane={plane}
              ui={ui}
              current={i === index}
              onSelect={() => goTo(i, i > index ? 1 : -1)}
            />
          ))}
        </div>

        <button
          type="button"
          data-testid="hangar-next"
          aria-label={ui.nextAircraft}
          onClick={() => goTo((index + 1) % planes.length, 1)}
          className={`hangar-arrow hangar-arrow-next ${FOCUS_RING}`}
        >
          <span aria-hidden="true">{rtl ? "←" : "→"}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * One marker per aircraft, carrying two facts at once: where you are in the
 * fleet, and whether that aircraft is already folded. Filled means wings
 * earned. That is what the six-card grid used to tell you at a glance and what
 * one-aircraft-at-a-time would otherwise hide.
 *
 * Progress is read here rather than passed down, so the strip updates the
 * moment a wing is recorded in another tab, like every other progress readout.
 */
function HangarDot({
  plane,
  ui,
  current,
  onSelect,
}: {
  plane: HangarPlaneView;
  ui: HangarUiStrings;
  current: boolean;
  onSelect: () => void;
}) {
  const { completed: earned } = usePlaneProgress(plane.id as PlaneId);
  return (
    <button
      type="button"
      data-plane={plane.id}
      data-earned={earned ? "true" : "false"}
      aria-current={current ? "true" : "false"}
      aria-label={earned ? format(ui.dotEarned, { name: plane.name }) : plane.name}
      onClick={onSelect}
      className={`hangar-dot ${current ? "is-current" : ""} ${earned ? "is-earned" : ""} ${FOCUS_RING}`}
    >
      <span aria-hidden="true" />
    </button>
  );
}
