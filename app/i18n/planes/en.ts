/**
 * English is the source of truth. Every other locale is a translation of this
 * file, audited key-for-key by scripts/i18n-audit.ts.
 *
 * Writing bar (PRD §2): a sharp 10-year-old follows every instruction alone,
 * with no folding experience. Say what to grab, where to bring it, and how to
 * know it worked. Terms are explained the first time they appear.
 */
import type { PlanesDictionary } from "../types";

const planes: PlanesDictionary = {
  planes: {
    dart: {
      name: "The Dart",
      description:
        "The classic. Twelve folds, a sharp nose, and a straight fast flight. If you have only ever folded one paper airplane in your life, it was probably close to this one.",
      throwTip:
        "Hold it underneath, near the nose. Point it slightly up and throw it fast and level. If it dives, bend the back edges of the wings up a little.",
      titles: {
        "dart.step-01": "Fold it in half",
        "dart.step-02": "Open it back up",
        "dart.step-03": "Bring the right corner in",
        "dart.step-04": "Now the left corner",
        "dart.step-05": "Fold the right side in again",
        "dart.step-06": "And the left side",
        "dart.step-07": "Fold the whole plane in half",
        "dart.step-08": "Fold the wings down",
        "dart.step-09": "Turn it over",
        "dart.step-10": "Stand it nose up",
        "dart.step-11": "Open the wings out",
        "dart.step-12": "Your dart is ready",
      },
      steps: {
        "dart.step-01":
          "Put the paper down tall, like a door. Fold the right edge over to meet the left edge, then press along the fold with your thumb so it stays.",
        "dart.step-02":
          "Open the paper back up flat. You will see a line down the middle where you folded. That line is your guide for everything else.",
        "dart.step-03":
          "Take the top right corner and fold it down and in, so its top edge lies right along the middle line. Press it flat.",
        "dart.step-04":
          "Do exactly the same on the left: top left corner down and in, until its edge meets the middle line. The top should now look like a pointy roof.",
        "dart.step-05":
          "Fold the whole right slanted edge in again, so it lies along the middle line too. The nose gets thinner and sharper.",
        "dart.step-06":
          "Same on the left. Both slanted edges now meet in the middle, and the paper is long and narrow with a sharp point at the top.",
        "dart.step-07":
          "Fold the whole plane in half along the middle line, but this time fold it backwards, so all the folds you just made end up on the outside.",
        "dart.step-08":
          "Lay it on its side. Fold the top layer down to make a wing, starting at the nose and going back. Press hard along the fold.",
        "dart.step-09":
          "Turn the whole plane over so you are looking at the other side. Check that it matches.",
        "dart.step-10":
          "Stand the plane so the nose points up and look straight down the body. Both wings should be the same.",
        "dart.step-11":
          "Open the two wings out so they stick out flat on either side, like a real airplane seen from the front.",
        "dart.step-12":
          "That is a Dart. Hold it underneath, near the nose, and throw it fast and level.",
      },
      why: {
        "dart.step-01":
          "The middle line is the plane's backbone. Every later fold measures itself against it.",
        "dart.step-02":
          "You only needed the mark, not the fold. Creasing and opening back up is how you leave yourself a guide.",
        "dart.step-03":
          "These corner folds pile paper at the nose. A heavy nose is what keeps the plane pointing forward instead of tumbling.",
        "dart.step-05":
          "Folding the sides in again makes the nose sharper and heavier, so the plane pushes through the air instead of catching it.",
        "dart.step-07":
          "Folding backwards puts the thick folded edges outside, which gives you a spine to hold and keeps the wings level.",
        "dart.step-08":
          "The wings are what hold the plane up. Making both folds in the same place is why it flies straight instead of curving.",
        "dart.step-11":
          "Flat wings catch the air underneath them. If you leave the wings closed, the plane has nothing to ride on and drops.",
        "dart.step-12":
          "The Dart is fast rather than floaty: a heavy nose and small wings trade hang time for speed.",
      },
      tips: {
        default: "Press every fold with your thumbnail. Sharp creases fly better than soft ones.",
        "dart.step-01": "Line the corners up before you press anything down.",
        "dart.step-03": "Take your time lining the edge up. A crooked corner here makes a curved flight later.",
        "dart.step-08": "Fold both wings the same distance from the middle, or the plane will turn.",
        "dart.step-11": "Wings straight out and level, seen from the front, is what you want.",
      },
    },
  },
  glossary: {
    "valley-fold": {
      term: "Valley fold",
      definition: "A fold where the crease dips down like a valley. The paper folds toward you.",
    },
    "mountain-fold": {
      term: "Mountain fold",
      definition: "The opposite of a valley fold: the crease points up like a mountain, and the paper folds away from you.",
    },
    crease: {
      term: "Crease",
      definition: "The sharp line left behind after you fold paper and press it flat.",
    },
    "center-line": {
      term: "Center line",
      definition: "The crease down the middle of the paper that you use as a guide for the other folds.",
    },
  },
};

export default planes;
export { planes };
