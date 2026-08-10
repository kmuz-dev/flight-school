/**
 * French plane prose. Translated from planes/en.ts key for key.
 *
 * Writing bar (PRD §2): a sharp 10-year-old follows every instruction alone.
 * "Left" and "right" are places on the table, not reading order, so they are
 * translated literally and never swapped.
 */
import type { PlanesDictionary } from "../types";

const planes: PlanesDictionary = {
  planes: {
    dart: {
      name: "La Flèche",
      description:
        "Le grand classique. Douze plis, un nez pointu et un vol droit et rapide. Si tu n'as plié qu'un seul avion en papier dans ta vie, il ressemblait sûrement à celui-là.",
      throwTip:
        "Tiens-le par en dessous, près du nez. Vise un peu vers le haut et lance-le vite et bien à plat. S'il plonge, relève un peu les bords arrière des ailes.",
      titles: {
        "dart.step-01": "Plie-le en deux",
        "dart.step-02": "Rouvre-le",
        "dart.step-03": "Rentre le coin droit",
        "dart.step-04": "Maintenant le coin gauche",
        "dart.step-05": "Replie le côté droit",
        "dart.step-06": "Et le côté gauche",
        "dart.step-07": "Plie tout l'avion en deux",
        "dart.step-08": "Rabats les ailes",
        "dart.step-09": "Retourne-le",
        "dart.step-10": "Mets-le nez en l'air",
        "dart.step-11": "Ouvre l'aile de devant",
        "dart.step-12": "Ouvre l'aile du fond",
      },
      steps: {
        "dart.step-01":
          "Pose la feuille debout, comme une porte. Rabats le bord droit sur le bord gauche, puis appuie le long du pli avec le pouce pour qu'il tienne.",
        "dart.step-02":
          "Rouvre la feuille à plat. Tu vois une ligne au milieu, là où tu as plié. Cette ligne est ton repère pour tout le reste.",
        "dart.step-03":
          "Prends le coin en haut à droite et rabats-le vers le bas et vers l'intérieur, pour que son bord du haut se pose pile sur la ligne du milieu. Appuie bien.",
        "dart.step-04":
          "Fais exactement pareil à gauche : le coin en haut à gauche vers le bas et vers l'intérieur, jusqu'à ce que son bord touche la ligne du milieu. Le haut doit maintenant ressembler à un toit pointu.",
        "dart.step-05":
          "Replie tout le bord penché de droite, pour qu'il se pose lui aussi sur la ligne du milieu. Le nez devient plus fin et plus pointu.",
        "dart.step-06":
          "Pareil à gauche. Les deux bords penchés se rejoignent au milieu, et la feuille est longue et étroite avec une pointe en haut.",
        "dart.step-07":
          "Plie tout l'avion en deux le long de la ligne du milieu, mais cette fois vers l'arrière, pour que tous les plis que tu viens de faire se retrouvent à l'extérieur.",
        "dart.step-08":
          "Couche-le sur le côté. Rabats la couche du dessus pour faire une aile, en partant du nez et en allant vers l'arrière. Appuie fort le long du pli.",
        "dart.step-09":
          "Retourne tout l'avion pour regarder l'autre côté. Vérifie que ça correspond.",
        "dart.step-10":
          "Mets l'avion nez en l'air et regarde bien droit dans l'axe du corps. Les deux ailes doivent être pareilles.",
        "dart.step-11":
          "Tiens le corps et relève l'aile du dessus jusqu'à ce qu'elle sorte bien à plat, comme un vrai avion vu de face.",
        "dart.step-12":
          "Retourne-le et fais pareil avec l'autre aile. Les deux ailes doivent maintenant sortir bien à plat, en formant un V très ouvert. Voilà une Flèche.",
      },
      why: {
        "dart.step-01":
          "La ligne du milieu est la colonne vertébrale de l'avion. Tous les plis suivants se mesurent par rapport à elle.",
        "dart.step-02":
          "Tu avais juste besoin de la marque, pas du pli. Marquer puis rouvrir, c'est comme ça qu'on se laisse un repère.",
        "dart.step-03":
          "Ces plis de coins entassent du papier dans le nez. Un nez lourd, c'est ce qui garde l'avion pointé vers l'avant au lieu de partir en tonneau.",
        "dart.step-05":
          "Replier les côtés rend le nez plus pointu et plus lourd, pour que l'avion perce l'air au lieu de le prendre de plein fouet.",
        "dart.step-07":
          "Plier vers l'arrière met les bords épais à l'extérieur, ce qui te donne une arête à tenir et garde les ailes bien à plat.",
        "dart.step-08":
          "Les ailes sont ce qui porte l'avion. Faire les deux plis exactement au même endroit, c'est ce qui le fait voler droit au lieu de virer.",
        "dart.step-11":
          "Les ailes à plat attrapent l'air par en dessous. Si tu les laisses fermées, l'avion n'a rien pour se porter et il tombe.",
        "dart.step-12":
          "Les deux ailes doivent être identiques. Si l'une est plus haute que l'autre, l'avion penche de ce côté au lieu de voler droit.",
      },
      tips: {
        default: "Appuie sur chaque pli avec l'ongle. Les plis nets volent mieux que les plis mous.",
        "dart.step-01": "Aligne bien les coins avant d'appuyer.",
        "dart.step-03":
          "Prends ton temps pour aligner le bord. Un coin de travers ici donne un vol qui tourne plus tard.",
        "dart.step-08":
          "Plie les deux ailes à la même distance du milieu, sinon l'avion va virer.",
        "dart.step-11": "Des ailes bien droites et bien à plat, vues de face : c'est ça qu'on veut.",
        "dart.step-12": "Vise dans l'axe du nez : les deux ailes doivent faire un V très ouvert.",
      },
    },

    bulldog: {
      name: "La Flèche Bulldog",
      description:
        "Une Flèche dont la pointe est repliée sur elle-même. Ça lui donne un nez court, épais et lourd au lieu d'une aiguille. Elle est plus lente qu'une Flèche mais beaucoup plus solide : elle ne se froisse pas quand elle tape un mur, et elle vole droit même si tes plis sont un peu de travers.",
      throwTip:
        "Attrape le gros nez par en dessous et lance-le fort et bien à plat, droit devant. Il ne craint pas les lancers brutaux.",
      titles: {
        "bulldog.step-01": "Plie-le en deux",
        "bulldog.step-02": "Rouvre-le",
        "bulldog.step-03": "Rentre le coin droit",
        "bulldog.step-04": "Maintenant le coin gauche",
        "bulldog.step-05": "Replie le côté droit",
        "bulldog.step-06": "Et le côté gauche",
        "bulldog.step-07": "Rabats la pointe",
        "bulldog.step-08": "Plie tout l'avion en deux",
        "bulldog.step-09": "Rabats les ailes",
        "bulldog.step-10": "Retourne-le",
        "bulldog.step-11": "Mets-le nez en l'air",
        "bulldog.step-12": "Ouvre l'aile de devant",
        "bulldog.step-13": "Ouvre l'aile du fond",
      },
      steps: {
        "bulldog.step-01":
          "Pose la feuille debout, comme une porte. Rabats le bord droit sur le bord gauche, puis appuie le long du pli avec le pouce pour qu'il tienne.",
        "bulldog.step-02":
          "Rouvre la feuille à plat. Tu vois une ligne au milieu, là où tu as plié. Cette ligne est ton repère pour tout le reste.",
        "bulldog.step-03":
          "Prends le coin en haut à droite et rabats-le vers le bas et vers l'intérieur, pour que son bord du haut se pose pile sur la ligne du milieu. Appuie bien.",
        "bulldog.step-04":
          "Fais exactement pareil à gauche : le coin en haut à gauche vers le bas et vers l'intérieur, jusqu'à ce que son bord touche la ligne du milieu. Le haut ressemble maintenant à un toit pointu.",
        "bulldog.step-05":
          "Replie tout le bord penché de droite, pour qu'il se pose lui aussi sur la ligne du milieu. Le nez devient plus fin et plus pointu.",
        "bulldog.step-06":
          "Pareil à gauche. Les deux bords penchés se rejoignent au milieu, et tu as une forme longue et étroite avec une pointe en haut.",
        "bulldog.step-07":
          "Maintenant rabats cette pointe vers le bas, par-dessus l'avion. Descends le bout jusqu'à l'endroit où s'arrêtaient tes deux premiers plis de coins.",
        "bulldog.step-08":
          "Plie tout l'avion en deux le long de la ligne du milieu, mais vers l'arrière, pour que tous les plis que tu viens de faire se retrouvent à l'extérieur.",
        "bulldog.step-09":
          "Couche-le sur le côté. Rabats la couche du dessus pour faire une aile, en partant du nez épais et en allant jusqu'à la queue.",
        "bulldog.step-10":
          "Retourne tout l'avion pour regarder l'autre côté. Vérifie que la deuxième aile est pareille que la première.",
        "bulldog.step-11": "Mets l'avion nez en l'air et regarde bien droit dans l'axe du corps.",
        "bulldog.step-12":
          "Tiens le corps et relève l'aile du dessus jusqu'à ce qu'elle sorte presque à plat, comme un vrai avion vu de face.",
        "bulldog.step-13":
          "Retourne-le et fais pareil avec l'autre aile. Les deux ailes doivent sortir bien à plat, juste un tout petit peu relevées. Voilà un Bulldog.",
      },
      why: {
        "bulldog.step-01":
          "La ligne du milieu est la colonne vertébrale de l'avion. Tous les plis suivants se mesurent par rapport à elle.",
        "bulldog.step-02":
          "Tu avais juste besoin de la marque, pas du pli. Marquer puis rouvrir, c'est comme ça qu'on se laisse un repère.",
        "bulldog.step-03":
          "Ces plis de coins entassent du papier à l'avant. Le poids à l'avant, c'est ce qui garde l'avion pointé vers l'avant au lieu de partir en tonneau.",
        "bulldog.step-05":
          "Replier les côtés double encore le papier à l'avant. Jusqu'ici, c'est exactement une Flèche.",
        "bulldog.step-07":
          "C'est le pli qui en fait un Bulldog. Tout ce papier pointu revient se ranger en un bloc court et épais à l'avant.",
        "bulldog.step-08":
          "Plier vers l'arrière met les bords épais à l'extérieur, ce qui te donne une arête à tenir et garde les ailes bien à plat.",
        "bulldog.step-09":
          "Les ailes sont ce qui porte l'avion. Faire les deux plis exactement au même endroit, c'est ce qui le fait voler droit au lieu de virer.",
        "bulldog.step-12":
          "Un nez épais pousse plus d'air sur le côté, donc cet avion vole plus lentement. Les ailes à plat lui donnent quand même assez de portance pour continuer.",
        "bulldog.step-13":
          "Les deux ailes doivent être identiques. Si l'une est plus haute que l'autre, l'avion penche de ce côté au lieu de voler droit.",
      },
      tips: {
        default:
          "Appuie sur chaque pli avec l'ongle. Cet avion pardonne le pliage bâclé mieux que tous les autres, mais des plis nets volent quand même plus loin.",
        "bulldog.step-05":
          "Ici le papier fait quatre épaisseurs. Appuie le long du pli, pas dessus.",
        "bulldog.step-07":
          "Rabats-la par-dessus le devant, pas en dessous. Le bloc épais va à l'extérieur.",
        "bulldog.step-09":
          "Plie les deux ailes à la même distance du milieu, sinon l'avion va virer.",
        "bulldog.step-13": "Vise dans l'axe du nez : les deux ailes doivent paraître presque à plat.",
      },
    },

    harrier: {
      name: "Le Harrier",
      description:
        "Un grand planeur lent. Ses ailes sont presque aussi larges que la feuille et son nez est aplati au lieu d'être pointu, alors il flotte au lieu de foncer. Les petites ailettes au bout des ailes l'empêchent de partir sur le côté. Lancé doucement, il traverse une pièce en dérivant et se pose en douceur.",
      throwTip:
        "Tiens-le sous le corps, juste derrière le nez. Vise un peu vers le haut et lâche-le doucement. Lance-le fort et il montera, décrochera et s'écrasera.",
      titles: {
        "harrier.step-01": "Plie-le en deux",
        "harrier.step-02": "Rouvre-le",
        "harrier.step-03": "Rentre le coin droit",
        "harrier.step-04": "Maintenant le coin gauche",
        "harrier.step-05": "Aplatis la pointe",
        "harrier.step-06": "Plie tout l'avion en deux",
        "harrier.step-07": "Rabats les grandes ailes",
        "harrier.step-08": "Retourne-le",
        "harrier.step-09": "Mets-le nez en l'air",
        "harrier.step-10": "Relève le bout de l'aile de devant",
        "harrier.step-11": "Relève le bout de l'aile du fond",
        "harrier.step-12": "Ouvre l'aile de devant",
        "harrier.step-13": "Ouvre l'aile du fond",
      },
      steps: {
        "harrier.step-01":
          "Pose la feuille debout, comme une porte. Rabats le bord droit sur le bord gauche, puis appuie le long du pli avec le pouce pour qu'il tienne.",
        "harrier.step-02":
          "Rouvre la feuille à plat. Tu vois une ligne au milieu, là où tu as plié. Cette ligne est ton repère pour tout le reste.",
        "harrier.step-03":
          "Prends le coin en haut à droite et rabats-le vers le bas et vers l'intérieur, pour que son bord du haut se pose pile sur la ligne du milieu. Appuie bien.",
        "harrier.step-04":
          "Fais exactement pareil à gauche : le coin en haut à gauche vers le bas et vers l'intérieur, jusqu'à ce que son bord touche la ligne du milieu. Le haut ressemble maintenant à un toit pointu.",
        "harrier.step-05":
          "Ne rends pas la pointe plus fine. Rabats-la plutôt tout droit vers le bas, pour que le bout atterrisse là où s'arrêtaient les deux plis de coins. L'avant devient plat et large.",
        "harrier.step-06":
          "Plie tout l'avion en deux le long de la ligne du milieu, mais vers l'arrière, pour que les plis que tu viens de faire se retrouvent à l'extérieur.",
        "harrier.step-07":
          "Couche-le sur le côté. Rabats la couche du dessus pour faire une aile, mais cette fois commence le pli tout près du bord plié, pour que l'aile sorte très large.",
        "harrier.step-08":
          "Retourne tout l'avion pour regarder l'autre côté. Plie la deuxième aile pareil que la première.",
        "harrier.step-09": "Mets l'avion nez en l'air et regarde bien droit dans l'axe du corps.",
        "harrier.step-10":
          "Prends le bord tout extérieur de l'aile du dessus, à peu près à un pouce du bout, et relève-le. Arrête-toi à mi-chemin. Ne l'écrase pas.",
        "harrier.step-11":
          "Retourne-le et relève l'autre bout d'aile pareil. Les deux petites ailettes doivent être le miroir l'une de l'autre.",
        "harrier.step-12":
          "Tiens le corps et relève toute l'aile du dessus jusqu'à ce qu'elle sorte presque à plat. L'ailette que tu as faite doit maintenant se dresser au bout.",
        "harrier.step-13":
          "Retourne-le et relève l'autre aile pareil. Vu de face, tu dois avoir deux grandes ailes plates avec deux bouts relevés.",
      },
      why: {
        "harrier.step-01":
          "La ligne du milieu est la colonne vertébrale de l'avion. Tous les plis suivants se mesurent par rapport à elle.",
        "harrier.step-02":
          "Tu avais juste besoin de la marque, pas du pli. Marquer puis rouvrir, c'est comme ça qu'on se laisse un repère.",
        "harrier.step-03":
          "Ces plis de coins entassent du papier à l'avant, et c'est ce poids qui garde le nez pointé vers l'avant.",
        "harrier.step-05":
          "Un avant plat est plus lent qu'une pointe, et c'est justement la lenteur que veut cet avion. Rabattre le bout empêche aussi les rabats des coins de s'ouvrir tout seuls.",
        "harrier.step-06":
          "Plier vers l'arrière met les bords épais à l'extérieur, ce qui te donne une arête à tenir et garde les ailes bien à plat.",
        "harrier.step-07":
          "Des ailes larges portent plus de poids à plus faible vitesse. C'est tout le secret d'un avion qui flotte au lieu de foncer.",
        "harrier.step-10":
          "Un bout d'aile relevé fait office de gouvernail à chaque extrémité. Si l'avion se met à glisser de côté, les ailettes le remettent droit.",
        "harrier.step-12":
          "Les ailes à plat attrapent l'air par en dessous. Avec des ailes aussi larges, même un lancer tout doux lui donne de quoi se porter.",
        "harrier.step-13":
          "Les deux ailes doivent être identiques. Si l'une est plus haute que l'autre, l'avion penche de ce côté au lieu de planer droit.",
      },
      tips: {
        default:
          "Sur cet avion, tout dépend de deux ailes parfaitement identiques. Chaque fois que tu plies un côté, lève-le et compare avec l'autre avant d'appuyer.",
        "harrier.step-05":
          "Vise le bout à l'endroit où les deux bords penchés se rejoignent, puis appuie.",
        "harrier.step-07":
          "Ne laisse qu'une bande étroite au milieu pour le corps. Tout le reste, c'est de l'aile.",
        "harrier.step-10": "Courbe, ne plie pas. Une ailette écrasée ne sert à rien.",
        "harrier.step-13": "Regarde-le de face : deux grandes ailes, deux petites ailettes dressées.",
      },
    },

    "sea-glider": {
      name: "Le Planeur Marin",
      description:
        "Un planeur long et tranquille. Au lieu de plier les coins d'abord, tu roules le bord avant deux fois, ce qui met une bande de papier lourd juste à l'avant. Ce poids au bon endroit lui fait suivre une longue ligne plate et lente, comme une mouette au-dessus de l'eau. C'est celui qui reste le plus longtemps en l'air de tout le hangar.",
      throwTip:
        "Tiens-le sous le corps, vers le milieu. Vise bien à plat, ou un cheveu au-dessus, et pousse-le doucement plutôt que de le lancer.",
      titles: {
        "sea-glider.step-01": "Plie-le en deux",
        "sea-glider.step-02": "Rouvre-le",
        "sea-glider.step-03": "Roule le bord du haut",
        "sea-glider.step-04": "Roule-le encore",
        "sea-glider.step-05": "Rentre le coin droit",
        "sea-glider.step-06": "Maintenant le coin gauche",
        "sea-glider.step-07": "Plie tout l'avion en deux",
        "sea-glider.step-08": "Rabats les grandes ailes",
        "sea-glider.step-09": "Retourne-le",
        "sea-glider.step-10": "Mets-le nez en l'air",
        "sea-glider.step-11": "Ouvre l'aile de devant",
        "sea-glider.step-12": "Ouvre l'aile du fond",
      },
      steps: {
        "sea-glider.step-01":
          "Pose la feuille debout, comme une porte. Rabats le bord droit sur le bord gauche, puis appuie le long du pli avec le pouce pour qu'il tienne.",
        "sea-glider.step-02":
          "Rouvre la feuille à plat. Tu vois une ligne au milieu, là où tu as plié. Cette ligne est ton repère pour tout le reste.",
        "sea-glider.step-03":
          "Rabats vers toi tout le bord du haut, sur environ trois doigts de large. Garde le bord plié bien parallèle au haut de la feuille, puis aplatis-le.",
        "sea-glider.step-04":
          "Replie cette bande épaisse encore une fois, de la même largeur. L'avant de la feuille fait maintenant trois épaisseurs et il est nettement plus rigide.",
        "sea-glider.step-05":
          "Trouve le milieu du nouveau bord épais à l'avant. Rabats le coin en haut à droite vers le bas et vers l'intérieur, pour que le bord épais se pose sur la ligne du milieu.",
        "sea-glider.step-06":
          "Fais pareil à gauche. Les deux bords épais se rejoignent maintenant au milieu et l'avant se termine en pointe.",
        "sea-glider.step-07":
          "Plie tout l'avion en deux le long de la ligne du milieu, mais vers l'arrière, pour que les plis que tu viens de faire se retrouvent à l'extérieur.",
        "sea-glider.step-08":
          "Couche-le sur le côté. Rabats la couche du dessus pour faire une aile, en commençant le pli près du bord plié pour que l'aile sorte très large.",
        "sea-glider.step-09":
          "Retourne tout l'avion pour regarder l'autre côté. Plie la deuxième aile pareil que la première.",
        "sea-glider.step-10": "Mets l'avion nez en l'air et regarde bien droit dans l'axe du corps.",
        "sea-glider.step-11":
          "Tiens le corps et relève l'aile du dessus jusqu'à ce qu'elle sorte presque à plat, comme un vrai avion vu de face.",
        "sea-glider.step-12":
          "Retourne-le et relève l'autre aile pareil. Deux longues ailes plates, juste un tout petit peu relevées, et c'est fini.",
      },
      why: {
        "sea-glider.step-01":
          "La ligne du milieu est la colonne vertébrale de l'avion. Tous les plis suivants se mesurent par rapport à elle.",
        "sea-glider.step-02":
          "Tu avais juste besoin de la marque, pas du pli. Marquer puis rouvrir, c'est comme ça qu'on se laisse un repère.",
        "sea-glider.step-03":
          "Rouler le bord répartit le poids sur tout l'avant de l'avion au lieu de le mettre en un seul tas. Réparti comme ça, il garde l'avion bien à plat.",
        "sea-glider.step-04":
          "Deux tours rendent le bord avant rigide en plus d'être lourd. Un bord d'attaque rigide ne flotte pas, et une aile qui ne flotte pas plane plus loin.",
        "sea-glider.step-05":
          "Rabattre le bord lourd vers l'intérieur emmène tout ce poids dans le nez, exactement là où un planeur en a besoin.",
        "sea-glider.step-07":
          "Plier vers l'arrière met les bords épais à l'extérieur, ce qui te donne une arête à tenir et garde les ailes bien à plat.",
        "sea-glider.step-08":
          "De longues ailes larges avec une queue légère, c'est la recette d'un vol plané lent et plat. Des ailes étroites feraient plonger cet avion.",
        "sea-glider.step-11":
          "Les ailes à plat attrapent l'air par en dessous, et ici il y a beaucoup d'aile pour l'attraper.",
        "sea-glider.step-12":
          "Les deux ailes doivent être identiques. Si l'une est plus haute que l'autre, l'avion penche de ce côté au lieu de planer droit.",
      },
      tips: {
        default:
          "Chaque pli de cet avion se mesure sur le précédent, donc un roulé de travers au début donne un avion de travers à la fin.",
        "sea-glider.step-03":
          "Aligne les deux coins du haut avant d'appuyer, sinon tout l'avion penchera.",
        "sea-glider.step-04": "Replie la bande sur elle-même, pas toute la feuille.",
        "sea-glider.step-08":
          "Ne laisse qu'une bande étroite au milieu pour le corps. Tout le reste, c'est de l'aile.",
        "sea-glider.step-12":
          "S'il plonge quand tu le lances, relève un peu les bords tout à l'arrière des ailes.",
      },
    },

    hammer: {
      name: "Le Marteau",
      description:
        "Le poids lourd. Tu roules l'avant de la feuille sur elle-même deux fois avant de faire le nez, si bien que la pointe finie contient six épaisseurs ou plus, bien tassées. Tout ce poids à l'avant lui permet de percer l'air et de voler très loin. C'est le plus difficile à plier proprement, et le plus satisfaisant à lancer.",
      throwTip:
        "Pince le gros nez par en dessous et lance-le fort, vite et légèrement vers le haut. C'est le seul avion qui veut toute ta force.",
      titles: {
        "hammer.step-01": "Plie-le en deux",
        "hammer.step-02": "Rouvre-le",
        "hammer.step-03": "Rentre le coin droit",
        "hammer.step-04": "Maintenant le coin gauche",
        "hammer.step-05": "Roule la pointe en arrière",
        "hammer.step-06": "Roule-la encore",
        "hammer.step-07": "Ramène le coin droit au milieu",
        "hammer.step-08": "Maintenant le coin gauche",
        "hammer.step-09": "Plie tout l'avion en deux",
        "hammer.step-10": "Rabats les ailes",
        "hammer.step-11": "Retourne-le",
        "hammer.step-12": "Mets-le nez en l'air",
        "hammer.step-13": "Ouvre l'aile de devant",
        "hammer.step-14": "Ouvre l'aile du fond",
      },
      steps: {
        "hammer.step-01":
          "Pose la feuille debout, comme une porte. Rabats le bord droit sur le bord gauche, puis appuie le long du pli avec le pouce pour qu'il tienne.",
        "hammer.step-02":
          "Rouvre la feuille à plat. Tu vois une ligne au milieu, là où tu as plié. Cette ligne est ton repère pour tout le reste.",
        "hammer.step-03":
          "Prends le coin en haut à droite et rabats-le vers le bas et vers l'intérieur, pour que son bord du haut se pose pile sur la ligne du milieu. Appuie bien.",
        "hammer.step-04":
          "Fais exactement pareil à gauche. Le haut de la feuille ressemble maintenant à un toit pointu.",
        "hammer.step-05":
          "Rabats la pointe vers le bas par-dessus l'avion, pour que le bout atterrisse là où s'arrêtaient les deux plis de coins. L'avant est maintenant un bord plat.",
        "hammer.step-06":
          "Replie cet avant plat encore une fois, un peu moins loin cette fois. Le bord avant devient plus large et beaucoup plus épais. Appuie fort.",
        "hammer.step-07":
          "Trouve le milieu du bord épais à l'avant. Rabats le coin droit de ce bord vers le bas et vers l'intérieur, jusqu'à ce que le bord se pose sur la ligne du milieu.",
        "hammer.step-08":
          "Fais pareil avec le coin gauche. Une nouvelle pointe apparaît, et tout le papier roulé est maintenant tassé à l'intérieur.",
        "hammer.step-09":
          "Plie tout l'avion en deux le long de la ligne du milieu, mais vers l'arrière, pour que tout ce que tu viens de plier se retrouve à l'extérieur.",
        "hammer.step-10":
          "Couche-le sur le côté. Rabats la couche du dessus pour faire une aile, en partant du nez et en allant jusqu'à la queue.",
        "hammer.step-11":
          "Retourne tout l'avion pour regarder l'autre côté. Plie la deuxième aile pareil que la première.",
        "hammer.step-12":
          "Mets l'avion nez en l'air et regarde bien droit dans l'axe du corps. Le nez doit être un bloc solide que tu peux pincer.",
        "hammer.step-13":
          "Tiens le corps et relève l'aile du dessus jusqu'à ce qu'elle sorte bien à plat, comme un vrai avion vu de face.",
        "hammer.step-14":
          "Retourne-le et relève l'autre aile pareil. Garde ces ailes plus plates que sur les planeurs. Voilà un Marteau.",
      },
      why: {
        "hammer.step-01":
          "La ligne du milieu est la colonne vertébrale de l'avion. Tous les plis suivants se mesurent par rapport à elle.",
        "hammer.step-02":
          "Tu avais juste besoin de la marque, pas du pli. Marquer puis rouvrir, c'est comme ça qu'on se laisse un repère.",
        "hammer.step-03":
          "Ces plis de coins sont la première charge de papier qui part vers le nez. Tout ce qui suit vient s'empiler par-dessus.",
        "hammer.step-05":
          "Rouler la pointe en arrière au lieu de l'affiner double le papier à l'avant. Tu construis du poids, pas une pointe.",
        "hammer.step-06":
          "Chaque tour replie une bande qui fait déjà plusieurs épaisseurs. Deux tours, c'est tout ce que le papier accepte en restant à plat.",
        "hammer.step-07":
          "Ça tire toute la barre roulée dans la pointe. C'est ce qui rend le nez tellement plus lourd que la queue.",
        "hammer.step-09":
          "Plier vers l'arrière met les bords épais à l'extérieur, ce qui te donne une arête à tenir et garde les ailes bien à plat.",
        "hammer.step-10":
          "Des ailes plus étroites veulent dire moins d'air qui freine, donc un avion lourd garde sa vitesse et va plus loin avant de se poser.",
        "hammer.step-13":
          "Un avion rapide et lourd a besoin de moins de portance, pas plus, donc ces ailes sont plus plates que celles d'un planeur.",
        "hammer.step-14":
          "Les deux ailes doivent être identiques. À cette vitesse, même une petite différence envoie l'avion en courbe.",
      },
      tips: {
        default:
          "Appuie sur chaque pli avec l'ongle, puis passe-le sur le bord de la table. Les plis épais se rouvrent tout seuls si tu ne les marques pas pour de vrai.",
        "hammer.step-05":
          "Prends ton temps. Si le bout atterrit de travers, tous les plis suivants seront de travers aussi.",
        "hammer.step-06": "Écrase bien celui-là avec quelque chose de dur, comme le dos d'une cuillère.",
        "hammer.step-07":
          "Six épaisseurs, c'est beaucoup. Plie lentement et tiens la feuille pendant que tu le fais.",
        "hammer.step-14":
          "Vise dans l'axe du nez : les ailes doivent paraître presque à plat, pas former un V profond.",
      },
    },

    "square-cruiser": {
      name: "Le Croiseur Carré",
      description:
        "Le seul avion d'ici qui part d'un carré, alors la première chose à faire est d'en fabriquer un. Un carré donne des ailes courtes et larges et un corps trapu, ce qui donne au final un avion calme et stable. Il traverse une pièce tout droit, sans se compliquer la vie.",
      throwTip:
        "Tiens-le sous le corps, derrière le nez, et lance-le bien à plat avec une poussée moyenne. Il ne veut pas de la vitesse, il veut un lâcher tout doux.",
      titles: {
        "square-cruiser.prep.letter-01": "Rabats un coin",
        "square-cruiser.prep.letter-02": "Rouvre-le",
        "square-cruiser.prep.letter-03": "Coupe la bande",
        "square-cruiser.prep.a4-01": "Rabats un coin",
        "square-cruiser.prep.a4-02": "Rouvre-le",
        "square-cruiser.prep.a4-03": "Coupe la bande",
        "square-cruiser.prep.index-01": "Rabats un coin",
        "square-cruiser.prep.index-02": "Rouvre-le",
        "square-cruiser.prep.index-03": "Coupe la bande",
        "square-cruiser.step-01": "Plie-le en deux",
        "square-cruiser.step-02": "Rouvre-le",
        "square-cruiser.step-03": "Rentre le coin droit",
        "square-cruiser.step-04": "Maintenant le coin gauche",
        "square-cruiser.step-05": "Aplatis la pointe",
        "square-cruiser.step-06": "Ramène le coin droit au milieu",
        "square-cruiser.step-07": "Maintenant le coin gauche",
        "square-cruiser.step-08": "Plie tout l'avion en deux",
        "square-cruiser.step-09": "Rabats les ailes",
        "square-cruiser.step-10": "Retourne-le",
        "square-cruiser.step-11": "Mets-le nez en l'air",
        "square-cruiser.step-12": "Ouvre l'aile de devant",
        "square-cruiser.step-13": "Ouvre l'aile du fond",
      },
      steps: {
        "square-cruiser.prep.letter-01":
          "Pose la feuille debout. Rabats le coin en haut à gauche vers le bas, jusqu'à ce que le bord du haut se pose exactement le long du bord de droite. Aplatis le pli.",
        "square-cruiser.prep.letter-02":
          "Rouvre la feuille. Le pli a laissé une ligne qui traverse la feuille. Tout ce qui est au-dessus de cette ligne est un carré parfait.",
        "square-cruiser.prep.letter-03":
          "Coupe le long de la ligne et garde le carré. Mets la bande qui reste de côté, tu n'en auras pas besoin.",
        "square-cruiser.prep.a4-01":
          "Pose la feuille debout. Rabats le coin en haut à gauche vers le bas, jusqu'à ce que le bord du haut se pose exactement le long du bord de droite. Aplatis le pli.",
        "square-cruiser.prep.a4-02":
          "Rouvre la feuille. Le pli a laissé une ligne qui traverse la feuille. Tout ce qui est au-dessus de cette ligne est un carré parfait.",
        "square-cruiser.prep.a4-03":
          "Coupe le long de la ligne et garde le carré. Mets la bande qui reste de côté, tu n'en auras pas besoin.",
        "square-cruiser.prep.index-01":
          "Pose la fiche debout. Rabats le coin en haut à gauche vers le bas, jusqu'à ce que le bord du haut se pose exactement le long du bord de droite. Aplatis le pli.",
        "square-cruiser.prep.index-02":
          "Rouvre la fiche. Le pli a laissé une ligne qui la traverse. Tout ce qui est au-dessus de cette ligne est un carré parfait.",
        "square-cruiser.prep.index-03":
          "Coupe le long de la ligne et garde le carré. C'est un petit carré rigide, alors attends-toi à un petit avion qui ne plane pas très loin.",
        "square-cruiser.step-01":
          "Pose le carré devant toi. Rabats le bord droit sur le bord gauche, appuie le long du pli, et tu as ta ligne du milieu.",
        "square-cruiser.step-02":
          "Rouvre-le à plat. La ligne au milieu est ton repère pour tout le reste.",
        "square-cruiser.step-03":
          "Rabats le coin en haut à droite vers le bas et vers l'intérieur, pour que le bord du haut se pose sur la ligne du milieu. Sur un carré, ce coin arrive pile au centre de la feuille.",
        "square-cruiser.step-04":
          "Fais pareil à gauche. La moitié haute du carré est maintenant un grand triangle posé sur la moitié basse.",
        "square-cruiser.step-05":
          "Rabats la pointe de ce triangle vers le bas, pour que le bout atterrisse au centre du carré. L'avant devient plat et large.",
        "square-cruiser.step-06":
          "Rabats le coin droit du nouvel avant plat vers le bas et vers l'intérieur jusqu'à la ligne du milieu, pour qu'une nouvelle pointe apparaisse au-dessus du rabat que tu viens de plier.",
        "square-cruiser.step-07":
          "Fais pareil à gauche. Les deux coins se rejoignent au milieu et maintiennent en place le rabat qui est dessous.",
        "square-cruiser.step-08":
          "Plie tout l'avion en deux le long de la ligne du milieu, mais vers l'arrière, pour que tout ce que tu viens de plier se retrouve à l'extérieur.",
        "square-cruiser.step-09":
          "Couche-le sur le côté. Rabats la couche du dessus pour faire une aile, en partant du nez et en allant jusqu'à la queue.",
        "square-cruiser.step-10":
          "Retourne tout l'avion pour regarder l'autre côté. Plie la deuxième aile pareil que la première.",
        "square-cruiser.step-11":
          "Mets l'avion nez en l'air et regarde bien droit dans l'axe du corps.",
        "square-cruiser.step-12":
          "Tiens le corps et relève l'aile du dessus jusqu'à ce qu'elle sorte presque à plat, comme un vrai avion vu de face.",
        "square-cruiser.step-13":
          "Retourne-le et relève l'autre aile pareil. Des ailes courtes, larges et bien à plat, et le Croiseur est fini.",
      },
      why: {
        "square-cruiser.prep.letter-01":
          "Rabattre un bord sur le bord d'à côté, c'est comme ça qu'on trouve un carré sans règle. Le pli fait la mesure à ta place.",
        "square-cruiser.prep.letter-03":
          "Un carré donne des ailes courtes et larges. En partant d'une feuille longue, tu obtiendrais un avion complètement différent.",
        "square-cruiser.prep.a4-01":
          "Rabattre un bord sur le bord d'à côté, c'est comme ça qu'on trouve un carré sans règle. Le pli fait la mesure à ta place.",
        "square-cruiser.prep.a4-03":
          "Un carré donne des ailes courtes et larges. En partant d'une feuille longue, tu obtiendrais un avion complètement différent.",
        "square-cruiser.prep.index-01":
          "Rabattre un bord sur le bord d'à côté, c'est comme ça qu'on trouve un carré sans règle. Le pli fait la mesure à ta place.",
        "square-cruiser.prep.index-03":
          "Un carré donne des ailes courtes et larges. En partant d'une feuille longue, tu obtiendrais un avion complètement différent.",
        "square-cruiser.step-01":
          "La ligne du milieu est la colonne vertébrale de l'avion. Tous les plis suivants se mesurent par rapport à elle.",
        "square-cruiser.step-02":
          "Tu avais juste besoin de la marque, pas du pli. Marquer puis rouvrir, c'est comme ça qu'on se laisse un repère.",
        "square-cruiser.step-03":
          "Sur un carré, ces plis de coins sont énormes, si bien que la moitié de la feuille se retrouve doublée à l'avant. C'est de là que vient le poids de l'avion.",
        "square-cruiser.step-05":
          "Aplatir la pointe rend le nez épais et l'empêche de se planter dans le sol à chaque atterrissage.",
        "square-cruiser.step-06":
          "Ces deux coins verrouillent le rabat qui est dessous, pour que le nez ne s'ouvre pas en plein vol.",
        "square-cruiser.step-08":
          "Plier vers l'arrière met les bords épais à l'extérieur, ce qui te donne une arête à tenir et garde les ailes bien à plat.",
        "square-cruiser.step-09":
          "Une feuille carrée est courte pour sa largeur, alors ces ailes sortent larges et trapues. C'est ce qui rend le Croiseur si stable.",
        "square-cruiser.step-12":
          "Les ailes à plat attrapent l'air par en dessous. Des ailes courtes doivent être bien à plat pour fonctionner.",
        "square-cruiser.step-13":
          "Les deux ailes doivent être identiques. Si l'une est plus haute que l'autre, l'avion penche de ce côté au lieu de filer droit.",
      },
      tips: {
        default:
          "Tout sur cet avion se mesure à partir de la ligne du milieu et des coins, donc ça marche avec n'importe quelle taille de carré que tu sais fabriquer.",
        "square-cruiser.prep.a4-01":
          "Fais glisser le coin jusqu'à ce que le bord du haut se pose exactement sur le bord du côté, puis appuie.",
        "square-cruiser.prep.a4-03":
          "Demande à un adulte avant d'utiliser des ciseaux, et coupe sur le pli, pas à côté.",
        "square-cruiser.prep.letter-03":
          "Demande à un adulte avant d'utiliser des ciseaux, et coupe sur le pli, pas à côté.",
        "square-cruiser.prep.index-03":
          "Le papier d'imprimante marche mieux que le bristol ici. Le bristol est rigide et ne tiendra pas les plis du nez.",
        "square-cruiser.step-03":
          "Le coin doit atterrir pile au centre du carré. Sers-toi de ça comme vérification.",
        "square-cruiser.step-06":
          "Ne touche pas au rabat du dessous. Seuls les deux nouveaux coins bougent.",
        "square-cruiser.step-13": "Vise dans l'axe du nez : deux ailes courtes, presque à plat.",
      },
    },
  },
  glossary: {
    "valley-fold": {
      term: "Pli vallée",
      definition: "Un pli dont l'arête creuse comme une vallée. Le papier se replie vers toi.",
    },
    "mountain-fold": {
      term: "Pli montagne",
      definition:
        "Le contraire du pli vallée : l'arête pointe vers le haut comme une montagne, et le papier se replie loin de toi.",
    },
    crease: {
      term: "Marque de pli",
      definition: "La ligne nette qui reste après avoir plié le papier et l'avoir bien aplati.",
    },
    "center-line": {
      term: "Ligne du milieu",
      definition:
        "Le pli qui descend au milieu de la feuille et qui te sert de repère pour tous les autres plis.",
    },
    "blunt-nose": {
      term: "Nez épaté",
      definition:
        "Un nez fait en repliant la pointe sur elle-même, si bien que l'avant de l'avion est plat et épais au lieu d'être pointu.",
    },
    hem: {
      term: "Ourlet",
      definition:
        "Une bande repliée le long d'un bord droit, comme l'ourlet d'une chemise. Roule-la deux fois et ce bord devient épais et lourd.",
    },
    "partial-fold": {
      term: "Pli à moitié",
      definition:
        "Un pli que tu arrêtes à mi-chemin, si bien que le papier se courbe et reste en biais au lieu de se coucher à plat.",
    },
    "tip-fin": {
      term: "Ailette de bout d'aile",
      definition:
        "Un petit morceau au bout d'une aile, relevé vers le haut. Il empêche l'avion de glisser sur le côté dans l'air.",
    },
    "square-from-rectangle": {
      term: "Fabriquer un carré",
      definition:
        "Rabats un bord de la feuille sur le bord d'à côté. Le pli marque le plus grand carré qui tient dans la feuille, prêt à découper.",
    },
  },
};

export default planes;
export { planes };
