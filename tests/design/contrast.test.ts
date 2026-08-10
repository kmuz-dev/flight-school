/**
 * DESIGN.md's contrast rule, made mechanical.
 *
 * "All text pairs must pass WCAG AA" is the one design rule that is arithmetic
 * rather than taste, and it is also the one that quietly breaks: a token is
 * nudged half a step darker for looks, and nothing anywhere says the caption
 * that uses it just dropped to 3.9:1. axe catches this too, but only on the
 * screens the E2E scan visits and only after a full build - this reads the
 * tokens straight out of globals.css and fails in milliseconds.
 *
 * The pairs below are the ones the components actually assemble. Adding a new
 * text colour to the palette means adding its grounds here.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CSS = readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");

/** The tokens declared in a block, as raw CSS values. */
function block(name: "@theme" | ".night"): Record<string, string> {
  const start = CSS.indexOf(name);
  if (start < 0) throw new Error(`no ${name} block in globals.css`);
  const open = CSS.indexOf("{", start);
  // Token blocks contain comments but no nested braces, so the first closing
  // brace ends the block.
  const body = CSS.slice(open + 1, CSS.indexOf("}", open));
  const out: Record<string, string> = {};
  for (const [, key, value] of body.matchAll(/(--color-[\w-]+)\s*:\s*([^;]+);/g)) {
    out[key] = value.trim();
  }
  return out;
}

type Rgba = readonly [number, number, number, number];

function parse(value: string): Rgba {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgb = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s*\)$/.exec(value);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4])];
  }
  throw new Error(`unparsed colour: ${value}`);
}

/** Alpha is composited against the ground before measuring, as a browser does. */
function flatten([r, g, b, a]: Rgba, ground: Rgba): readonly [number, number, number] {
  return [0, 1, 2].map((i) => ground[i]! + a * ([r, g, b][i]! - ground[i]!)) as unknown as readonly [
    number,
    number,
    number,
  ];
}

function luminance([r, g, b]: readonly [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg: Rgba, bg: Rgba): number {
  if (bg[3] !== 1) throw new Error("a ground must be opaque");
  const [hi, lo] = [luminance(flatten(fg, bg)), luminance(flatten(bg, bg))].sort((a, b) => b - a);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** WCAG AA for normal-size text. Everything below is micro to instruction size. */
const AA = 4.5;

const SCENES = [
  {
    name: "daylight",
    tokens: block("@theme"),
    grounds: ["--color-paper", "--color-raised"],
    /** Foregrounds that carry prose, on both grounds. */
    text: ["--color-ink", "--color-ink-87", "--color-ink-muted", "--color-red-ink", "--color-sky-ink"],
  },
  {
    name: "Night Flight",
    // Night redeclares only what changes, so it inherits the rest of the theme.
    tokens: { ...block("@theme"), ...block(".night") },
    grounds: ["--color-paper", "--color-raised"],
    text: ["--color-ink", "--color-ink-87", "--color-ink-muted", "--color-red-ink", "--color-sky-ink"],
  },
] as const;

describe("the palette meets DESIGN.md's AA rule", () => {
  for (const scene of SCENES) {
    for (const ground of scene.grounds) {
      for (const fg of scene.text) {
        it(`${scene.name}: ${fg} on ${ground}`, () => {
          const ratio = contrast(parse(scene.tokens[fg]!), parse(scene.tokens[ground]!));
          expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
        });
      }
    }

    it(`${scene.name}: a label on a red action surface`, () => {
      // The one pair where the ground is an accent rather than a surface:
      // every primary button, the tier chip, and the active transport icon.
      const ratio = contrast(parse(scene.tokens["--color-on-red"]!), parse(scene.tokens["--color-red-ink"]!));
      expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
    });

    it(`${scene.name}: that red surface is still visible against the page`, () => {
      // WCAG 1.4.11: a control's own boundary needs 3:1 against what is behind
      // it, which is what stops a dark red button from sinking into the night.
      for (const ground of scene.grounds) {
        const ratio = contrast(parse(scene.tokens["--color-red-ink"]!), parse(scene.tokens[ground]!));
        expect(ratio, `${ground} -> ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
