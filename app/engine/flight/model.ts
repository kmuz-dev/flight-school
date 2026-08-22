import { FLIGHT_TUNING } from "./config";
import { clamp, damp } from "./math";
import type { FlightInput, FlightProfile, FlightState, GuidedLaunch, Vec3 } from "./types";

export function normalizeLaunch(launch: GuidedLaunch): GuidedLaunch {
  return {
    power: clamp(Number.isFinite(launch.power) ? launch.power : 0, FLIGHT_TUNING.launchMinPower, 1),
    heading: clamp(Number.isFinite(launch.heading) ? launch.heading : 0, -FLIGHT_TUNING.launchMaxHeading, FLIGHT_TUNING.launchMaxHeading),
    pitch: clamp(Number.isFinite(launch.pitch) ? launch.pitch : 0.08, -0.04, FLIGHT_TUNING.launchMaxPitch),
  };
}

export function createFlightState(profile: FlightProfile, launch: GuidedLaunch): FlightState {
  const guided = normalizeLaunch(launch);
  return {
    position: { x: 0, y: 4.4, z: 18 },
    yaw: guided.heading,
    pitch: guided.pitch,
    roll: 0,
    yawRate: 0,
    pitchRate: 0,
    speed: FLIGHT_TUNING.minSpeed + (profile.cruiseSpeed - FLIGHT_TUNING.minSpeed) * guided.power,
  };
}

export function getForward(state: FlightState): Vec3 {
  const cosPitch = Math.cos(state.pitch);
  return {
    x: Math.sin(state.yaw) * cosPitch,
    y: Math.sin(state.pitch),
    z: -Math.cos(state.yaw) * cosPitch,
  };
}

export function stepFlight(
  state: FlightState,
  input: FlightInput,
  profile: FlightProfile,
  deltaSeconds: number,
): void {
  const turn = clamp(input.turn, -1, 1);
  const pitchInput = clamp(input.pitch, -1, 1);
  const dive = Math.max(0, -state.pitch / FLIGHT_TUNING.maxPitch);
  const targetSpeed = clamp(
    profile.cruiseSpeed + dive * (profile.maxSpeed - profile.cruiseSpeed),
    FLIGHT_TUNING.minSpeed,
    profile.maxSpeed,
  );

  state.speed = damp(
    state.speed,
    targetSpeed,
    FLIGHT_TUNING.speedResponse * profile.glideRetention,
    deltaSeconds,
  );
  state.yawRate = damp(
    state.yawRate,
    turn * FLIGHT_TUNING.maxYawRate * profile.turnResponse,
    6.8 * profile.turnResponse,
    deltaSeconds,
  );
  state.pitchRate = damp(
    state.pitchRate,
    pitchInput * FLIGHT_TUNING.maxPitchRate,
    6.4 * profile.pitchResponse,
    deltaSeconds,
  );
  state.yaw += state.yawRate * deltaSeconds;
  state.pitch += state.pitchRate * deltaSeconds;
  if (Math.abs(pitchInput) < 0.01) {
    state.pitch = damp(
      state.pitch,
      -0.035 * (2 - profile.glideRetention),
      FLIGHT_TUNING.autoLevelPitch * profile.stability,
      deltaSeconds,
    );
  }
  state.pitch = clamp(state.pitch, -FLIGHT_TUNING.maxPitch, FLIGHT_TUNING.maxPitch);
  state.roll = damp(
    state.roll,
    -turn * FLIGHT_TUNING.maxBank,
    FLIGHT_TUNING.bankResponse * profile.stability,
    deltaSeconds,
  );

  // Keep the 120 Hz hot path allocation-free. `getForward` remains the public
  // query helper, but the simulation advances from scalars in place.
  const cosPitch = Math.cos(state.pitch);
  const distance = state.speed * deltaSeconds;
  state.position.x += Math.sin(state.yaw) * cosPitch * distance;
  state.position.y += Math.sin(state.pitch) * distance;
  state.position.z -= Math.cos(state.yaw) * cosPitch * distance;
}

export function applyGust(state: FlightState, profile: FlightProfile): void {
  state.speed = Math.min(profile.maxSpeed, state.speed + FLIGHT_TUNING.gustSpeed * profile.gustResponse);
  state.position.y = Math.min(FLIGHT_TUNING.ceilingY - 1.5, state.position.y + FLIGHT_TUNING.gustLift * profile.gustResponse);
}
