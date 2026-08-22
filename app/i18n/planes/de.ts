/**
 * German plane prose. Translated from planes/en.ts key for key.
 *
 * Writing bar (PRD §2): a sharp 10-year-old follows every instruction alone.
 * "Left" and "right" are places on the table, not reading order, so they are
 * translated literally and never swapped.
 */
import type { PlanesDictionary } from "../types";

const planes: PlanesDictionary = {
  planes: {
    dart: {
      name: "Der Pfeil",
      description:
        "Der Klassiker. Zwölf Faltungen, eine spitze Nase und ein gerader, schneller Flug. Wenn du in deinem Leben nur ein einziges Papierflugzeug gefaltet hast, sah es wahrscheinlich so aus.",
      throwTip:
        "Halte ihn von unten, nah an der Nase. Ziele leicht nach oben und wirf ihn schnell und waagerecht. Wenn er abtaucht, biege die hinteren Flügelkanten ein wenig nach oben.",
      titles: {
        "dart.step-01": "Falte es in der Mitte",
        "dart.step-02": "Klapp es wieder auf",
        "dart.step-03": "Hol die rechte Ecke herein",
        "dart.step-04": "Jetzt die linke Ecke",
        "dart.step-05": "Falte die rechte Seite noch einmal",
        "dart.step-06": "Und die linke Seite",
        "dart.step-07": "Falte das ganze Flugzeug in der Mitte",
        "dart.step-08": "Falte die Flügel herunter",
        "dart.step-09": "Dreh es um",
        "dart.step-10": "Stell es mit der Nase nach oben",
        "dart.step-11": "Klapp den vorderen Flügel auf",
        "dart.step-12": "Klapp den hinteren Flügel auf",
      },
      steps: {
        "dart.step-01":
          "Leg das Papier hochkant hin, wie eine Tür. Falte die rechte Kante auf die linke Kante und streiche mit dem Daumen über den Knick, damit er hält.",
        "dart.step-02":
          "Klapp das Papier wieder flach auf. Du siehst eine Linie in der Mitte, wo du gefaltet hast. Diese Linie ist dein Anhaltspunkt für alles Weitere.",
        "dart.step-03":
          "Nimm die obere rechte Ecke und falte sie nach unten und nach innen, sodass ihre obere Kante genau auf der Mittellinie liegt. Streiche sie glatt.",
        "dart.step-04":
          "Mach links genau dasselbe: obere linke Ecke nach unten und nach innen, bis ihre Kante die Mittellinie berührt. Oben sollte es jetzt wie ein spitzes Dach aussehen.",
        "dart.step-05":
          "Falte die ganze schräge rechte Kante noch einmal nach innen, sodass sie ebenfalls auf der Mittellinie liegt. Die Nase wird dünner und spitzer.",
        "dart.step-06":
          "Links genauso. Die beiden schrägen Kanten treffen sich jetzt in der Mitte, und das Papier ist lang und schmal mit einer scharfen Spitze oben.",
        "dart.step-07":
          "Falte das ganze Flugzeug an der Mittellinie zusammen, diesmal aber nach hinten, sodass alle Faltungen, die du gerade gemacht hast, außen liegen.",
        "dart.step-08":
          "Leg es auf die Seite. Falte die obere Lage herunter, um einen Flügel zu machen, von der Nase aus nach hinten. Drücke fest entlang der Faltung.",
        "dart.step-09":
          "Dreh das ganze Flugzeug um und sieh dir die andere Seite an. Prüfe, ob sie gleich aussieht.",
        "dart.step-10":
          "Stell das Flugzeug mit der Nase nach oben und schau von oben am Rumpf entlang. Beide Flügel sollten gleich sein.",
        "dart.step-11":
          "Halte den Rumpf fest und hebe den oberen Flügel an, bis er flach absteht, wie ein echtes Flugzeug von vorne gesehen.",
        "dart.step-12":
          "Dreh es um und mach dasselbe mit dem anderen Flügel. Beide Flügel sollten jetzt waagerecht abstehen und ein flaches V bilden. Das ist ein Pfeil.",
      },
      explanations: {
        "dart.step-01":
          "Die Mittellinie ist das Rückgrat des Flugzeugs. Jede spätere Faltung misst sich an ihr.",
        "dart.step-02":
          "Du brauchtest nur die Markierung, nicht die Faltung. Kniffen und wieder aufklappen ist die Art, sich eine Hilfslinie zu hinterlassen.",
        "dart.step-03":
          "Diese Eckfaltungen stapeln Papier an der Nase. Eine schwere Nase ist das, was das Flugzeug nach vorn zeigen lässt, statt sich zu überschlagen.",
        "dart.step-05":
          "Die Seiten noch einmal einzufalten macht die Nase spitzer und schwerer, sodass das Flugzeug durch die Luft stößt, statt sie aufzufangen.",
        "dart.step-07":
          "Nach hinten zu falten legt die dicken Kanten nach außen, was dir einen Rücken zum Halten gibt und die Flügel waagerecht hält.",
        "dart.step-08":
          "Die Flügel sind das, was das Flugzeug trägt. Beide Faltungen an derselben Stelle zu machen ist der Grund, warum es geradeaus fliegt statt in eine Kurve.",
        "dart.step-11":
          "Flache Flügel fangen die Luft unter sich ein. Lässt du sie zugeklappt, hat das Flugzeug nichts, worauf es reiten kann, und fällt.",
        "dart.step-12":
          "Beide Flügel müssen gleich sein. Sitzt einer höher als der andere, rollt das Flugzeug in diese Richtung, statt geradeaus zu fliegen.",
      },
      tips: {
        default:
          "Streiche jede Faltung mit dem Daumennagel nach. Scharfe Kniffe fliegen besser als weiche.",
        "dart.step-01": "Richte die Ecken aus, bevor du irgendetwas festdrückst.",
        "dart.step-03":
          "Lass dir Zeit beim Ausrichten der Kante. Eine schiefe Ecke hier wird später zu einem kurvigen Flug.",
        "dart.step-08":
          "Falte beide Flügel gleich weit von der Mitte entfernt, sonst dreht das Flugzeug ab.",
        "dart.step-11": "Flügel gerade heraus und waagerecht, von vorne gesehen: so soll es sein.",
        "dart.step-12": "Peile über die Nase: die beiden Flügel sollten ein flaches V bilden.",
      },
    },

    bulldog: {
      name: "Der Bulldoggen-Pfeil",
      description:
        "Ein Pfeil, dessen scharfe Spitze auf sich selbst zurückgefaltet ist. Das gibt ihm eine kurze, stumpfe, schwere Nase statt einer Nadel. Er ist langsamer als ein Pfeil, aber viel robuster: er knickt nicht, wenn er gegen eine Wand fliegt, und er fliegt auch dann geradeaus, wenn deine Faltungen etwas schief geraten sind.",
      throwTip:
        "Fasse die dicke Nase von unten und wirf ihn kräftig und flach geradeaus. Ein grober Wurf macht ihm nichts aus.",
      titles: {
        "bulldog.step-01": "Falte es in der Mitte",
        "bulldog.step-02": "Klapp es wieder auf",
        "bulldog.step-03": "Hol die rechte Ecke herein",
        "bulldog.step-04": "Jetzt die linke Ecke",
        "bulldog.step-05": "Falte die rechte Seite noch einmal",
        "bulldog.step-06": "Und die linke Seite",
        "bulldog.step-07": "Falte die Spitze zurück",
        "bulldog.step-08": "Falte das ganze Flugzeug in der Mitte",
        "bulldog.step-09": "Falte die Flügel herunter",
        "bulldog.step-10": "Dreh es um",
        "bulldog.step-11": "Stell es mit der Nase nach oben",
        "bulldog.step-12": "Klapp den vorderen Flügel auf",
        "bulldog.step-13": "Klapp den hinteren Flügel auf",
      },
      steps: {
        "bulldog.step-01":
          "Leg das Papier hochkant hin, wie eine Tür. Falte die rechte Kante auf die linke Kante und streiche mit dem Daumen über den Knick, damit er hält.",
        "bulldog.step-02":
          "Klapp das Papier wieder flach auf. Du siehst eine Linie in der Mitte, wo du gefaltet hast. Diese Linie ist dein Anhaltspunkt für alles Weitere.",
        "bulldog.step-03":
          "Nimm die obere rechte Ecke und falte sie nach unten und nach innen, sodass ihre obere Kante genau auf der Mittellinie liegt. Streiche sie glatt.",
        "bulldog.step-04":
          "Mach links genau dasselbe: obere linke Ecke nach unten und nach innen, bis ihre Kante die Mittellinie berührt. Oben sieht es jetzt wie ein spitzes Dach aus.",
        "bulldog.step-05":
          "Falte die ganze schräge rechte Kante noch einmal nach innen, sodass sie ebenfalls auf der Mittellinie liegt. Die Nase wird dünner und spitzer.",
        "bulldog.step-06":
          "Links genauso. Die beiden schrägen Kanten treffen sich jetzt in der Mitte, und du hast eine lange schmale Form mit einer scharfen Spitze oben.",
        "bulldog.step-07":
          "Falte diese scharfe Spitze jetzt gerade nach unten über das Flugzeug. Bring die Spitze so weit herunter, bis sie die Stelle erreicht, an der deine ersten beiden Eckfaltungen aufhörten.",
        "bulldog.step-08":
          "Falte das ganze Flugzeug an der Mittellinie zusammen, aber nach hinten, sodass alle Faltungen, die du gerade gemacht hast, außen liegen.",
        "bulldog.step-09":
          "Leg es auf die Seite. Falte die obere Lage herunter, um einen Flügel zu machen, von der stumpfen Nase aus bis nach hinten zum Heck.",
        "bulldog.step-10":
          "Dreh das ganze Flugzeug um und sieh dir die andere Seite an. Prüfe, ob der zweite Flügel zum ersten passt.",
        "bulldog.step-11":
          "Stell das Flugzeug mit der Nase nach oben und schau von oben am Rumpf entlang.",
        "bulldog.step-12":
          "Halte den Rumpf fest und hebe den oberen Flügel an, bis er fast waagerecht absteht, wie ein echtes Flugzeug von vorne gesehen.",
        "bulldog.step-13":
          "Dreh es um und mach dasselbe mit dem anderen Flügel. Beide Flügel sollten waagerecht abstehen und nur ganz leicht nach oben zeigen. Das ist ein Bulldogge.",
      },
      explanations: {
        "bulldog.step-01":
          "Die Mittellinie ist das Rückgrat des Flugzeugs. Jede spätere Faltung misst sich an ihr.",
        "bulldog.step-02":
          "Du brauchtest nur die Markierung, nicht die Faltung. Kniffen und wieder aufklappen ist die Art, sich eine Hilfslinie zu hinterlassen.",
        "bulldog.step-03":
          "Diese Eckfaltungen stapeln Papier vorne. Gewicht vorne ist das, was ein Flugzeug nach vorn zeigen lässt, statt sich zu überschlagen.",
        "bulldog.step-05":
          "Die Seiten noch einmal einzufalten verdoppelt das Papier vorne noch einmal. Bis hierhin ist das genau ein Pfeil.",
        "bulldog.step-07":
          "Das ist die Faltung, die daraus einen Bulldoggen macht. All das spitze Papier kommt zurück und sitzt als kurzer dicker Block vorne.",
        "bulldog.step-08":
          "Nach hinten zu falten legt die dicken Kanten nach außen, was dir einen Rücken zum Halten gibt und die Flügel waagerecht hält.",
        "bulldog.step-09":
          "Die Flügel sind das, was das Flugzeug trägt. Beide Faltungen an derselben Stelle zu machen ist der Grund, warum es geradeaus fliegt statt in eine Kurve.",
        "bulldog.step-12":
          "Eine stumpfe Nase schiebt mehr Luft beiseite, deshalb fliegt dieses Flugzeug langsamer. Flache Flügel geben ihm trotzdem genug Auftrieb, um weiterzukommen.",
        "bulldog.step-13":
          "Beide Flügel müssen gleich sein. Sitzt einer höher als der andere, rollt das Flugzeug in diese Richtung, statt geradeaus zu fliegen.",
      },
      tips: {
        default:
          "Streiche jede Faltung mit dem Daumennagel nach. Dieses Flugzeug verzeiht schlampiges Falten besser als jedes andere, aber scharfe Kniffe fliegen trotzdem weiter.",
        "bulldog.step-05":
          "Hier ist das Papier vier Lagen dick. Drücke entlang der Faltung, nicht obendrauf.",
        "bulldog.step-07":
          "Falte sie nach vorne über, nicht darunter. Der stumpfe Block gehört nach außen.",
        "bulldog.step-09":
          "Falte beide Flügel gleich weit von der Mitte entfernt, sonst dreht das Flugzeug ab.",
        "bulldog.step-13": "Peile über die Nase: die beiden Flügel sollten fast waagerecht aussehen.",
      },
    },

    harrier: {
      name: "Der Harrier",
      description:
        "Ein großer, langsamer Gleiter. Seine Flügel sind fast so breit wie das Papier, und seine Nase ist flach gefaltet statt spitz, deshalb schwebt er, statt zu rasen. Die kleinen Finnen an den Flügelenden verhindern, dass er zur Seite abtreibt. Sanft geworfen, gleitet er durch ein ganzes Zimmer und landet weich.",
      throwTip:
        "Halte ihn unter dem Rumpf, direkt hinter der Nase. Ziele leicht nach oben und lass ihn sanft los. Wirfst du ihn kräftig, steigt er, bleibt stehen und klatscht herunter.",
      titles: {
        "harrier.step-01": "Falte es in der Mitte",
        "harrier.step-02": "Klapp es wieder auf",
        "harrier.step-03": "Hol die rechte Ecke herein",
        "harrier.step-04": "Jetzt die linke Ecke",
        "harrier.step-05": "Falte die Spitze flach herunter",
        "harrier.step-06": "Falte das ganze Flugzeug in der Mitte",
        "harrier.step-07": "Falte die breiten Flügel herunter",
        "harrier.step-08": "Dreh es um",
        "harrier.step-09": "Stell es mit der Nase nach oben",
        "harrier.step-10": "Biege die vordere Flügelspitze hoch",
        "harrier.step-11": "Biege die hintere Flügelspitze hoch",
        "harrier.step-12": "Klapp den vorderen Flügel auf",
        "harrier.step-13": "Klapp den hinteren Flügel auf",
      },
      steps: {
        "harrier.step-01":
          "Leg das Papier hochkant hin, wie eine Tür. Falte die rechte Kante auf die linke Kante und streiche mit dem Daumen über den Knick, damit er hält.",
        "harrier.step-02":
          "Klapp das Papier wieder flach auf. Du siehst eine Linie in der Mitte, wo du gefaltet hast. Diese Linie ist dein Anhaltspunkt für alles Weitere.",
        "harrier.step-03":
          "Nimm die obere rechte Ecke und falte sie nach unten und nach innen, sodass ihre obere Kante genau auf der Mittellinie liegt. Streiche sie glatt.",
        "harrier.step-04":
          "Mach links genau dasselbe: obere linke Ecke nach unten und nach innen, bis ihre Kante die Mittellinie berührt. Oben sieht es jetzt wie ein spitzes Dach aus.",
        "harrier.step-05":
          "Mach die Spitze nicht schärfer. Falte sie stattdessen gerade nach unten, sodass die Spitze genau dort landet, wo die beiden Eckfaltungen aufhörten. Die Front wird flach und breit.",
        "harrier.step-06":
          "Falte das ganze Flugzeug an der Mittellinie zusammen, aber nach hinten, sodass die Faltungen, die du gerade gemacht hast, außen liegen.",
        "harrier.step-07":
          "Leg es auf die Seite. Falte die obere Lage herunter, um einen Flügel zu machen, aber setze die Faltung diesmal ganz nah an der gefalteten Kante an, damit der Flügel breit wird.",
        "harrier.step-08":
          "Dreh das ganze Flugzeug um und sieh dir die andere Seite an. Falte den zweiten Flügel genauso wie den ersten.",
        "harrier.step-09":
          "Stell das Flugzeug mit der Nase nach oben und schau von oben am Rumpf entlang.",
        "harrier.step-10":
          "Nimm die äußerste Kante des oberen Flügels, etwa eine Daumenbreite von der Spitze entfernt, und biege sie nach oben. Hör auf halbem Weg auf. Drücke sie nicht flach.",
        "harrier.step-11":
          "Dreh es um und biege die andere Flügelspitze genauso weit nach oben. Die beiden kleinen Finnen sollten Spiegelbilder voneinander sein.",
        "harrier.step-12":
          "Halte den Rumpf fest und hebe den ganzen oberen Flügel an, bis er fast waagerecht absteht. Die Finne, die du gemacht hast, sollte jetzt an der Spitze aufrecht stehen.",
        "harrier.step-13":
          "Dreh es um und hebe den anderen Flügel genauso an. Von vorne gesehen solltest du zwei breite flache Flügel mit zwei hochgebogenen Spitzen haben.",
      },
      explanations: {
        "harrier.step-01":
          "Die Mittellinie ist das Rückgrat des Flugzeugs. Jede spätere Faltung misst sich an ihr.",
        "harrier.step-02":
          "Du brauchtest nur die Markierung, nicht die Faltung. Kniffen und wieder aufklappen ist die Art, sich eine Hilfslinie zu hinterlassen.",
        "harrier.step-03":
          "Diese Eckfaltungen stapeln Papier vorne, und dieses Gewicht hält die Nase nach vorn gerichtet.",
        "harrier.step-05":
          "Eine flache Front ist langsamer als eine Spitze, und langsam ist genau das, was dieses Flugzeug will. Die Spitze herunterzufalten hält außerdem die Eckklappen davon ab, wieder aufzuspringen.",
        "harrier.step-06":
          "Nach hinten zu falten legt die dicken Kanten nach außen, was dir einen Rücken zum Halten gibt und die Flügel waagerecht hält.",
        "harrier.step-07":
          "Breite Flügel tragen mehr Gewicht bei geringerer Geschwindigkeit. Das ist der ganze Trick hinter einem Flugzeug, das schwebt statt zu schießen.",
        "harrier.step-10":
          "Eine hochgebogene Flügelspitze wirkt an jedem Ende wie ein Ruder. Fängt das Flugzeug an, seitlich wegzurutschen, drücken die Finnen es wieder gerade.",
        "harrier.step-12":
          "Flache Flügel fangen die Luft unter sich ein. Bei so breiten Flügeln gibt schon ein sanfter Wurf dem Flugzeug reichlich, worauf es reiten kann.",
        "harrier.step-13":
          "Beide Flügel müssen gleich sein. Sitzt einer höher als der andere, rollt das Flugzeug in diese Richtung, statt geradeaus zu gleiten.",
      },
      tips: {
        default:
          "Bei diesem Flugzeug kommt alles darauf an, dass die Flügel gleich sind. Immer wenn du eine Seite gefaltet hast, halte sie hoch und vergleiche sie mit der anderen, bevor du festdrückst.",
        "harrier.step-05":
          "Ziele mit der Spitze auf die Stelle, wo sich die beiden schrägen Kanten treffen, und drücke dann.",
        "harrier.step-07":
          "Lass in der Mitte nur einen schmalen Streifen für den Rumpf. Alles andere ist Flügel.",
        "harrier.step-10": "Biegen, nicht falten. Eine flachgedrückte Finne bringt gar nichts.",
        "harrier.step-13":
          "Sieh es dir von vorne an: zwei breite Flügel, zwei kleine aufrechte Finnen.",
      },
    },

    "sea-glider": {
      name: "Der Seegleiter",
      description:
        "Ein langer, ruhiger Gleiter. Statt zuerst die Ecken zu falten, rollst du die Vorderkante zweimal ein, was einen Streifen schweres Papier quer über die Front legt. Dieses Gewicht an der richtigen Stelle lässt ihn eine lange, flache, langsame Linie fliegen, wie eine Möwe über dem Wasser. Er bleibt von allen Flugzeugen im Hangar am längsten oben.",
      throwTip:
        "Halte ihn unter dem Rumpf in der Mitte. Ziele waagerecht oder eine Spur darüber und schiebe ihn gleichmäßig weg, statt ihn zu werfen.",
      titles: {
        "sea-glider.step-01": "Falte es in der Mitte",
        "sea-glider.step-02": "Klapp es wieder auf",
        "sea-glider.step-03": "Rolle die obere Kante herunter",
        "sea-glider.step-04": "Rolle sie noch einmal herunter",
        "sea-glider.step-05": "Hol die rechte Ecke herein",
        "sea-glider.step-06": "Jetzt die linke Ecke",
        "sea-glider.step-07": "Falte das ganze Flugzeug in der Mitte",
        "sea-glider.step-08": "Falte die breiten Flügel herunter",
        "sea-glider.step-09": "Dreh es um",
        "sea-glider.step-10": "Stell es mit der Nase nach oben",
        "sea-glider.step-11": "Klapp den vorderen Flügel auf",
        "sea-glider.step-12": "Klapp den hinteren Flügel auf",
      },
      steps: {
        "sea-glider.step-01":
          "Leg das Papier hochkant hin, wie eine Tür. Falte die rechte Kante auf die linke Kante und streiche mit dem Daumen über den Knick, damit er hält.",
        "sea-glider.step-02":
          "Klapp das Papier wieder flach auf. Du siehst eine Linie in der Mitte, wo du gefaltet hast. Diese Linie ist dein Anhaltspunkt für alles Weitere.",
        "sea-glider.step-03":
          "Falte die ganze obere Kante zu dir herunter, etwa drei Finger breit. Halte die gefaltete Kante parallel zur Oberkante des Blattes und streiche sie flach.",
        "sea-glider.step-04":
          "Falte diesen dicken Streifen noch einmal herunter, wieder genauso weit. Die Front des Papiers ist jetzt drei Lagen dick und deutlich steifer.",
        "sea-glider.step-05":
          "Finde die Mitte der neuen dicken Vorderkante. Falte die obere rechte Ecke nach unten und nach innen, sodass die dicke Kante auf der Mittellinie liegt.",
        "sea-glider.step-06":
          "Mach links dasselbe. Die beiden dicken Kanten treffen sich jetzt in der Mitte, und die Front läuft spitz zu.",
        "sea-glider.step-07":
          "Falte das ganze Flugzeug an der Mittellinie zusammen, aber nach hinten, sodass die Faltungen, die du gerade gemacht hast, außen liegen.",
        "sea-glider.step-08":
          "Leg es auf die Seite. Falte die obere Lage herunter, um einen Flügel zu machen, und setze die Faltung nah an der gefalteten Kante an, damit der Flügel breit wird.",
        "sea-glider.step-09":
          "Dreh das ganze Flugzeug um und sieh dir die andere Seite an. Falte den zweiten Flügel genauso wie den ersten.",
        "sea-glider.step-10":
          "Stell das Flugzeug mit der Nase nach oben und schau von oben am Rumpf entlang.",
        "sea-glider.step-11":
          "Halte den Rumpf fest und hebe den oberen Flügel an, bis er fast waagerecht absteht, wie ein echtes Flugzeug von vorne gesehen.",
        "sea-glider.step-12":
          "Dreh es um und hebe den anderen Flügel genauso an. Zwei lange flache Flügel, nur ganz leicht nach oben gestellt, und du bist fertig.",
      },
      explanations: {
        "sea-glider.step-01":
          "Die Mittellinie ist das Rückgrat des Flugzeugs. Jede spätere Faltung misst sich an ihr.",
        "sea-glider.step-02":
          "Du brauchtest nur die Markierung, nicht die Faltung. Kniffen und wieder aufklappen ist die Art, sich eine Hilfslinie zu hinterlassen.",
        "sea-glider.step-03":
          "Die Kante einzurollen verteilt Gewicht über die ganze Front des Flugzeugs statt an einer Stelle. So verteilt hält es das Flugzeug waagerecht.",
        "sea-glider.step-04":
          "Zwei Rollen machen die Vorderkante nicht nur schwer, sondern auch steif. Eine steife Vorderkante flattert nicht, und ein Flügel, der nicht flattert, gleitet weiter.",
        "sea-glider.step-05":
          "Die schwere Kante nach innen zu falten trägt all dieses Gewicht in die Nase, und genau dort braucht ein Gleiter es.",
        "sea-glider.step-07":
          "Nach hinten zu falten legt die dicken Kanten nach außen, was dir einen Rücken zum Halten gibt und die Flügel waagerecht hält.",
        "sea-glider.step-08":
          "Lange breite Flügel und ein leichtes Heck sind das Rezept für einen langsamen flachen Gleitflug. Schmale Flügel würden dieses Flugzeug abtauchen lassen.",
        "sea-glider.step-11":
          "Flache Flügel fangen die Luft unter sich ein, und hier ist eine Menge Flügel, um sie einzufangen.",
        "sea-glider.step-12":
          "Beide Flügel müssen gleich sein. Sitzt einer höher als der andere, rollt das Flugzeug in diese Richtung, statt geradeaus zu gleiten.",
      },
      tips: {
        default:
          "Jede Faltung an diesem Flugzeug wird an der vorherigen gemessen, also zeigt sich eine schiefe Rolle am Anfang am Ende als schiefes Flugzeug.",
        "sea-glider.step-03":
          "Richte beide oberen Ecken aus, bevor du drückst, sonst hängt das ganze Flugzeug schief.",
        "sea-glider.step-04": "Falte den Streifen über sich selbst, nicht das ganze Blatt.",
        "sea-glider.step-08":
          "Lass in der Mitte nur einen schmalen Streifen für den Rumpf. Alles andere ist Flügel.",
        "sea-glider.step-12":
          "Wenn er beim Werfen abtaucht, biege die hintersten Flügelkanten ein wenig nach oben.",
      },
    },

    hammer: {
      name: "Der Hammer",
      description:
        "Das Schwergewicht. Du rollst die Front des Papiers zweimal auf sich selbst zurück, bevor du die Nase machst, sodass die fertige Spitze sechs oder mehr Lagen in sich packt. All dieses Gewicht vorne lässt ihn durch die Luft stoßen und sehr weit fliegen. Er ist das am schwersten sauber zu faltende Flugzeug hier und das befriedigendste zu werfen.",
      throwTip:
        "Klemme die dicke Nase von unten zwischen die Finger und wirf ihn kräftig, schnell und leicht nach oben. Das ist das eine Flugzeug, das deine volle Kraft will.",
      titles: {
        "hammer.step-01": "Falte es in der Mitte",
        "hammer.step-02": "Klapp es wieder auf",
        "hammer.step-03": "Hol die rechte Ecke herein",
        "hammer.step-04": "Jetzt die linke Ecke",
        "hammer.step-05": "Rolle die Spitze zurück",
        "hammer.step-06": "Rolle sie noch einmal zurück",
        "hammer.step-07": "Falte die rechte Ecke zur Mitte",
        "hammer.step-08": "Jetzt die linke Ecke",
        "hammer.step-09": "Falte das ganze Flugzeug in der Mitte",
        "hammer.step-10": "Falte die Flügel herunter",
        "hammer.step-11": "Dreh es um",
        "hammer.step-12": "Stell es mit der Nase nach oben",
        "hammer.step-13": "Klapp den vorderen Flügel auf",
        "hammer.step-14": "Klapp den hinteren Flügel auf",
      },
      steps: {
        "hammer.step-01":
          "Leg das Papier hochkant hin, wie eine Tür. Falte die rechte Kante auf die linke Kante und streiche mit dem Daumen über den Knick, damit er hält.",
        "hammer.step-02":
          "Klapp das Papier wieder flach auf. Du siehst eine Linie in der Mitte, wo du gefaltet hast. Diese Linie ist dein Anhaltspunkt für alles Weitere.",
        "hammer.step-03":
          "Nimm die obere rechte Ecke und falte sie nach unten und nach innen, sodass ihre obere Kante genau auf der Mittellinie liegt. Streiche sie glatt.",
        "hammer.step-04":
          "Mach links genau dasselbe. Der obere Teil des Papiers sieht jetzt wie ein spitzes Dach aus.",
        "hammer.step-05":
          "Falte die Spitze gerade nach unten über das Flugzeug, sodass sie dort landet, wo die beiden Eckfaltungen aufhörten. Die Front ist jetzt eine flache Kante.",
        "hammer.step-06":
          "Falte diese flache Front noch einmal herunter, diesmal ein Stück weniger weit. Die Vorderkante wird breiter und viel dicker. Drücke sie fest.",
        "hammer.step-07":
          "Finde die Mitte der dicken Vorderkante. Falte die rechte Ecke dieser Kante nach unten und nach innen, bis die Kante auf der Mittellinie liegt.",
        "hammer.step-08":
          "Mach dasselbe mit der linken Ecke. Eine neue Spitze entsteht, und das ganze aufgerollte Papier steckt jetzt darin.",
        "hammer.step-09":
          "Falte das ganze Flugzeug an der Mittellinie zusammen, aber nach hinten, sodass alles, was du gerade gefaltet hast, außen liegt.",
        "hammer.step-10":
          "Leg es auf die Seite. Falte die obere Lage herunter, um einen Flügel zu machen, von der Nase aus bis nach hinten zum Heck.",
        "hammer.step-11":
          "Dreh das ganze Flugzeug um und sieh dir die andere Seite an. Falte den zweiten Flügel genauso wie den ersten.",
        "hammer.step-12":
          "Stell das Flugzeug mit der Nase nach oben und schau von oben am Rumpf entlang. Die Nase sollte ein fester Block sein, den du zwischen die Finger nehmen kannst.",
        "hammer.step-13":
          "Halte den Rumpf fest und hebe den oberen Flügel an, bis er waagerecht absteht, wie ein echtes Flugzeug von vorne gesehen.",
        "hammer.step-14":
          "Dreh es um und hebe den anderen Flügel genauso an. Halte diese Flügel flacher als bei den Gleitern. Das ist ein Hammer.",
      },
      explanations: {
        "hammer.step-01":
          "Die Mittellinie ist das Rückgrat des Flugzeugs. Jede spätere Faltung misst sich an ihr.",
        "hammer.step-02":
          "Du brauchtest nur die Markierung, nicht die Faltung. Kniffen und wieder aufklappen ist die Art, sich eine Hilfslinie zu hinterlassen.",
        "hammer.step-03":
          "Diese Eckfaltungen sind die erste Ladung Papier auf dem Weg zur Nase. Alles danach stapelt noch mehr obendrauf.",
        "hammer.step-05":
          "Die Spitze zurückzurollen statt sie zu schärfen verdoppelt das Papier vorne. Du baust Gewicht, keinen Dorn.",
        "hammer.step-06":
          "Jede Rolle faltet ein Band, das schon mehrere Lagen dick ist. Zwei Rollen sind alles, wofür Papier noch flach liegen bleibt.",
        "hammer.step-07":
          "Das zieht die ganze aufgerollte Stange in die Spitze hinein. Genau das macht die Nase so viel schwerer als das Heck.",
        "hammer.step-09":
          "Nach hinten zu falten legt die dicken Kanten nach außen, was dir einen Rücken zum Halten gibt und die Flügel waagerecht hält.",
        "hammer.step-10":
          "Schmalere Flügel bedeuten weniger Luft, die dagegendrückt, also hält ein schweres Flugzeug seine Geschwindigkeit und kommt weiter, bevor es landet.",
        "hammer.step-13":
          "Ein schnelles schweres Flugzeug braucht weniger Auftrieb, nicht mehr, deshalb sitzen diese Flügel flacher als bei einem Gleiter.",
        "hammer.step-14":
          "Beide Flügel müssen gleich sein. Bei dieser Geschwindigkeit schickt schon ein kleiner Unterschied das Flugzeug in eine Kurve.",
      },
      tips: {
        default:
          "Streiche jede Faltung mit dem Daumennagel nach und zieh sie dann über die Tischkante. Dicke Faltungen springen wieder auf, wenn du sie nicht richtig kniffst.",
        "hammer.step-05":
          "Lass dir Zeit. Landet die Spitze schief, wird jede Faltung danach auch schief.",
        "hammer.step-06":
          "Drücke diese hier mit etwas Hartem flach, zum Beispiel mit dem Rücken eines Löffels.",
        "hammer.step-07":
          "Sechs Lagen sind viel. Falte langsam und halte das Papier dabei fest.",
        "hammer.step-14":
          "Peile über die Nase: die Flügel sollten fast waagerecht aussehen, nicht wie ein tiefes V.",
      },
    },

    "square-cruiser": {
      name: "Der Quadrat-Kreuzer",
      description:
        "Das einzige Flugzeug hier, das von einem Quadrat ausgeht, also besteht das Erste, was du tust, darin, eines herzustellen. Ein Quadrat gibt dir kurze breite Flügel und einen gedrungenen Rumpf, und das ergibt einen ruhigen, gemächlichen Flieger. Er zieht ohne viel Aufhebens geradeaus durch ein Zimmer.",
      throwTip:
        "Halte ihn unter dem Rumpf hinter der Nase und wirf ihn waagerecht mit mittlerem Schub. Er will keine Geschwindigkeit, er will einen ruhigen Abwurf.",
      titles: {
        "square-cruiser.prep.letter-01": "Falte eine Ecke um",
        "square-cruiser.prep.letter-02": "Klapp es wieder auf",
        "square-cruiser.prep.letter-03": "Schneide den Streifen ab",
        "square-cruiser.prep.a4-01": "Falte eine Ecke um",
        "square-cruiser.prep.a4-02": "Klapp es wieder auf",
        "square-cruiser.prep.a4-03": "Schneide den Streifen ab",
        "square-cruiser.prep.index-01": "Falte eine Ecke um",
        "square-cruiser.prep.index-02": "Klapp es wieder auf",
        "square-cruiser.prep.index-03": "Schneide den Streifen ab",
        "square-cruiser.step-01": "Falte es in der Mitte",
        "square-cruiser.step-02": "Klapp es wieder auf",
        "square-cruiser.step-03": "Hol die rechte Ecke herein",
        "square-cruiser.step-04": "Jetzt die linke Ecke",
        "square-cruiser.step-05": "Falte die Spitze flach herunter",
        "square-cruiser.step-06": "Falte die rechte Ecke zur Mitte",
        "square-cruiser.step-07": "Jetzt die linke Ecke",
        "square-cruiser.step-08": "Falte das ganze Flugzeug in der Mitte",
        "square-cruiser.step-09": "Falte die Flügel herunter",
        "square-cruiser.step-10": "Dreh es um",
        "square-cruiser.step-11": "Stell es mit der Nase nach oben",
        "square-cruiser.step-12": "Klapp den vorderen Flügel auf",
        "square-cruiser.step-13": "Klapp den hinteren Flügel auf",
      },
      steps: {
        "square-cruiser.prep.letter-01":
          "Leg das Blatt hochkant hin. Falte die obere linke Ecke herüber und herunter, bis die obere Kante genau auf der rechten Kante liegt. Streiche die Faltung flach.",
        "square-cruiser.prep.letter-02":
          "Klapp das Papier wieder auf. Die Faltung hat eine Linie quer über das Blatt hinterlassen. Alles oberhalb dieser Linie ist ein perfektes Quadrat.",
        "square-cruiser.prep.letter-03":
          "Schneide entlang der Linie und behalte das Quadrat. Leg den übrigen Streifen beiseite, du brauchst ihn nicht.",
        "square-cruiser.prep.a4-01":
          "Leg das Blatt hochkant hin. Falte die obere linke Ecke herüber und herunter, bis die obere Kante genau auf der rechten Kante liegt. Streiche die Faltung flach.",
        "square-cruiser.prep.a4-02":
          "Klapp das Papier wieder auf. Die Faltung hat eine Linie quer über das Blatt hinterlassen. Alles oberhalb dieser Linie ist ein perfektes Quadrat.",
        "square-cruiser.prep.a4-03":
          "Schneide entlang der Linie und behalte das Quadrat. Leg den übrigen Streifen beiseite, du brauchst ihn nicht.",
        "square-cruiser.prep.index-01":
          "Leg die Karte hochkant hin. Falte die obere linke Ecke herüber und herunter, bis die obere Kante genau auf der rechten Kante liegt. Streiche die Faltung flach.",
        "square-cruiser.prep.index-02":
          "Klapp die Karte wieder auf. Die Faltung hat eine Linie quer über sie hinterlassen. Alles oberhalb dieser Linie ist ein perfektes Quadrat.",
        "square-cruiser.prep.index-03":
          "Schneide entlang der Linie und behalte das Quadrat. Es ist ein kleines steifes Quadrat, also erwarte ein kleines Flugzeug, das nicht sehr weit gleitet.",
        "square-cruiser.step-01":
          "Leg das Quadrat vor dich hin. Falte die rechte Kante auf die linke Kante, streiche über den Knick, und du hast deine Mittellinie.",
        "square-cruiser.step-02":
          "Klapp es wieder flach auf. Die Linie in der Mitte ist dein Anhaltspunkt für alles Weitere.",
        "square-cruiser.step-03":
          "Falte die obere rechte Ecke nach unten und nach innen, sodass die obere Kante auf der Mittellinie liegt. Bei einem Quadrat reicht diese Ecke genau bis zur Mitte des Blattes.",
        "square-cruiser.step-04":
          "Mach links dasselbe. Die obere Hälfte des Quadrats ist jetzt ein großes Dreieck, das auf der unteren Hälfte sitzt.",
        "square-cruiser.step-05":
          "Falte die Spitze dieses Dreiecks gerade nach unten, sodass sie in der Mitte des Quadrats landet. Die Front wird flach und breit.",
        "square-cruiser.step-06":
          "Falte die rechte Ecke der neuen flachen Front nach unten und nach innen bis zur Mittellinie, sodass über der Klappe, die du gerade gefaltet hast, eine neue Spitze entsteht.",
        "square-cruiser.step-07":
          "Mach links dasselbe. Die beiden Ecken treffen sich in der Mitte und halten die Klappe darunter fest.",
        "square-cruiser.step-08":
          "Falte das ganze Flugzeug an der Mittellinie zusammen, aber nach hinten, sodass alles, was du gerade gefaltet hast, außen liegt.",
        "square-cruiser.step-09":
          "Leg es auf die Seite. Falte die obere Lage herunter, um einen Flügel zu machen, von der Nase aus bis nach hinten zum Heck.",
        "square-cruiser.step-10":
          "Dreh das ganze Flugzeug um und sieh dir die andere Seite an. Falte den zweiten Flügel genauso wie den ersten.",
        "square-cruiser.step-11":
          "Stell das Flugzeug mit der Nase nach oben und schau von oben am Rumpf entlang.",
        "square-cruiser.step-12":
          "Halte den Rumpf fest und hebe den oberen Flügel an, bis er fast waagerecht absteht, wie ein echtes Flugzeug von vorne gesehen.",
        "square-cruiser.step-13":
          "Dreh es um und hebe den anderen Flügel genauso an. Kurze, breite, waagerechte Flügel, und der Kreuzer ist fertig.",
      },
      explanations: {
        "square-cruiser.prep.letter-01":
          "Eine Kante auf die Kante daneben zu falten ist die Art, ein Quadrat ohne Lineal zu finden. Die Faltung misst für dich.",
        "square-cruiser.prep.letter-03":
          "Ein Quadrat ergibt kurze breite Flügel. Fängst du mit einem langen Blatt an, bekommst du ein völlig anderes Flugzeug.",
        "square-cruiser.prep.a4-01":
          "Eine Kante auf die Kante daneben zu falten ist die Art, ein Quadrat ohne Lineal zu finden. Die Faltung misst für dich.",
        "square-cruiser.prep.a4-03":
          "Ein Quadrat ergibt kurze breite Flügel. Fängst du mit einem langen Blatt an, bekommst du ein völlig anderes Flugzeug.",
        "square-cruiser.prep.index-01":
          "Eine Kante auf die Kante daneben zu falten ist die Art, ein Quadrat ohne Lineal zu finden. Die Faltung misst für dich.",
        "square-cruiser.prep.index-03":
          "Ein Quadrat ergibt kurze breite Flügel. Fängst du mit einem langen Blatt an, bekommst du ein völlig anderes Flugzeug.",
        "square-cruiser.step-01":
          "Die Mittellinie ist das Rückgrat des Flugzeugs. Jede spätere Faltung misst sich an ihr.",
        "square-cruiser.step-02":
          "Du brauchtest nur die Markierung, nicht die Faltung. Kniffen und wieder aufklappen ist die Art, sich eine Hilfslinie zu hinterlassen.",
        "square-cruiser.step-03":
          "Bei einem Quadrat sind diese Eckfaltungen riesig, sodass das halbe Blatt vorne doppelt liegt. Daher kommt das Gewicht des Flugzeugs.",
        "square-cruiser.step-05":
          "Die Spitze flach zu falten macht die Nase stumpf und hält sie davon ab, bei jeder Landung in den Boden zu stechen.",
        "square-cruiser.step-06":
          "Diese beiden Ecken verriegeln die Klappe darunter, damit die Nase in der Luft nicht aufspringen kann.",
        "square-cruiser.step-08":
          "Nach hinten zu falten legt die dicken Kanten nach außen, was dir einen Rücken zum Halten gibt und die Flügel waagerecht hält.",
        "square-cruiser.step-09":
          "Ein quadratisches Blatt ist kurz für seine Breite, also werden diese Flügel breit und gedrungen. Genau das macht den Kreuzer so ruhig.",
        "square-cruiser.step-12":
          "Flache Flügel fangen die Luft unter sich ein. Kurze Flügel müssen waagerecht sein, damit sie funktionieren.",
        "square-cruiser.step-13":
          "Beide Flügel müssen gleich sein. Sitzt einer höher als der andere, rollt das Flugzeug in diese Richtung, statt geradeaus zu ziehen.",
      },
      tips: {
        default:
          "Alles an diesem Flugzeug wird von der Mittellinie und den Ecken aus gemessen, also funktioniert es mit jeder Größe von Quadrat, die du herstellen kannst.",
        "square-cruiser.prep.a4-01":
          "Schiebe die Ecke hin und her, bis die obere Kante genau auf der Seitenkante sitzt, und drücke dann.",
        "square-cruiser.prep.a4-03":
          "Frag eine erwachsene Person, bevor du eine Schere benutzt, und schneide auf dem Knick, nicht daneben.",
        "square-cruiser.prep.letter-03":
          "Frag eine erwachsene Person, bevor du eine Schere benutzt, und schneide auf dem Knick, nicht daneben.",
        "square-cruiser.prep.index-03":
          "Druckerpapier funktioniert hier besser als Karton. Karton ist steif und hält die Faltungen an der Nase nicht.",
        "square-cruiser.step-03":
          "Die Ecke sollte genau in der Mitte des Quadrats landen. Nimm das als Kontrolle.",
        "square-cruiser.step-06":
          "Lass die Klappe darunter in Ruhe. Nur die beiden neuen Ecken bewegen sich.",
        "square-cruiser.step-13": "Peile über die Nase: zwei kurze Flügel, fast waagerecht.",
      },
    },
  },
  glossary: {
    "valley-fold": {
      term: "Talfaltung",
      definition:
        "Eine Faltung, deren Knick nach unten geht wie ein Tal. Das Papier klappt zu dir hin.",
    },
    "mountain-fold": {
      term: "Bergfaltung",
      definition:
        "Das Gegenteil einer Talfaltung: der Knick zeigt nach oben wie ein Berg, und das Papier klappt von dir weg.",
    },
    crease: {
      term: "Kniff",
      definition:
        "Die scharfe Linie, die zurückbleibt, nachdem du Papier gefaltet und flach gestrichen hast.",
    },
    "center-line": {
      term: "Mittellinie",
      definition:
        "Der Kniff, der mitten durch das Papier läuft und dir als Anhaltspunkt für die anderen Faltungen dient.",
    },
    "blunt-nose": {
      term: "Stumpfe Nase",
      definition:
        "Eine Nase, die entsteht, indem man die scharfe Spitze auf sich selbst zurückfaltet, sodass die Front des Flugzeugs flach und dick ist statt spitz.",
    },
    hem: {
      term: "Saum",
      definition:
        "Ein Streifen, der entlang einer geraden Kante umgefaltet ist, wie der Saum eines Hemdes. Rolle ihn zweimal, und diese Kante wird dick und schwer.",
    },
    "partial-fold": {
      term: "Halbe Faltung",
      definition:
        "Eine Faltung, die du auf halbem Weg anhältst, sodass das Papier sich biegt und schräg stehen bleibt, statt flach zu liegen.",
    },
    "tip-fin": {
      term: "Randfinne",
      definition:
        "Ein kleines Stück am Ende eines Flügels, das nach oben gebogen ist. Es hält das Flugzeug davon ab, seitlich durch die Luft zu rutschen.",
    },
    "square-from-rectangle": {
      term: "Ein Quadrat machen",
      definition:
        "Falte eine Kante des Blattes auf die Kante daneben. Die Faltung markiert das größte Quadrat, das in das Blatt passt, fertig zum Ausschneiden.",
    },
  },
};

export default planes;
export { planes };
