/**
 * The smallest DOM the fold engine touches, for node-environment tests.
 *
 * The engine funnels every DOM access through `container.ownerDocument` and its
 * `defaultView`, so a handful of duck-typed objects is enough to construct and
 * dispose a real `FoldEngine` with no browser and no WebGL.
 */
import { vi } from "vitest";
import { Vector3 } from "three";
import type { ControlsLike, RendererLike } from "@/engine/render/renderer";

export type FakeNode = {
  tagName: string;
  style: { cssText: string };
  dataset: Record<string, string>;
  parentNode: FakeNode | null;
  children: FakeNode[];
  innerHTML: string;
  clientWidth: number;
  clientHeight: number;
  ownerDocument: FakeDocument;
  appendChild(child: FakeNode): FakeNode;
  removeChild(child: FakeNode): FakeNode;
  replaceChildren(): void;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  getContext(): null;
  listenerCount(): number;
};

export type FakeDocument = {
  createElement(tag: string): FakeNode;
  defaultView: FakeWindow;
};

export type FakeWindow = {
  devicePixelRatio: number;
  matchMedia(query: string): { matches: boolean };
  requestAnimationFrame: ReturnType<typeof vi.fn>;
  cancelAnimationFrame: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  ResizeObserver: undefined;
};

export function createFakeDom(width = 800, height = 600): {
  container: FakeNode;
  doc: FakeDocument;
  view: FakeWindow;
} {
  const view: FakeWindow = {
    devicePixelRatio: 2,
    matchMedia: () => ({ matches: false }),
    // Register the callback but never run it: tests drive frames explicitly.
    requestAnimationFrame: vi.fn(() => 1),
    cancelAnimationFrame: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    ResizeObserver: undefined,
  };

  const doc: FakeDocument = {
    createElement: (tag: string) => makeNode(tag, doc, 0, 0),
    defaultView: view,
  };

  const container = makeNode("div", doc, width, height);
  return { container, doc, view };
}

function makeNode(
  tagName: string,
  ownerDocument: FakeDocument,
  clientWidth: number,
  clientHeight: number,
): FakeNode {
  let added = 0;
  let removed = 0;
  const node: FakeNode = {
    tagName,
    style: { cssText: "" },
    dataset: {},
    parentNode: null,
    children: [],
    innerHTML: "",
    clientWidth,
    clientHeight,
    ownerDocument,
    appendChild(child) {
      child.parentNode = node;
      node.children.push(child);
      return child;
    },
    removeChild(child) {
      const i = node.children.indexOf(child);
      if (i >= 0) node.children.splice(i, 1);
      child.parentNode = null;
      return child;
    },
    replaceChildren() {
      node.children.length = 0;
    },
    addEventListener: vi.fn(() => {
      added += 1;
    }),
    removeEventListener: vi.fn(() => {
      removed += 1;
    }),
    getContext: () => null,
    listenerCount: () => added - removed,
  };
  return node;
}

export type FakeRenderer = RendererLike & {
  readonly renderCount: () => number;
  readonly disposeSpy: ReturnType<typeof vi.fn>;
  readonly forceContextLossSpy: ReturnType<typeof vi.fn>;
};

export function createFakeRenderer(canvas: FakeNode): FakeRenderer {
  let renders = 0;
  const disposeSpy = vi.fn();
  const forceContextLossSpy = vi.fn();
  return {
    domElement: canvas as unknown as HTMLCanvasElement,
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: () => {
      renders += 1;
    },
    dispose: disposeSpy,
    forceContextLoss: forceContextLossSpy,
    renderCount: () => renders,
    disposeSpy,
    forceContextLossSpy,
  };
}

export type FakeControls = ControlsLike & { readonly disposeSpy: ReturnType<typeof vi.fn> };

export function createFakeControls(): FakeControls {
  const disposeSpy = vi.fn();
  return {
    target: new Vector3(),
    enabled: true,
    update: vi.fn(),
    dispose: disposeSpy,
    disposeSpy,
  };
}
