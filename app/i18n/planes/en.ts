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
        "dart.step-11": "Open the near wing",
        "dart.step-12": "Open the far wing",
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
          "Hold the body and lift the top wing up until it sticks out flat, like a real airplane seen from the front.",
        "dart.step-12":
          "Turn it over and do the same to the other wing. Both wings should now stick out level, making a shallow V. That is a Dart.",
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
          "Both wings have to match. If one sits higher than the other, the plane rolls that way instead of flying straight.",
      },
      tips: {
        default: "Press every fold with your thumbnail. Sharp creases fly better than soft ones.",
        "dart.step-01": "Line the corners up before you press anything down.",
        "dart.step-03": "Take your time lining the edge up. A crooked corner here makes a curved flight later.",
        "dart.step-08": "Fold both wings the same distance from the middle, or the plane will turn.",
        "dart.step-11": "Wings straight out and level, seen from the front, is what you want.",
        "dart.step-12": "Sight down the nose: the two wings should look like a shallow V.",
      },
    },

    bulldog: {
      name: "The Bulldog Dart",
      description:
        "A Dart with its sharp point folded back on itself. That gives it a short, blunt, heavy nose instead of a needle. It is slower than a Dart but much tougher, it does not crumple when it hits a wall, and it still flies straight even if your folds are a bit crooked.",
      throwTip:
        "Grip the thick nose from underneath and throw it hard and flat, straight ahead. It does not mind a rough throw.",
      titles: {
        "bulldog.step-01": "Fold it in half",
        "bulldog.step-02": "Open it back up",
        "bulldog.step-03": "Bring the right corner in",
        "bulldog.step-04": "Now the left corner",
        "bulldog.step-05": "Fold the right side in again",
        "bulldog.step-06": "And the left side",
        "bulldog.step-07": "Fold the point back down",
        "bulldog.step-08": "Fold the whole plane in half",
        "bulldog.step-09": "Fold the wings down",
        "bulldog.step-10": "Turn it over",
        "bulldog.step-11": "Stand it nose up",
        "bulldog.step-12": "Open the near wing",
        "bulldog.step-13": "Open the far wing",
      },
      steps: {
        "bulldog.step-01":
          "Put the paper down tall, like a door. Fold the right edge over to meet the left edge, then press along the fold with your thumb so it stays.",
        "bulldog.step-02":
          "Open the paper back up flat. You will see a line down the middle where you folded. That line is your guide for everything else.",
        "bulldog.step-03":
          "Take the top right corner and fold it down and in, so its top edge lies right along the middle line. Press it flat.",
        "bulldog.step-04":
          "Do exactly the same on the left: top left corner down and in, until its edge meets the middle line. The top now looks like a pointy roof.",
        "bulldog.step-05":
          "Fold the whole right slanted edge in again, so it lies along the middle line too. The nose gets thinner and sharper.",
        "bulldog.step-06":
          "Same on the left. Both slanted edges now meet in the middle, and you have a long narrow shape with a sharp point at the top.",
        "bulldog.step-07":
          "Now fold that sharp point straight back down over the plane. Bring the tip down until it reaches the spot where your first two corner folds finished.",
        "bulldog.step-08":
          "Fold the whole plane in half along the middle line, but backwards, so all the folds you just made end up on the outside.",
        "bulldog.step-09":
          "Lay it on its side. Fold the top layer down to make a wing, starting at the blunt nose and going back to the tail.",
        "bulldog.step-10":
          "Turn the whole plane over so you are looking at the other side. Check that the second wing matches the first.",
        "bulldog.step-11":
          "Stand the plane so the nose points up and look straight down the body.",
        "bulldog.step-12":
          "Hold the body and lift the top wing up until it sticks out almost level, like a real airplane seen from the front.",
        "bulldog.step-13":
          "Turn it over and do the same to the other wing. Both wings should stick out level, tipped up just a little. That is a Bulldog.",
      },
      why: {
        "bulldog.step-01":
          "The middle line is the plane's backbone. Every later fold measures itself against it.",
        "bulldog.step-02":
          "You only needed the mark, not the fold. Creasing and opening back up is how you leave yourself a guide.",
        "bulldog.step-03":
          "These corner folds pile paper at the front. Weight at the front is what keeps a plane pointing forward instead of tumbling.",
        "bulldog.step-05":
          "Folding the sides in again doubles the paper at the front again. So far this is exactly a Dart.",
        "bulldog.step-07":
          "This is the fold that makes it a Bulldog. All that pointy paper comes back and sits in a short thick block at the front.",
        "bulldog.step-08":
          "Folding backwards puts the thick folded edges outside, which gives you a spine to hold and keeps the wings level.",
        "bulldog.step-09":
          "The wings are what hold the plane up. Making both folds in the same place is why it flies straight instead of curving.",
        "bulldog.step-12":
          "A blunt nose pushes more air out of the way, so this plane flies slower. Flat wings give it enough lift to keep going anyway.",
        "bulldog.step-13":
          "Both wings have to match. If one sits higher than the other, the plane rolls that way instead of flying straight.",
      },
      tips: {
        default:
          "Press every fold with your thumbnail. This plane forgives sloppy folding better than any other, but crisp creases still fly further.",
        "bulldog.step-05": "The paper is four layers thick here. Press along the fold, not on top of it.",
        "bulldog.step-07": "Fold it over the front, not underneath. The blunt block belongs on the outside.",
        "bulldog.step-09": "Fold both wings the same distance from the middle, or the plane will turn.",
        "bulldog.step-13": "Sight down the nose: the two wings should look almost level.",
      },
    },

    harrier: {
      name: "The Harrier",
      description:
        "A big slow glider. Its wings are almost as wide as the paper, and its nose is folded flat instead of pointy, so it floats instead of racing. The little fins at the wingtips keep it from wandering off to one side. Thrown gently, it drifts across a room and lands softly.",
      throwTip:
        "Hold it under the body, just behind the nose. Point it slightly up and let it go gently. Throw this one hard and it will climb, stall, and flop.",
      titles: {
        "harrier.step-01": "Fold it in half",
        "harrier.step-02": "Open it back up",
        "harrier.step-03": "Bring the right corner in",
        "harrier.step-04": "Now the left corner",
        "harrier.step-05": "Fold the point down flat",
        "harrier.step-06": "Fold the whole plane in half",
        "harrier.step-07": "Fold the wide wings down",
        "harrier.step-08": "Turn it over",
        "harrier.step-09": "Stand it nose up",
        "harrier.step-10": "Bend the near wingtip up",
        "harrier.step-11": "Bend the far wingtip up",
        "harrier.step-12": "Open the near wing",
        "harrier.step-13": "Open the far wing",
      },
      steps: {
        "harrier.step-01":
          "Put the paper down tall, like a door. Fold the right edge over to meet the left edge, then press along the fold with your thumb so it stays.",
        "harrier.step-02":
          "Open the paper back up flat. You will see a line down the middle where you folded. That line is your guide for everything else.",
        "harrier.step-03":
          "Take the top right corner and fold it down and in, so its top edge lies right along the middle line. Press it flat.",
        "harrier.step-04":
          "Do exactly the same on the left: top left corner down and in, until its edge meets the middle line. The top now looks like a pointy roof.",
        "harrier.step-05":
          "Do not sharpen the point. Instead fold it straight down, so the tip lands on the spot where the two corner folds finished. The front goes flat and wide.",
        "harrier.step-06":
          "Fold the whole plane in half along the middle line, but backwards, so the folds you just made end up on the outside.",
        "harrier.step-07":
          "Lay it on its side. Fold the top layer down to make a wing, but this time start the fold very close to the folded edge, so the wing comes out wide.",
        "harrier.step-08":
          "Turn the whole plane over so you are looking at the other side. Fold the second wing to match the first.",
        "harrier.step-09":
          "Stand the plane so the nose points up and look straight down the body.",
        "harrier.step-10":
          "Take the very outside edge of the top wing, about a thumb's width in from the tip, and bend it up. Stop part way. Do not squash it flat.",
        "harrier.step-11":
          "Turn it over and bend the other wingtip up the same amount. The two little fins should be mirror images of each other.",
        "harrier.step-12":
          "Hold the body and lift the whole top wing up until it sticks out almost level. The fin you made should now be standing up at the tip.",
        "harrier.step-13":
          "Turn it over and lift the other wing the same way. Seen from the front you should have two wide flat wings with two upturned tips.",
      },
      why: {
        "harrier.step-01":
          "The middle line is the plane's backbone. Every later fold measures itself against it.",
        "harrier.step-02":
          "You only needed the mark, not the fold. Creasing and opening back up is how you leave yourself a guide.",
        "harrier.step-03":
          "These corner folds pile paper at the front, which is the weight that keeps the nose pointing forward.",
        "harrier.step-05":
          "A flat front is slower than a point, and slow is what this plane wants. Folding the tip down also keeps the corner flaps from springing open.",
        "harrier.step-06":
          "Folding backwards puts the thick folded edges outside, which gives you a spine to hold and keeps the wings level.",
        "harrier.step-07":
          "Wide wings hold up more weight at a lower speed. That is the whole trick behind a plane that floats instead of darting.",
        "harrier.step-10":
          "A wingtip bent up acts like a rudder at each end. If the plane starts to slide sideways, the fins push it straight again.",
        "harrier.step-12":
          "Flat wings catch the air underneath them. With wings this wide, even a gentle throw gives the plane plenty to ride on.",
        "harrier.step-13":
          "Both wings have to match. If one sits higher than the other, the plane rolls that way instead of gliding straight.",
      },
      tips: {
        default:
          "This plane is all about the wings being identical. Whenever you fold one side, hold it up and compare it with the other before you press down.",
        "harrier.step-05": "Aim the tip at the spot where the two slanted edges meet, then press.",
        "harrier.step-07": "Leave only a narrow strip in the middle for the body. Everything else is wing.",
        "harrier.step-10": "Bend, do not fold. A fin pressed flat does nothing.",
        "harrier.step-13": "Look at it nose on: two wide wings, two little fins standing up.",
      },
    },

    "sea-glider": {
      name: "The Sea Glider",
      description:
        "A long, calm glider. Instead of folding corners first, you roll the front edge over twice, which puts a strip of heavy paper right across the front. That weight in the right place makes it ride a long, flat, slow line, like a gull over water. It stays up the longest of any plane in the hangar.",
      throwTip:
        "Hold it under the body near the middle. Aim it level, or a whisker above level, and push it away smoothly rather than throwing it.",
      titles: {
        "sea-glider.step-01": "Fold it in half",
        "sea-glider.step-02": "Open it back up",
        "sea-glider.step-03": "Roll the top edge down",
        "sea-glider.step-04": "Roll it down again",
        "sea-glider.step-05": "Bring the right corner in",
        "sea-glider.step-06": "Now the left corner",
        "sea-glider.step-07": "Fold the whole plane in half",
        "sea-glider.step-08": "Fold the wide wings down",
        "sea-glider.step-09": "Turn it over",
        "sea-glider.step-10": "Stand it nose up",
        "sea-glider.step-11": "Open the near wing",
        "sea-glider.step-12": "Open the far wing",
      },
      steps: {
        "sea-glider.step-01":
          "Put the paper down tall, like a door. Fold the right edge over to meet the left edge, then press along the fold with your thumb so it stays.",
        "sea-glider.step-02":
          "Open the paper back up flat. You will see a line down the middle where you folded. That line is your guide for everything else.",
        "sea-glider.step-03":
          "Fold the whole top edge down toward you, about three fingers wide. Keep the folded edge level with the top of the page, then press it flat.",
        "sea-glider.step-04":
          "Fold that thick strip down once more, the same amount again. The front of the paper is now three layers thick and noticeably stiffer.",
        "sea-glider.step-05":
          "Find the middle of the new thick front edge. Fold the top right corner down and in, so the thick edge lies along the middle line.",
        "sea-glider.step-06":
          "Do the same on the left. The two thick edges now meet down the middle and the front comes to a point.",
        "sea-glider.step-07":
          "Fold the whole plane in half along the middle line, but backwards, so the folds you just made end up on the outside.",
        "sea-glider.step-08":
          "Lay it on its side. Fold the top layer down to make a wing, starting the fold close to the folded edge so the wing comes out wide.",
        "sea-glider.step-09":
          "Turn the whole plane over so you are looking at the other side. Fold the second wing to match the first.",
        "sea-glider.step-10":
          "Stand the plane so the nose points up and look straight down the body.",
        "sea-glider.step-11":
          "Hold the body and lift the top wing up until it sticks out almost level, like a real airplane seen from the front.",
        "sea-glider.step-12":
          "Turn it over and lift the other wing the same way. Two long flat wings, tipped up just a little, and you are done.",
      },
      why: {
        "sea-glider.step-01":
          "The middle line is the plane's backbone. Every later fold measures itself against it.",
        "sea-glider.step-02":
          "You only needed the mark, not the fold. Creasing and opening back up is how you leave yourself a guide.",
        "sea-glider.step-03":
          "Rolling the edge over puts weight along the whole front of the plane instead of in one lump. Spread out like that, it keeps the plane level.",
        "sea-glider.step-04":
          "Two rolls make the front edge stiff as well as heavy. A stiff leading edge does not flutter, and a wing that does not flutter glides further.",
        "sea-glider.step-05":
          "Folding the heavy edge inward carries all that weight into the nose, which is where a glider needs it.",
        "sea-glider.step-07":
          "Folding backwards puts the thick folded edges outside, which gives you a spine to hold and keeps the wings level.",
        "sea-glider.step-08":
          "Long wide wings plus a light tail is the recipe for a slow flat glide. Narrow wings would make this plane dive.",
        "sea-glider.step-11":
          "Flat wings catch the air underneath them, and there is a lot of wing here to catch it with.",
        "sea-glider.step-12":
          "Both wings have to match. If one sits higher than the other, the plane rolls that way instead of gliding straight.",
      },
      tips: {
        default:
          "Every fold on this plane is measured from the one before it, so a crooked roll early on shows up as a crooked plane at the end.",
        "sea-glider.step-03": "Line up both top corners before you press, or the whole plane will lean.",
        "sea-glider.step-04": "Fold the strip over itself, not the whole sheet.",
        "sea-glider.step-08": "Leave only a narrow strip in the middle for the body. Everything else is wing.",
        "sea-glider.step-12": "If it dives when you throw it, bend the very back edges of the wings up a little.",
      },
    },

    hammer: {
      name: "The Hammer",
      description:
        "The heavyweight. You roll the front of the paper back on itself twice before you make the nose, so the finished point has six or more layers packed into it. All that weight up front lets it punch through the air and fly a very long way. It is the hardest plane here to fold neatly, and the most satisfying to throw.",
      throwTip:
        "Pinch the thick nose from underneath and throw it hard, fast, and slightly upward. This is the one plane that wants your full strength.",
      titles: {
        "hammer.step-01": "Fold it in half",
        "hammer.step-02": "Open it back up",
        "hammer.step-03": "Bring the right corner in",
        "hammer.step-04": "Now the left corner",
        "hammer.step-05": "Roll the point back",
        "hammer.step-06": "Roll it back again",
        "hammer.step-07": "Fold the right corner to the middle",
        "hammer.step-08": "Now the left corner",
        "hammer.step-09": "Fold the whole plane in half",
        "hammer.step-10": "Fold the wings down",
        "hammer.step-11": "Turn it over",
        "hammer.step-12": "Stand it nose up",
        "hammer.step-13": "Open the near wing",
        "hammer.step-14": "Open the far wing",
      },
      steps: {
        "hammer.step-01":
          "Put the paper down tall, like a door. Fold the right edge over to meet the left edge, then press along the fold with your thumb so it stays.",
        "hammer.step-02":
          "Open the paper back up flat. You will see a line down the middle where you folded. That line is your guide for everything else.",
        "hammer.step-03":
          "Take the top right corner and fold it down and in, so its top edge lies right along the middle line. Press it flat.",
        "hammer.step-04":
          "Do exactly the same on the left. The top of the paper now looks like a pointy roof.",
        "hammer.step-05":
          "Fold the point straight back down over the plane, so the tip lands where the two corner folds finished. The front is now a flat edge.",
        "hammer.step-06":
          "Fold that flat front down again, a bit less far this time. The front edge gets wider and much thicker. Press it hard.",
        "hammer.step-07":
          "Find the middle of the thick front edge. Fold the right corner of that edge down and in, until the edge lies along the middle line.",
        "hammer.step-08":
          "Do the same with the left corner. A new point appears, and all the rolled up paper is now packed inside it.",
        "hammer.step-09":
          "Fold the whole plane in half along the middle line, but backwards, so everything you just folded ends up on the outside.",
        "hammer.step-10":
          "Lay it on its side. Fold the top layer down to make a wing, starting at the nose and going back to the tail.",
        "hammer.step-11":
          "Turn the whole plane over so you are looking at the other side. Fold the second wing to match the first.",
        "hammer.step-12":
          "Stand the plane so the nose points up and look straight down the body. The nose should be a solid block you can pinch.",
        "hammer.step-13":
          "Hold the body and lift the top wing up until it sticks out level, like a real airplane seen from the front.",
        "hammer.step-14":
          "Turn it over and lift the other wing the same way. Keep these wings flatter than on the gliders. That is a Hammer.",
      },
      why: {
        "hammer.step-01":
          "The middle line is the plane's backbone. Every later fold measures itself against it.",
        "hammer.step-02":
          "You only needed the mark, not the fold. Creasing and opening back up is how you leave yourself a guide.",
        "hammer.step-03":
          "These corner folds are the first load of paper heading for the nose. Everything after this piles more on top.",
        "hammer.step-05":
          "Rolling the point back instead of sharpening it doubles the paper at the front. You are building weight, not a spike.",
        "hammer.step-06":
          "Each roll folds a band that is already several layers thick. Two rolls is as much as paper will lie flat for.",
        "hammer.step-07":
          "This drags the whole rolled up bar into the point. That is what makes the nose so much heavier than the tail.",
        "hammer.step-09":
          "Folding backwards puts the thick folded edges outside, which gives you a spine to hold and keeps the wings level.",
        "hammer.step-10":
          "Narrower wings mean less air pushing back, so a heavy plane keeps its speed and travels further before it lands.",
        "hammer.step-13":
          "A fast heavy plane needs less lift, not more, so these wings sit flatter than a glider's.",
        "hammer.step-14":
          "Both wings have to match. At this speed even a small difference sends the plane into a curve.",
      },
      tips: {
        default:
          "Press every fold with your thumbnail, then run it along the table edge. Thick folds spring open unless you really crease them.",
        "hammer.step-05": "Take your time. If the tip lands crooked, every fold after it will be crooked too.",
        "hammer.step-06": "Squeeze this one flat with something hard, like the back of a spoon.",
        "hammer.step-07": "Six layers is a lot. Fold slowly and hold the paper down while you do it.",
        "hammer.step-14": "Sight down the nose: the wings should look nearly level, not like a deep V.",
      },
    },

    "square-cruiser": {
      name: "The Square Cruiser",
      description:
        "The only plane here that starts from a square, so the first thing you do is make one. A square gives you short wide wings and a stubby body, which turns out to be a steady, unhurried flier. It cruises across a room in a straight line without much fuss.",
      throwTip:
        "Hold it under the body behind the nose and throw it level with a medium push. It does not want speed, it wants a smooth release.",
      titles: {
        "square-cruiser.prep.letter-01": "Fold a corner over",
        "square-cruiser.prep.letter-02": "Open it back up",
        "square-cruiser.prep.letter-03": "Cut off the strip",
        "square-cruiser.prep.a4-01": "Fold a corner over",
        "square-cruiser.prep.a4-02": "Open it back up",
        "square-cruiser.prep.a4-03": "Cut off the strip",
        "square-cruiser.prep.index-01": "Fold a corner over",
        "square-cruiser.prep.index-02": "Open it back up",
        "square-cruiser.prep.index-03": "Cut off the strip",
        "square-cruiser.step-01": "Fold it in half",
        "square-cruiser.step-02": "Open it back up",
        "square-cruiser.step-03": "Bring the right corner in",
        "square-cruiser.step-04": "Now the left corner",
        "square-cruiser.step-05": "Fold the point down flat",
        "square-cruiser.step-06": "Fold the right corner to the middle",
        "square-cruiser.step-07": "Now the left corner",
        "square-cruiser.step-08": "Fold the whole plane in half",
        "square-cruiser.step-09": "Fold the wings down",
        "square-cruiser.step-10": "Turn it over",
        "square-cruiser.step-11": "Stand it nose up",
        "square-cruiser.step-12": "Open the near wing",
        "square-cruiser.step-13": "Open the far wing",
      },
      steps: {
        "square-cruiser.prep.letter-01":
          "Lay the sheet down tall. Fold the top left corner over and down, until the top edge lies exactly along the right hand edge. Press the fold flat.",
        "square-cruiser.prep.letter-02":
          "Open the paper back up. The fold has left a line straight across the sheet. Everything above that line is a perfect square.",
        "square-cruiser.prep.letter-03":
          "Cut along the line and keep the square. Put the leftover strip aside, you will not need it.",
        "square-cruiser.prep.a4-01":
          "Lay the sheet down tall. Fold the top left corner over and down, until the top edge lies exactly along the right hand edge. Press the fold flat.",
        "square-cruiser.prep.a4-02":
          "Open the paper back up. The fold has left a line straight across the sheet. Everything above that line is a perfect square.",
        "square-cruiser.prep.a4-03":
          "Cut along the line and keep the square. Put the leftover strip aside, you will not need it.",
        "square-cruiser.prep.index-01":
          "Lay the card down tall. Fold the top left corner over and down, until the top edge lies exactly along the right hand edge. Press the fold flat.",
        "square-cruiser.prep.index-02":
          "Open the card back up. The fold has left a line straight across it. Everything above that line is a perfect square.",
        "square-cruiser.prep.index-03":
          "Cut along the line and keep the square. It is a small stiff square, so expect a small plane that does not glide very far.",
        "square-cruiser.step-01":
          "Put the square down in front of you. Fold the right edge over to meet the left edge, press along the fold, and you have your middle line.",
        "square-cruiser.step-02":
          "Open it back up flat. The line down the middle is your guide for everything else.",
        "square-cruiser.step-03":
          "Fold the top right corner down and in, so the top edge lies along the middle line. On a square, that corner reaches the exact centre of the sheet.",
        "square-cruiser.step-04":
          "Do the same on the left. The top half of the square is now a big triangle sitting on the bottom half.",
        "square-cruiser.step-05":
          "Fold the point of that triangle straight down, so the tip lands on the middle of the square. The front goes flat and wide.",
        "square-cruiser.step-06":
          "Fold the right corner of the new flat front down and in to the middle line, so a fresh point appears above the flap you just folded.",
        "square-cruiser.step-07":
          "Do the same on the left. The two corners meet in the middle and hold the flap underneath them in place.",
        "square-cruiser.step-08":
          "Fold the whole plane in half along the middle line, but backwards, so everything you just folded ends up on the outside.",
        "square-cruiser.step-09":
          "Lay it on its side. Fold the top layer down to make a wing, starting at the nose and going back to the tail.",
        "square-cruiser.step-10":
          "Turn the whole plane over so you are looking at the other side. Fold the second wing to match the first.",
        "square-cruiser.step-11":
          "Stand the plane so the nose points up and look straight down the body.",
        "square-cruiser.step-12":
          "Hold the body and lift the top wing up until it sticks out almost level, like a real airplane seen from the front.",
        "square-cruiser.step-13":
          "Turn it over and lift the other wing the same way. Short, wide, level wings, and the Cruiser is finished.",
      },
      why: {
        "square-cruiser.prep.letter-01":
          "Folding one edge onto the next is how you find a square without a ruler. The fold does the measuring for you.",
        "square-cruiser.prep.letter-03":
          "A square makes short wide wings. Start from a long sheet and you would get a completely different plane.",
        "square-cruiser.prep.a4-01":
          "Folding one edge onto the next is how you find a square without a ruler. The fold does the measuring for you.",
        "square-cruiser.prep.a4-03":
          "A square makes short wide wings. Start from a long sheet and you would get a completely different plane.",
        "square-cruiser.prep.index-01":
          "Folding one edge onto the next is how you find a square without a ruler. The fold does the measuring for you.",
        "square-cruiser.prep.index-03":
          "A square makes short wide wings. Start from a long sheet and you would get a completely different plane.",
        "square-cruiser.step-01":
          "The middle line is the plane's backbone. Every later fold measures itself against it.",
        "square-cruiser.step-02":
          "You only needed the mark, not the fold. Creasing and opening back up is how you leave yourself a guide.",
        "square-cruiser.step-03":
          "On a square these corner folds are huge, so half the sheet ends up doubled at the front. That is where the plane's weight comes from.",
        "square-cruiser.step-05":
          "Folding the point flat makes the nose blunt and stops it stabbing into the floor on every landing.",
        "square-cruiser.step-06":
          "These two corners lock the flap underneath so the nose cannot spring open in the air.",
        "square-cruiser.step-08":
          "Folding backwards puts the thick folded edges outside, which gives you a spine to hold and keeps the wings level.",
        "square-cruiser.step-09":
          "A square sheet is short for its width, so these wings come out broad and stubby. That is what makes the Cruiser steady.",
        "square-cruiser.step-12":
          "Flat wings catch the air underneath them. Short wings need to be level to work.",
        "square-cruiser.step-13":
          "Both wings have to match. If one sits higher than the other, the plane rolls that way instead of cruising straight.",
      },
      tips: {
        default:
          "Everything on this plane is measured from the middle line and the corners, so it works on any size of square you can make.",
        "square-cruiser.prep.a4-01": "Slide the corner around until the top edge sits exactly on the side edge, then press.",
        "square-cruiser.prep.a4-03": "Ask an adult before you use scissors, and cut along the crease, not next to it.",
        "square-cruiser.prep.letter-03": "Ask an adult before you use scissors, and cut along the crease, not next to it.",
        "square-cruiser.prep.index-03": "Printer paper works better than card here. Card is stiff and will not hold the folds at the nose.",
        "square-cruiser.step-03": "The corner should land right in the middle of the square. Use that as your check.",
        "square-cruiser.step-06": "Leave the flap underneath alone. Only the two new corners move.",
        "square-cruiser.step-13": "Sight down the nose: two short wings, almost level.",
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
    "blunt-nose": {
      term: "Blunt nose",
      definition:
        "A nose made by folding the sharp point back on itself, so the front of the plane is flat and thick instead of pointy.",
    },
    hem: {
      term: "Hem",
      definition:
        "A strip folded over along a straight edge, like the hem of a shirt. Roll it twice and that edge becomes thick and heavy.",
    },
    "partial-fold": {
      term: "Partial fold",
      definition: "A fold you stop part way, so the paper bends and stays at an angle instead of lying flat.",
    },
    "tip-fin": {
      term: "Tip fin",
      definition:
        "A small piece at the end of a wing that is bent upward. It stops the plane from sliding sideways through the air.",
    },
    "square-from-rectangle": {
      term: "Making a square",
      definition:
        "Fold one edge of a sheet over onto the edge next to it. The fold marks the biggest square that fits inside the sheet, ready to cut.",
    },
  },
};

export default planes;
export { planes };
