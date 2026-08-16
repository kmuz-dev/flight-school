/**
 * The seam's one asynchronous promise: `loadFoldEngine` always hands back a
 * working factory.
 *
 * A renderer chunk fails to arrive for reasons that have nothing to do with the
 * plane being folded, and every caller wires it up as
 * `loadFoldEngine().then(start)` inside an effect - so a rejection there is an
 * unhandled one, a blank stage, and dead transport controls, with no error
 * boundary able to see it. These pin the degrade instead.
 *
 * `vi.doMock` rather than `vi.mock`: the factory has to be re-registered to run
 * a second time, which is what makes "the failure is not memoised" testable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dart } from "@/content/planes/dart";
import { createFakeDom } from "../render/fakeDom";
import { ENGINE_FAULT_PREFIX } from "@/engine/report";
import type { FoldEngineFactory } from "@/engine";

/** How many times the renderer chunk has been asked for. */
let attempts = 0;
/** Whether that request succeeds; flipped mid-test to simulate a recovery. */
let chunkAvailable = false;

const realFactory = vi.fn();

/** Re-arm the mocked chunk. Must follow every `vi.resetModules()`. */
function armChunk(): void {
  vi.doMock("@/engine/render/create", () => {
    attempts += 1;
    if (!chunkAvailable) throw new Error("Failed to fetch dynamically imported module");
    return { createFoldEngine: realFactory };
  });
}

async function freshSeam(): Promise<{ loadFoldEngine: () => Promise<FoldEngineFactory> }> {
  vi.resetModules();
  armChunk();
  return import("@/engine");
}

describe("loadFoldEngine", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    attempts = 0;
    chunkAvailable = false;
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    error.mockRestore();
  });

  it("hands back the renderer when the chunk arrives", async () => {
    chunkAvailable = true;
    const { loadFoldEngine } = await freshSeam();
    expect(await loadFoldEngine()).toBe(realFactory);
  });

  it("degrades to a working SVG stage rather than rejecting when the chunk fails", async () => {
    const { loadFoldEngine } = await freshSeam();

    const create = await loadFoldEngine();
    const { container } = createFakeDom();
    const handle = create(container as unknown as HTMLElement, dart);

    // A real stage over the real core, not a stub: the cadet can still read the
    // fold and still drive the transport.
    expect(container.children[0]?.innerHTML).toContain("<svg");
    expect(handle.renderMode).toBe("svg");
    handle.gotoStep(2);
    expect(container.children[0]?.innerHTML).toContain("<svg");
    expect(handle.timeline.duration).toBeGreaterThan(0);

    handle.dispose();
    expect(container.children.length).toBe(0);
  });

  it("does not memoise the failure, so the next stage gets 3D back", async () => {
    const { loadFoldEngine } = await freshSeam();
    await loadFoldEngine();
    expect(attempts).toBe(1);

    // The seam is unchanged - same closure, same `pending` - only the chunk has
    // come back, exactly as it would for the next stage a cadet opens.
    chunkAvailable = true;
    vi.resetModules();
    armChunk();

    expect(await loadFoldEngine()).toBe(realFactory);
    expect(attempts).toBe(2);
  });

  it("memoises success, so two hangar cards waking at once share one fetch", async () => {
    chunkAvailable = true;
    const { loadFoldEngine } = await freshSeam();

    const [a, b] = await Promise.all([loadFoldEngine(), loadFoldEngine()]);
    expect(a).toBe(realFactory);
    expect(b).toBe(realFactory);
    expect(attempts).toBe(1);
  });

  /*
   * The degrade is correct and it is also invisible, which is how a renderer
   * broken by a bad deploy stays broken: every cadet sees the same static
   * preview a cadet on an old laptop sees, and nothing anywhere says which.
   *
   * A warning rather than an error, because the usual cause is the cadet's
   * connection and not a defect - and because the resilience E2E asserts that
   * an aborted chunk adds no console ERROR beyond the browser's own.
   */
  it("says so when the chunk fails, without calling the cadet's network a defect", async () => {
    const { loadFoldEngine } = await freshSeam();
    await loadFoldEngine();

    expect(warn).toHaveBeenCalledTimes(1);
    // The prefix is the greppable half; the second argument carries whatever
    // the loader actually said, which under `vi.doMock` is vitest's own wrapper
    // rather than the browser's "Failed to fetch dynamically imported module".
    expect(warn.mock.calls[0]?.[0]).toContain(ENGINE_FAULT_PREFIX);
    expect(warn.mock.calls[0]?.[1]).toBeTruthy();
    expect(error).not.toHaveBeenCalled();
  });

  it("stays quiet when the chunk arrives", async () => {
    chunkAvailable = true;
    const { loadFoldEngine } = await freshSeam();
    await loadFoldEngine();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
