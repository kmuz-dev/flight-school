/**
 * LOCAL FIXTURE - not product content.
 *
 * T3 builds the tutorial screen before the real content and dictionaries exist.
 * This file is shaped exactly like the real thing (`PlaneStructure`,
 * `PlaneStrings`, the glossary slice of `PlanesDictionary`, and a flat
 * `UiDictionary`) so the integrator can delete it and wire the real modules
 * with no component changes.
 *
 * The geometry is plausible rather than authoritative: it exercises every
 * action variant the stage has to survive (fold, flip, rotate, partial fold),
 * not a verified dart. The real sequence comes from app/content/planes/.
 */
import type { PlaneStructure } from "@/content/types";
import type { GlossaryEntry, PlaneStrings, UiDictionary } from "@/i18n/types";
import type { FoldStep } from "@/engine/core/types";
import type { PlaneStringsWithTitles } from "../viewModel";

// A4 in millimetres, origin at sheet centre: x in [-105, 105], y in [-148.5, 148.5].
const HALF_W = 105;
const HALF_H = 148.5;

const steps: readonly FoldStep[] = [
  {
    id: "dart.step-01",
    action: {
      type: "fold",
      crease: { a: [0, -HALF_H], b: [0, HALF_H] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    teaches: ["valley-fold", "center-line"],
    duration: 1.2,
  },
  {
    id: "dart.step-02",
    action: { type: "unfold", toStep: "dart.step-01" },
    teaches: ["crease"],
    duration: 0.9,
  },
  {
    id: "dart.step-03",
    action: {
      type: "fold",
      crease: { a: [0, HALF_H], b: [HALF_W, HALF_H - HALF_W] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    duration: 1,
  },
  {
    id: "dart.step-04",
    action: {
      type: "fold",
      crease: { a: [0, HALF_H], b: [-HALF_W, HALF_H - HALF_W] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    teaches: ["valley-fold", "center-line"],
    duration: 1.1,
  },
  {
    id: "dart.step-05",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, 40], b: [HALF_W, 40] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    duration: 1,
  },
  {
    id: "dart.step-06",
    action: {
      type: "fold",
      crease: { a: [0, HALF_H], b: [HALF_W, -20] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    duration: 1.2,
  },
  {
    id: "dart.step-07",
    action: {
      type: "fold",
      crease: { a: [0, HALF_H], b: [-HALF_W, -20] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    duration: 1.2,
  },
  {
    id: "dart.step-08",
    action: { type: "flip" },
    camera: { preset: "front" },
    duration: 0.8,
  },
  {
    id: "dart.step-09",
    action: {
      type: "fold",
      crease: { a: [0, -HALF_H], b: [0, HALF_H] },
      side: "right",
      angle: 180,
      direction: "mountain",
    },
    teaches: ["mountain-fold"],
    duration: 1.3,
  },
  {
    id: "dart.step-10",
    action: { type: "rotate", degrees: 90 },
    camera: { preset: "threeQuarter" },
    duration: 0.8,
  },
  {
    id: "dart.step-11",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, 10], b: [HALF_W, 10] },
      side: "left",
      angle: 70,
      direction: "valley",
    },
    teaches: ["wing-fold"],
    duration: 1.4,
  },
  {
    id: "dart.step-12",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, 60], b: [HALF_W, 60] },
      side: "right",
      angle: 20,
      direction: "mountain",
    },
    camera: { preset: "front" },
    teaches: ["mountain-fold", "wing-fold"],
    duration: 1,
  },
];

export const sampleDartStructure: PlaneStructure = {
  id: "dart",
  tier: "easy",
  paper: {
    format: "letter-a4",
    prep: {
      letter: [],
      a4: [],
      square: [
        {
          id: "dart.prep.square",
          action: { type: "cut", line: { a: [-HALF_W, 30], b: [HALF_W, 30] }, keep: "left" },
        },
      ],
      "index-4x6": [
        {
          id: "dart.prep.index",
          action: { type: "cut", line: { a: [-HALF_W, 20], b: [HALF_W, 20] }, keep: "left" },
        },
      ],
    },
  },
  ratings: { speed: 5, distance: 4, airtime: 2, ease: 5 },
  steps,
  accent: "#7FA8C9",
};

export const sampleDartStrings: PlaneStringsWithTitles = {
  name: "The Dart",
  description:
    "The fastest plane in the hangar. It flies flat and hard, straight down the hallway, and it is the first plane every cadet learns.",
  throwTip: "Hold it near the middle and throw level, hard and straight.",
  titles: {
    "dart.step-01": "Fold it in half",
    "dart.step-02": "Open it back up",
    "dart.step-03": "Bring the right corner in",
    "dart.step-04": "Fold the top corners in",
    "dart.step-05": "Fold the nose down",
    "dart.step-06": "Right edge to the middle",
    "dart.step-07": "Left edge to the middle",
    "dart.step-08": "Turn the plane over",
    "dart.step-09": "Fold it in half again",
    "dart.step-10": "Turn it to face you",
    "dart.step-11": "Fold the first wing down",
    "dart.step-12": "Tip the wings up",
  },
  steps: {
    "dart.step-01":
      "Put the paper down tall. Fold the right half over onto the left half so the edges line up, then press the crease flat with your thumb.",
    "dart.step-02":
      "Open the paper back out. You should see one clean line down the middle. That line is your guide for everything that comes next.",
    "dart.step-03":
      "Take the top right corner and bring it down so its edge lies along the middle line. Press it flat.",
    "dart.step-04":
      "Take the top left corner and bring it down the same way, so its edge lines up with the middle crease. Press it flat with your thumb. The top should now look like a pointed roof.",
    "dart.step-05":
      "Fold the pointed top down so the tip reaches about a hand's width below the corners you just made.",
    "dart.step-06":
      "Bring the right edge in to the middle line again. The paper is thicker now, so press slowly and firmly.",
    "dart.step-07": "Do the same on the left. Both edges should meet neatly at the middle line.",
    "dart.step-08": "Turn the whole plane over so the folded side is facing the table.",
    "dart.step-09":
      "Fold the plane in half along the middle line, this time folding away from you so the folds stay on the outside.",
    "dart.step-10":
      "Turn the plane so the long straight edge is on top and the point is facing left. This is how it will sit in your hand.",
    "dart.step-11":
      "Fold the top layer down to make the first wing. Line the wing edge up with the bottom edge of the body.",
    "dart.step-12":
      "Bend both wing tips up just a little. A small bend is enough - too much and the plane climbs and stalls.",
  },
  explanations: {
    "dart.step-01":
      "This middle crease is the spine of the plane. Every later fold measures itself against it.",
    "dart.step-02":
      "You only wanted the line, not the fold. Creasing and opening back up is how folders make a ruler out of paper.",
    "dart.step-04":
      "These two folds put the weight at the nose, which is what keeps the plane pointed forward.",
    "dart.step-05": "A blunt nose is safer and stops the point from crumpling on landing.",
    "dart.step-07": "Matching both sides keeps the plane balanced so it flies straight, not in a curve.",
    "dart.step-08": "Turning it over puts the neat side outward, so the finished plane looks clean.",
    "dart.step-09": "Folding away from you leaves the wing folds on the outside where you can grip them.",
    "dart.step-11": "Wings carry the plane. The flatter and more even they are, the further it goes.",
    "dart.step-12": "A tiny upward bend keeps the nose from dropping halfway down the hall.",
  },
  tips: {
    default: "Keep your creases sharp for maximum airtime.",
    "dart.step-01": "Line the corners up before you press anything down.",
    "dart.step-05": "Use a fingernail along the crease to make it really sharp.",
    "dart.step-11": "Fold both wings the same way or the plane will bank to one side.",
  },
};

export const sampleGlossary: Readonly<Record<string, GlossaryEntry>> = {
  "valley-fold": {
    term: "Valley fold",
    definition: "The crease dips down, like a valley. The paper folds toward you.",
  },
  "mountain-fold": {
    term: "Mountain fold",
    definition: "The crease points up, like a ridge. The paper folds away from you.",
  },
  "center-line": {
    term: "Center line",
    definition: "The crease down the middle you made in step 01.",
  },
  crease: {
    term: "Crease",
    definition: "A fold you press in and then open again, so it works like a pencil line.",
  },
  "wing-fold": {
    term: "Wing fold",
    definition: "A fold that only goes partway down, leaving the wing standing at an angle.",
  },
};

/** Flat UI dictionary slice covering `TUTORIAL_UI_KEYS`. */
export const sampleUiDictionary: UiDictionary = {
  "a11y.skipToContent": "Skip to main content",
  "tutorial.backToHangar": "The Hangar",
  "tutorial.exit": "Exit",
  "tutorial.progressLabel": "Tutorial progress",
  "tutorial.stepAnnouncement": "Step {current} of {total}: {title}",
  "tutorial.license.easy": "Beginner license",
  "tutorial.license.medium": "Pilot license",
  "tutorial.license.advanced": "Ace license",
  "tutorial.stageLabel": "Fold viewer",
  "tutorial.viewHint": "View: 3/4 - drag to orbit",
  "tutorial.cameraGroupLabel": "Camera angle",
  "tutorial.camera.front": "Front",
  "tutorial.camera.threeQuarter": "3/4",
  "tutorial.camera.top": "Top",
  "tutorial.playingFold": "Playing fold",
  "tutorial.pausedFold": "Fold paused",
  "tutorial.paper.letter": "Letter - 216 x 279 mm",
  "tutorial.paper.a4": "A4 - 210 x 297 mm",
  "tutorial.paper.square": "Square - 210 x 210 mm",
  "tutorial.paper.index-4x6": "Index card - 102 x 152 mm",
  "tutorial.transportLabel": "Fold playback",
  "tutorial.play": "Play the fold",
  "tutorial.pause": "Pause the fold",
  "tutorial.prevStep": "Previous fold",
  "tutorial.nextStep": "Next fold",
  "tutorial.replay": "Replay",
  "tutorial.stepLabel": "Step {current} / {total}",
  "tutorial.timeReadout": "{elapsed} / {total}",
  "tutorial.scrubLabel": "Scrub the fold animation",
  "tutorial.stepSelectLabel": "Choose a fold",
  "tutorial.staticFallback": "Static fold view. 3D controls are unavailable.",
  "tutorial.stripLabel": "Steps",
  "tutorial.goToStep": "Go to step {step}",
  "tutorial.stepRegionLabel": "Current step",
    "tutorial.foldTerms": "Fold terms",
  "tutorial.selfCheck": "My paper looks like this",
  "tutorial.back": "Back",
  "tutorial.nextFold": "Next fold",
  "tutorial.finish": "Finish and earn your wings",
  "tutorial.foldsToWings": "{count} folds to your wings",
  "tutorial.tipLabel": "Tip",
};

/** Convenience view of the fixture as the real `PlaneStrings` contract. */
export const sampleDartPlaneStrings: PlaneStrings = sampleDartStrings;
