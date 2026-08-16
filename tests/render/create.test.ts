/**
 * The renderer factory's two fallbacks, which are not the same event.
 *
 * `createFoldEngine` degrades to the flat SVG stage twice over: once because
 * the machine has no WebGL, and once because the 3D stage threw anyway. The
 * cadet cannot tell those apart and should not have to - both leave a foldable
 * tutorial - but we must, because only the second one is our defect. These pin
 * the severity split described in `app/engine/report.ts`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDom, type FakeDocument } from "./fakeDom";
import { makeStructure } from "@/engine/render/__contracts__/coreStub";
import { ENGINE_FAULT_PREFIX } from "@/engine/report";

/** A `FoldEngine` that cannot be constructed, standing in for a broken stage. */
const constructorFault = new Error("WebGLRenderer: could not create context");

vi.mock("@/engine/render/renderer", () => ({
  FoldEngine: class {
    constructor() {
      throw constructorFault;
    }
  },
}));

/**
 * A document whose canvas answers the WebGL probe, so `isWebGLAvailable` says
 * yes and the factory reaches its `try` at all. `createFakeDom`'s canvas
 * deliberately reports no context, which is the other half of this pair.
 */
function withWebGL(doc: FakeDocument): FakeDocument {
  const createElement = doc.createElement;
  return {
    ...doc,
    createElement: (tag: string) => {
      const node = createElement(tag);
      return tag === "canvas" ? { ...node, getContext: () => ({ getExtension: () => null }) } : node;
    },
  } as FakeDocument;
}

describe("createFoldEngine", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    error.mockRestore();
  });

  it("reports a stage that throws on a machine that said it has WebGL", async () => {
    const { createFoldEngine } = await import("@/engine/render/create");
    const { container, doc } = createFakeDom();
    const withGl = { ...container, ownerDocument: withWebGL(doc) };

    const handle = createFoldEngine(withGl as unknown as HTMLElement, makeStructure(4));

    // Still foldable: the cadet never sees the fault, only the static stage.
    expect(handle.renderMode).toBe("svg");
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.join(" ")).toContain(ENGINE_FAULT_PREFIX);
    expect(error.mock.calls[0]?.join(" ")).toContain(constructorFault.message);
    handle.dispose();
  });

  it("says nothing when the machine simply has no WebGL", async () => {
    const { createFoldEngine } = await import("@/engine/render/create");
    const { container } = createFakeDom();

    const handle = createFoldEngine(container as unknown as HTMLElement, makeStructure(4));

    // A fact about the machine, not a fault. `renderMode` already states it.
    expect(handle.renderMode).toBe("svg");
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    handle.dispose();
  });

  it("says nothing when the caller asked for the fallback outright", async () => {
    const { createFoldEngine } = await import("@/engine/render/create");
    const { container, doc } = createFakeDom();
    const withGl = { ...container, ownerDocument: withWebGL(doc) };

    const handle = createFoldEngine(withGl as unknown as HTMLElement, makeStructure(4), {
      forceFallback: true,
    });

    expect(handle.renderMode).toBe("svg");
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    handle.dispose();
  });
});
