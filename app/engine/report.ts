/**
 * How the engine says something went wrong on its way to a stage.
 *
 * The engine degrades rather than throws - a machine with no WebGL, or one
 * whose renderer chunk never arrived, still gets the flat SVG stage and still
 * folds every plane. That is the right behaviour and it is also a way to go
 * blind: three separate faults all look identical from the outside, as "the
 * static preview again", and a renderer that has been broken since a bad
 * deploy is indistinguishable from a cadet on an old laptop.
 *
 * So the degrade stays silent where it is expected and speaks where it is not.
 * The severity split is the whole content of this module, which is why it is
 * one module rather than a `console` call at each site:
 *
 *   - No WebGL at all is a fact about the machine, not a fault. It is reported
 *     nowhere; `FoldEngineHandle.renderMode` already states it truthfully, and
 *     the UI labels the static preview from that.
 *   - A renderer chunk that will not download is a network condition. Worth
 *     seeing, not ours to fix, and not an error the cadet caused - a warning.
 *   - A stage that throws while constructing, on a machine that just told us it
 *     has WebGL, is our defect. An error.
 *
 * React-free and dependency-free, so both the seam and the renderer factory can
 * import it without either pulling the other's graph in.
 */

/** Stable, greppable, and what the E2E console assertions match on. */
export const ENGINE_FAULT_PREFIX = "[fold-engine]";

function describe(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  return typeof cause === "string" ? cause : String(cause);
}

/**
 * The renderer chunk could not be fetched, so the flat SVG stage is standing in.
 *
 * A warning rather than an error: the usual causes are a dropped connection or
 * a document left open across a redeploy that has since purged the chunk it
 * names, and the cadet keeps a working tutorial either way.
 */
export function reportRendererUnavailable(cause: unknown): void {
  console.warn(`${ENGINE_FAULT_PREFIX} renderer chunk unavailable, using the static stage:`, describe(cause));
}

/**
 * The 3D stage threw while constructing, on a machine that reported WebGL.
 *
 * Nothing about the cadet's machine explains this - the capability check has
 * already passed - so it is a defect in the renderer and it is reported as one.
 */
export function reportRendererFault(cause: unknown): void {
  console.error(`${ENGINE_FAULT_PREFIX} 3D stage failed to start, using the static stage:`, describe(cause));
}
