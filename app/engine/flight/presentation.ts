import { AIRCRAFT_VISUAL_TUNING, CAMERA_TUNING, FLIGHT_TUNING } from "./config";
import { clamp } from "./math";
import type { FlightProfile } from "./types";

export type AircraftPresentation = {
  readonly scale: number;
  readonly span: number;
  readonly length: number;
  readonly height: number;
  readonly wingtipX: number;
  readonly wingtipZ: number;
};

export type AircraftSecondaryPose = {
  readonly pitch: number;
  readonly yaw: number;
  readonly roll: number;
};

/**
 * Fit the real folded planform into the chase view without changing its shape.
 *
 * Scaling by span alone made the narrow Dart 36 world units long, placing a
 * camera 17 units behind its centre inside the aircraft. The smaller of the
 * span and length fits preserves every plane's proportions while bounding both
 * dimensions inside the same arcade-readable envelope.
 */
export function deriveAircraftPresentation(
  profile: Pick<FlightProfile, "spanMm" | "lengthMm" | "heightMm">,
): AircraftPresentation {
  const spanMm = Math.max(1, Number.isFinite(profile.spanMm) ? profile.spanMm : 1);
  const lengthMm = Math.max(1, Number.isFinite(profile.lengthMm) ? profile.lengthMm : 1);
  const heightMm = Math.max(0, Number.isFinite(profile.heightMm) ? profile.heightMm : 0);
  const scale = Math.min(
    AIRCRAFT_VISUAL_TUNING.targetSpan / spanMm,
    AIRCRAFT_VISUAL_TUNING.maxLength / lengthMm,
  );
  const span = spanMm * scale;
  const length = lengthMm * scale;
  return {
    scale,
    span,
    length,
    height: heightMm * scale,
    wingtipX: span * 0.46,
    // Most paper-plane wings reach maximum span just aft of the centre.
    wingtipZ: length * 0.08,
  };
}

/** Small paper compliance layered over the deterministic flight attitude. */
export function aircraftSecondaryPose(
  speed: number,
  maxSpeed: number,
  bank: number,
  timeSeconds: number,
  reducedMotion: boolean,
): AircraftSecondaryPose {
  if (reducedMotion) {
    return { pitch: AIRCRAFT_VISUAL_TUNING.angleOfAttack, yaw: 0, roll: 0 };
  }
  const speedRatio = clamp(
    (speed - FLIGHT_TUNING.minSpeed) / Math.max(1, maxSpeed - FLIGHT_TUNING.minSpeed),
    0,
    1,
  );
  const pressure = 0.35 + speedRatio * 0.65;
  const flutter =
    Math.sin(timeSeconds * 13.7) * AIRCRAFT_VISUAL_TUNING.flutterPitch * pressure
    + Math.sin(timeSeconds * 22.9 + 0.8) * AIRCRAFT_VISUAL_TUNING.flutterPitch * 0.28 * pressure;
  return {
    pitch: AIRCRAFT_VISUAL_TUNING.angleOfAttack + flutter,
    yaw: clamp(-bank * AIRCRAFT_VISUAL_TUNING.slipYaw, -0.028, 0.028),
    roll: Math.sin(timeSeconds * 11.3 + 1.4) * AIRCRAFT_VISUAL_TUNING.flutterRoll * pressure,
  };
}

export function chaseCameraRoll(bank: number, reducedMotion: boolean): number {
  return reducedMotion ? 0 : bank * CAMERA_TUNING.rollInfluence;
}
