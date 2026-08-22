export const FLIGHT_TUNING = {
  fixedStep: 1 / 120,
  maxFrameDelta: 0.05,
  runLimitMs: 90_000,
  minSpeed: 16,
  baseCruiseSpeed: 22,
  baseMaxSpeed: 31,
  speedResponse: 1.7,
  maxYawRate: 0.78,
  maxPitchRate: 0.66,
  maxPitch: 0.48,
  maxBank: 0.72,
  bankResponse: 7.2,
  autoLevelPitch: 0.5,
  launchMinPower: 0.42,
  launchMaxPitch: 0.24,
  launchMaxHeading: 0.2,
  gustSpeed: 5.5,
  gustLift: 1.7,
  corridorHalfWidth: 14,
  floorY: -1.5,
  ceilingY: 14,
  finishZ: -1280,
} as const;

export const CAMERA_TUNING = {
  distance: 17,
  height: 5.8,
  lookAhead: 27,
  followResponse: 5.8,
  baseFov: 55,
  speedFov: 60,
  fovResponse: 3.4,
  /** A slight over-the-shoulder chase angle reveals the paper's real depth. */
  shoulderOffset: 1.05,
  /** Keep climbs and dives framed without locking the camera to pitch. */
  pitchHeightCompensation: 2.8,
  /** Sun Loop's restrained camera inheritance makes a bank readable. */
  rollInfluence: 0.16,
} as const;

export const AIRCRAFT_VISUAL_TUNING = {
  /** Broad aircraft reach this span; narrow darts stop at `maxLength`. */
  targetSpan: 7.2,
  /** Prevent the camera entering long, narrow finished geometries. */
  maxLength: 13.5,
  angleOfAttack: 0.035,
  flutterPitch: 0.008,
  flutterRoll: 0.0045,
  slipYaw: 0.035,
  shadowWidth: 0.9,
  shadowLength: 0.84,
  airflowPoints: 22,
  airflowSampleHz: 60,
  airflowOpacity: 0.34,
} as const;

export const FLIGHT_RENDER_TUNING = {
  maxDesktopPixelRatio: 2.5,
  maxMobilePixelRatio: 2.25,
  maxRenderPixels: 7_500_000,
  maxTextureAnisotropy: 12,
  backdropFogNear: 92,
  backdropFogFar: 440,
} as const;

export const PERSON_VISUAL_TUNING = {
  displayScale: 1.3,
  noticeDistance: 78,
  noticeLateralRadius: 11,
  noticeMinimumLead: 5,
  crossfadeResponse: 11,
  dodgeDuration: 2.4,
  dodgeLean: 0.12,
  dodgeTravel: 0.48,
} as const;
