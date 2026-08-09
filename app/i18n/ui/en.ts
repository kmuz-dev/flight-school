/**
 * Site chrome. Flat dotted keys; `{placeholder}` slots are filled by format().
 * Academy voice: warm, precise, lightly playful, kid-clear.
 */
import type { UiDictionary } from "../types";

const ui: UiDictionary = {
  "nav.hangar": "The Hangar",
  "nav.logbook": "My Logbook",
  "nav.wings": "{count} wings",

  "hangar.title": "The Hangar",
  "hangar.subtitle": "Pick an aircraft. Every fold is shown in 3D, from flat paper to first flight.",
  "hangar.steps": "Steps",
  "hangar.wingsEarned": "Wings earned",
  "hangar.filterAll": "All",
  "hangar.fleetOverview": "Fleet overview",

  "tutorial.license.easy": "Beginner License",
  "tutorial.license.medium": "Pilot License",
  "tutorial.license.advanced": "Ace License",

  "rating.speed": "Speed",
  "rating.distance": "Distance",
  "rating.airtime": "Airtime",
  "rating.ease": "Ease",

  "preflight.eyebrow": "Preflight",
  "preflight.getYourPaper": "Preflight: get your paper",
  "preflight.paper": "Paper",
  "preflight.weight": "Weight",
  "preflight.folds": "Folds",
  "preflight.time": "Time",
  "preflight.throwTip": "Throw tip",
  "preflight.startFolding": "Start folding",
  "preflight.resume": "Resume at step {step}",
  "preflight.orbitHint": "Drag to orbit",

  "tutorial.backToHangar": "The Hangar",
  "tutorial.exit": "Exit",
  "tutorial.progressLabel": "{current} / {total}",
  "tutorial.stageLabel": "Fold stage",
  "tutorial.viewHint": "Drag to orbit",
  "tutorial.cameraGroupLabel": "Camera angle",
  "tutorial.camera.front": "Front",
  "tutorial.camera.threeQuarter": "3/4",
  "tutorial.camera.top": "Top",
  "tutorial.playingFold": "Playing fold {step}",
  "tutorial.pausedFold": "Paused - fold {step}",
  "tutorial.transportLabel": "Playback controls",
  "tutorial.play": "Play the fold",
  "tutorial.pause": "Pause the fold",
  "tutorial.prevStep": "Go to previous fold",
  "tutorial.nextStep": "Go to next fold",
  "tutorial.replay": "Replay this fold",
  "tutorial.stepLabel": "Step {current} / {total}",
  "tutorial.timeReadout": "{elapsed} / {total} - speed {speed}x",
  "tutorial.scrubLabel": "Scrub through the fold",
  "tutorial.stripLabel": "Jump to a step",
  "tutorial.goToStep": "Go to step {step}",
  "tutorial.stepRegionLabel": "Current step",
  "tutorial.why": "Why",
  "tutorial.foldTerms": "Fold terms",
  "tutorial.selfCheck": "My paper looks like this",
  "tutorial.back": "Back",
  "tutorial.nextFold": "Next fold",
  "tutorial.finish": "Finish",
  "tutorial.foldsToWings": "{count} folds to your wings",
  "tutorial.tipLabel": "Tip:",

  "tutorial.paper.a4": "A4 - 210 x 297 mm",
  "tutorial.paper.letter": "Letter - 8.5 x 11 in",
  "tutorial.paper.square": "Square - 210 x 210 mm",
  "tutorial.paper.index-4x6": "Index card - 4 x 6 in",

  "completion.eyebrow": "Mission complete",
  "completion.title": "You have earned your wings.",
  "completion.body":
    "Nice work, cadet. Go find some open space, point it slightly up, and throw it level.",
  "completion.rewardIssued": "Reward issued",
  "completion.logFlight": "Log your flight",
  "completion.returnToHangar": "Return to hangar",

  "a11y.themeToggle": "Switch between day and night flight",
  "a11y.localePicker": "Choose a language",
};

export default ui;
export { ui };
