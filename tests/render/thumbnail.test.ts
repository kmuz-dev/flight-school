/**
 * SPEC 4.3: the hangar must never run six live WebGL contexts. With no WebGL at
 * all (as here, in node) every thumbnail degrades to the core's SVG.
 */
import { describe, expect, it } from "vitest";
import { disposeThumbnailRenderer, renderThumbnail, svgThumbnail } from "@/engine/render/thumbnail";
import { createCoreStub, makeStructure } from "@/engine/render/__contracts__/coreStub";

describe("thumbnails", () => {
  it("encodes the final fold state as an SVG data URL", () => {
    const core = createCoreStub();
    const structure = makeStructure(6);
    const url = svgThumbnail(structure, core);

    expect(url.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(decodeURIComponent(url.split(",")[1] ?? "")).toContain("<svg");
    // Final state = the last step, not one past it.
    expect(core.calls).toContainEqual({ fn: "computeFoldState", n: 5 });
  });

  it("falls back to SVG when WebGL is unavailable, without throwing", async () => {
    const core = createCoreStub();
    const structure = makeStructure(3);
    const url = await renderThumbnail(structure, core);
    expect(url.startsWith("data:image/svg+xml")).toBe(true);
  });

  it("serialises concurrent requests through the one shared renderer", async () => {
    const core = createCoreStub();
    const structure = makeStructure(3);
    const urls = await Promise.all([
      renderThumbnail(structure, core),
      renderThumbnail(structure, core),
      renderThumbnail(structure, core),
    ]);
    expect(new Set(urls).size).toBe(1);
  });

  it("dispose is safe with no renderer ever created", () => {
    expect(() => disposeThumbnailRenderer()).not.toThrow();
  });
});
