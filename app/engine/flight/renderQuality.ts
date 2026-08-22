import { FLIGHT_RENDER_TUNING } from "./config";

export function flightPixelRatio(width: number, height: number, devicePixelRatio: number): number {
  const safeWidth = Math.max(1, Number.isFinite(width) ? width : 1);
  const safeHeight = Math.max(1, Number.isFinite(height) ? height : 1);
  const safeDeviceRatio = Math.max(1, Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1);
  const viewportCap = safeWidth < 760
    ? FLIGHT_RENDER_TUNING.maxMobilePixelRatio
    : FLIGHT_RENDER_TUNING.maxDesktopPixelRatio;
  const pixelBudgetRatio = Math.max(
    1,
    Math.sqrt(FLIGHT_RENDER_TUNING.maxRenderPixels / (safeWidth * safeHeight)),
  );
  return Math.min(safeDeviceRatio, viewportCap, pixelBudgetRatio);
}
