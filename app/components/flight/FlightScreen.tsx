"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { PlaneId, PlaneStructure } from "@/content/types";
import type { FlightEvent, FlightInput, FlightPhase, FlightSnapshot, GuidedLaunch } from "@/engine/flight";
import { FLIGHT_TUNING, flightPadInput, launchFromCharge, launchFromDrag, tiltInput } from "@/engine/flight";
import { loadHallwayFlightGame, type HallwayFlightGameFactory, type HallwayFlightGameHandle } from "@/engine/flight/client";
import { recordFlightResult, useFlightRecord, usePlaneProgress, useProgressHydrated } from "@/lib/progress";
import { FOCUS_RING } from "@/components/ui/focus";
import { format } from "@/components/ui/format";
import { usePrefersReducedMotion } from "@/components/ui/reducedMotion";
import type { FlightUiStrings } from "./types";

export type FlightScreenProps = {
  readonly ui: FlightUiStrings;
  readonly structure: PlaneStructure;
  readonly planeName: string;
  readonly hangarHref: string;
  readonly tutorialHref: string;
  readonly createGame?: HallwayFlightGameFactory;
};

const INITIAL_SNAPSHOT: FlightSnapshot = {
  phase: "ready",
  elapsedMs: 0,
  remainingMs: FLIGHT_TUNING.runLimitMs,
  closePasses: 0,
  currentChain: 0,
  bestChain: 0,
  speed: 0,
  era: "1950s",
  progress: 0,
  muted: false,
  reducedMotion: false,
  tiltEnabled: false,
};

type Pad = { pointerId: number; x: number; y: number };
type OrientationPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export function FlightScreen({ ui, structure, planeName, hangarHref, tutorialHref, createGame }: FlightScreenProps) {
  const planeId = structure.id as PlaneId;
  const hydrated = useProgressHydrated();
  const progress = usePlaneProgress(planeId);
  const record = useFlightRecord(planeId);
  const systemReducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<HallwayFlightGameHandle | null>(null);
  const phaseRef = useRef<FlightPhase>("ready");
  const keyboardRef = useRef(new Set<string>());
  const padRef = useRef<Pad | null>(null);
  const launchRef = useRef<Pad | null>(null);
  const chargeStartRef = useRef<number | null>(null);
  const tiltRef = useRef({ turn: 0, pitch: 0 });
  const neutralRef = useRef<{ beta: number; gamma: number } | null>(null);
  const initialSettingsRef = useRef({ muted: false, reducedMotion: systemReducedMotion });
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState(false);
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(systemReducedMotion);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltMessage, setTiltMessage] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [launchAim, setLaunchAim] = useState({ heading: 0, pitch: 0.08 });
  const [diagnosticGame, setDiagnosticGame] = useState<HallwayFlightGameHandle | null>(null);

  const earned = progress.completed;

  const acceptSnapshot = useCallback((next: FlightSnapshot) => {
    phaseRef.current = next.phase;
    setSnapshot(next);
  }, []);

  const acceptEvent = useCallback((event: FlightEvent) => {
    if (event.type === "finish") {
      recordFlightResult(planeId, event.result);
      setLiveMessage(ui.finishedTitle);
    } else if (event.type === "gust") {
      setLiveMessage(ui.gust);
    } else if (event.type === "close-pass") {
      setLiveMessage(format(ui.closePass, { chain: event.chain }));
    } else if (event.type === "collision") {
      setLiveMessage(ui.crashedTitle);
    }
  }, [planeId, ui]);

  useEffect(() => {
    if (!hydrated || !earned || !canvasRef.current) return;
    let cancelled = false;
    let handle: HallwayFlightGameHandle | null = null;
    setLoading(true);
    setFatal(false);
    void (createGame ? Promise.resolve(createGame) : loadHallwayFlightGame())
      .then((factory) => {
        if (cancelled || !canvasRef.current) return;
        handle = factory({
          canvas: canvasRef.current,
          structure,
          muted: initialSettingsRef.current.muted,
          reducedMotion: initialSettingsRef.current.reducedMotion,
          onSnapshot: acceptSnapshot,
          onEvent: acceptEvent,
          onError: () => setLiveMessage(ui.unavailableBody),
        });
        gameRef.current = handle;
        setDiagnosticGame(handle);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setFatal(true);
        }
      });
    return () => {
      cancelled = true;
      handle?.dispose();
      if (gameRef.current === handle) gameRef.current = null;
      setDiagnosticGame(null);
    };
  }, [acceptEvent, acceptSnapshot, createGame, earned, hydrated, structure, ui.unavailableBody]);

  const applyInput = useCallback(() => {
    const keys = keyboardRef.current;
    const keyboardTurn = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    const keyboardPitch = Number(keys.has("ArrowUp") || keys.has("KeyW")) - Number(keys.has("ArrowDown") || keys.has("KeyS"));
    const input: FlightInput = {
      turn: clampInput(keyboardTurn + tiltRef.current.turn),
      pitch: clampInput(keyboardPitch + tiltRef.current.pitch),
    };
    gameRef.current?.setInput(input);
  }, []);

  const launch = useCallback((guided: GuidedLaunch) => {
    gameRef.current?.launch(guided);
    setLiveMessage(ui.title);
  }, [ui.title]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.target instanceof HTMLElement && event.target.closest("button, a, input, select, textarea")) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) event.preventDefault();
      if (phaseRef.current === "ready") {
        if (event.code === "ArrowLeft" || event.code === "KeyA") setLaunchAim((value) => ({ ...value, heading: Math.max(-0.2, value.heading - 0.025) }));
        if (event.code === "ArrowRight" || event.code === "KeyD") setLaunchAim((value) => ({ ...value, heading: Math.min(0.2, value.heading + 0.025) }));
        if (event.code === "ArrowUp" || event.code === "KeyW") setLaunchAim((value) => ({ ...value, pitch: Math.min(0.24, value.pitch + 0.02) }));
        if (event.code === "ArrowDown" || event.code === "KeyS") setLaunchAim((value) => ({ ...value, pitch: Math.max(-0.04, value.pitch - 0.02) }));
        if (event.code === "Space" && !event.repeat && chargeStartRef.current === null) chargeStartRef.current = performance.now();
        return;
      }
      if ((event.code === "Escape" || event.code === "KeyP") && !event.repeat) {
        phaseRef.current === "paused" ? gameRef.current?.resume() : gameRef.current?.pause();
        return;
      }
      if (event.code === "KeyR" && !event.repeat) gameRef.current?.restart();
      if (event.code === "KeyM" && !event.repeat) setMuted((value) => !value);
      keyboardRef.current.add(event.code);
      applyInput();
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      if (phaseRef.current === "ready" && event.code === "Space") {
        const held = chargeStartRef.current === null ? 0 : performance.now() - chargeStartRef.current;
        chargeStartRef.current = null;
        launch(launchFromCharge(held, launchAim));
      }
      keyboardRef.current.delete(event.code);
      applyInput();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [applyInput, launch, launchAim]);

  useEffect(() => gameRef.current?.setMuted(muted), [muted]);
  useEffect(() => gameRef.current?.setReducedMotion(reducedMotion), [reducedMotion]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (phaseRef.current === "paused" || terminal(phaseRef.current)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    if (phaseRef.current === "ready") launchRef.current = point;
    else padRef.current = point;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const pad = padRef.current;
    if (!pad || pad.pointerId !== event.pointerId) return;
    const pointer = flightPadInput(event.clientX - pad.x, pad.y - event.clientY);
    gameRef.current?.setInput({ turn: clampInput(pointer.turn + tiltRef.current.turn), pitch: clampInput(pointer.pitch + tiltRef.current.pitch) });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const start = launchRef.current;
    if (start?.pointerId === event.pointerId) {
      const dx = event.clientX - start.x;
      const dy = start.y - event.clientY;
      launch(launchFromDrag(dx, dy));
      launchRef.current = null;
    }
    if (padRef.current?.pointerId === event.pointerId) {
      padRef.current = null;
      applyInput();
    }
  };

  const onOrientation = useCallback((event: DeviceOrientationEvent): void => {
    const neutral = neutralRef.current;
    if (!neutral) {
      if (Number.isFinite(event.beta) && Number.isFinite(event.gamma)) neutralRef.current = { beta: event.beta!, gamma: event.gamma! };
      return;
    }
    const input = tiltInput(event.beta, event.gamma, neutral);
    if (!input) {
      setTiltEnabled(false);
      gameRef.current?.setTiltEnabled(false);
      setTiltMessage(ui.tiltUnavailable);
      tiltRef.current = { turn: 0, pitch: 0 };
      applyInput();
      return;
    }
    tiltRef.current = input;
    applyInput();
  }, [applyInput, ui.tiltUnavailable]);

  useEffect(() => {
    if (!tiltEnabled) return;
    window.addEventListener("deviceorientation", onOrientation);
    const disableOnBlur = (): void => {
      tiltRef.current = { turn: 0, pitch: 0 };
      setTiltEnabled(false);
      gameRef.current?.setTiltEnabled(false);
      applyInput();
    };
    window.addEventListener("blur", disableOnBlur);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("blur", disableOnBlur);
    };
  }, [applyInput, onOrientation, tiltEnabled]);

  const enableTilt = async (): Promise<void> => {
    try {
      const orientation = window.DeviceOrientationEvent as OrientationPermission | undefined;
      if (!orientation) throw new Error("unsupported");
      if (orientation.requestPermission && (await orientation.requestPermission()) !== "granted") throw new Error("denied");
      neutralRef.current = null;
      setTiltEnabled(true);
      gameRef.current?.setTiltEnabled(true);
      setTiltMessage("");
    } catch {
      setTiltEnabled(false);
      gameRef.current?.setTiltEnabled(false);
      setTiltMessage(ui.tiltUnavailable);
    }
  };

  if (!hydrated) return <main className="flight-gate" aria-busy="true" data-testid="flight-pending" />;

  if (!earned) {
    return (
      <main className="flight-gate" data-testid="flight-locked">
        <section className="flight-card">
          <p className="flight-kicker">{ui.label}</p>
          <h1>{ui.lockedTitle}</h1>
          <p>{format(ui.lockedBody, { name: planeName })}</p>
          <div className="flight-actions">
            <a href={tutorialHref} className={`flight-primary ${FOCUS_RING}`}>
              {progress.resumeStep === null ? ui.startFolding : format(ui.resumeFolding, { step: progress.resumeStep + 1 })}
            </a>
            <a href={hangarHref} className={`flight-secondary ${FOCUS_RING}`}>{ui.returnToHangar}</a>
          </div>
        </section>
      </main>
    );
  }

  const phase = snapshot.phase;
  const overlay = terminal(phase) || phase === "paused";
  const bestTime = record ? formatTime(record.bestTimeMs) : ui.noBest;

  return (
    <main className="flight-shell" aria-label={ui.label} data-phase={phase}>
      <canvas ref={canvasRef} className="flight-canvas" data-testid="flight-canvas" aria-label={`${planeName}: ${ui.title}`} />
      <div className="flight-vignette" aria-hidden="true" />
      <div className="flight-hud">
        <div className="flight-instrument flight-time"><span>{ui.time}</span><strong>{formatTime(snapshot.remainingMs)}</strong></div>
        <div className="flight-era"><span>{ui.era[snapshot.era]}</span><i style={{ width: `${snapshot.progress * 100}%` }} /></div>
        <div className="flight-instrument flight-best"><span>{ui.best}</span><strong>{bestTime}</strong></div>
        <div className="flight-instrument flight-chain"><span>{ui.chain}</span><strong>{snapshot.currentChain}x</strong></div>
        <button type="button" disabled={phase === "ready" || terminal(phase)} className={`flight-icon ${FOCUS_RING}`} onClick={() => gameRef.current?.pause()}>{ui.pause}</button>
      </div>

      {phase === "ready" && !loading ? (
        <button type="button" className={`flight-tilt-start ${FOCUS_RING}`} onClick={() => void enableTilt()}>
          {tiltEnabled ? ui.recalibrateTilt : ui.enableTilt}
        </button>
      ) : null}

      <div className="flight-pad" aria-label={ui.touchHint} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {phase === "ready" ? (
          <div className="flight-launch-card">
            <p className="flight-kicker">{planeName}</p>
            <h1>{ui.title}</h1>
            <p>{ui.launchHint}</p>
            <div className="flight-help"><span>{ui.keyboardHint}</span><span>{ui.touchHint}</span><span>{ui.tiltHint}</span></div>
          </div>
        ) : null}
        {phase === "launching" || phase === "flying" ? (
          <div className="flight-control-cue" aria-hidden="true"><i /></div>
        ) : null}
      </div>

      {loading ? <div className="flight-status" role="status">{ui.loading}</div> : null}
      {fatal ? (
        <div className="flight-modal"><section className="flight-card"><h1>{ui.unavailableTitle}</h1><p>{ui.unavailableBody}</p><a href={hangarHref} className={`flight-primary ${FOCUS_RING}`}>{ui.returnToHangar}</a></section></div>
      ) : null}

      {overlay ? (
        <div className="flight-modal" role="dialog" aria-modal="true" aria-labelledby="flight-result-title">
          <section className="flight-card">
            <p className="flight-kicker">{planeName}</p>
            <h1 id="flight-result-title">{phaseTitle(phase, ui)}</h1>
            <p>{phaseBody(phase, ui)}</p>
            {phase === "finished" ? (
              <dl className="flight-results">
                <div><dt>{ui.bestTime}</dt><dd>{record ? formatTime(record.bestTimeMs) : formatTime(snapshot.elapsedMs)}</dd></div>
                <div><dt>{ui.bestClosePasses}</dt><dd>{Math.max(record?.bestClosePasses ?? 0, snapshot.closePasses)}</dd></div>
                <div><dt>{ui.bestChain}</dt><dd>{Math.max(record?.bestChain ?? 0, snapshot.bestChain)}x</dd></div>
              </dl>
            ) : null}
            <div className="flight-actions">
              {phase === "paused" ? <button type="button" className={`flight-primary ${FOCUS_RING}`} onClick={() => gameRef.current?.resume()}>{ui.resume}</button> : null}
              <button type="button" className={`flight-primary ${FOCUS_RING}`} onClick={() => gameRef.current?.restart()}>{phase === "finished" ? ui.flyAgain : ui.restart}</button>
              <a href={hangarHref} className={`flight-secondary ${FOCUS_RING}`}>{ui.returnToHangar}</a>
            </div>
            <div className="flight-settings">
              <button type="button" onClick={() => setMuted((value) => !value)}>{muted ? ui.unmute : ui.mute}</button>
              <button type="button" onClick={() => setReducedMotion((value) => !value)}>{reducedMotion ? ui.fullMotion : ui.reduceMotion}</button>
              <button type="button" onClick={() => void enableTilt()}>{tiltEnabled ? ui.recalibrateTilt : ui.enableTilt}</button>
            </div>
            {tiltMessage ? <p className="flight-note" role="status">{tiltMessage}</p> : null}
          </section>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{liveMessage}</p>
      {process.env.NODE_ENV === "development" && diagnosticGame ? <FlightDiagnostics game={diagnosticGame} /> : null}
    </main>
  );
}

function FlightDiagnostics({ game }: { game: HallwayFlightGameHandle }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => {
      const d = game.diagnostics();
      const person = d.nearestPerson
        ? `${d.nearestPerson.id} ${d.nearestPerson.distanceAhead.toFixed(0)}m ${d.nearestPerson.state} ${d.nearestPerson.concern.toFixed(2)}`
        : "none";
      setText(`section ${d.section}\nspeed ${game.snapshot().speed}\npitch ${d.pitch.toFixed(2)} roll ${d.roll.toFixed(2)}\ninput ${d.input.turn.toFixed(2)}, ${d.input.pitch.toFixed(2)}\nframe ${d.frameMs.toFixed(1)}ms\nrender ${d.renderWidth}x${d.renderHeight} @${d.pixelRatio.toFixed(2)}\nperson ${person}\nprofile ${d.profile.cruiseSpeed.toFixed(1)} / ${d.profile.stability.toFixed(2)}`);
    }, 180);
    return () => window.clearInterval(timer);
  }, [game]);
  return <pre className="flight-debug">{text}</pre>;
}

function terminal(phase: FlightPhase): boolean {
  return phase === "crashed" || phase === "timed-out" || phase === "finished";
}

function phaseTitle(phase: FlightPhase, ui: FlightUiStrings): string {
  if (phase === "crashed") return ui.crashedTitle;
  if (phase === "timed-out") return ui.timedOutTitle;
  if (phase === "finished") return ui.finishedTitle;
  return ui.pausedTitle;
}

function phaseBody(phase: FlightPhase, ui: FlightUiStrings): string {
  if (phase === "crashed") return ui.crashedBody;
  if (phase === "timed-out") return ui.timedOutBody;
  if (phase === "finished") return ui.finishedBody;
  return ui.keyboardHint;
}

function formatTime(milliseconds: number): string {
  const seconds = Math.max(0, milliseconds) / 1000;
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
}

function clampInput(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
