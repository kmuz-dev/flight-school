/**
 * Spanish plane prose. Translated from planes/en.ts key for key.
 *
 * Writing bar (PRD §2): a sharp 10-year-old follows every instruction alone.
 * "Left" and "right" are places on the table, not reading order, so they are
 * translated literally and never swapped.
 */
import type { PlanesDictionary } from "../types";

const planes: PlanesDictionary = {
  planes: {
    dart: {
      name: "La Flecha",
      description:
        "El clásico. Doce pliegues, una punta afilada y un vuelo recto y rápido. Si solo has hecho un avión de papel en tu vida, seguramente se parecía a este.",
      throwTip:
        "Sujétalo por debajo, cerca de la punta. Apunta un poco hacia arriba y lánzalo rápido y nivelado. Si pica hacia abajo, dobla un poco hacia arriba los bordes traseros de las alas.",
      titles: {
        "dart.step-01": "Dóblalo por la mitad",
        "dart.step-02": "Vuelve a abrirlo",
        "dart.step-03": "Trae la esquina derecha",
        "dart.step-04": "Ahora la esquina izquierda",
        "dart.step-05": "Doble el lado derecho otra vez",
        "dart.step-06": "Y el lado izquierdo",
        "dart.step-07": "Dobla el avión por la mitad",
        "dart.step-08": "Baja las alas",
        "dart.step-09": "Dale la vuelta",
        "dart.step-10": "Ponlo con la punta arriba",
        "dart.step-11": "Abre el ala de este lado",
        "dart.step-12": "Abre el ala del otro lado",
      },
      steps: {
        "dart.step-01":
          "Pon el papel de pie, como una puerta. Dobla el borde derecho hasta que toque el borde izquierdo y aprieta el doblez con el pulgar para que se quede.",
        "dart.step-02":
          "Vuelve a abrir el papel del todo. Verás una línea por el medio donde doblaste. Esa línea es tu guía para todo lo demás.",
        "dart.step-03":
          "Coge la esquina de arriba a la derecha y dóblala hacia abajo y hacia dentro, de modo que su borde de arriba quede justo sobre la línea del medio. Apriétala bien.",
        "dart.step-04":
          "Haz exactamente lo mismo a la izquierda: la esquina de arriba a la izquierda hacia abajo y hacia dentro, hasta que su borde toque la línea del medio. Arriba debería quedar como un tejado en punta.",
        "dart.step-05":
          "Dobla otra vez todo el borde inclinado de la derecha, para que también quede sobre la línea del medio. La punta se vuelve más fina y más afilada.",
        "dart.step-06":
          "Igual a la izquierda. Los dos bordes inclinados se juntan ahora en el medio, y el papel queda largo y estrecho con una punta afilada arriba.",
        "dart.step-07":
          "Dobla todo el avión por la mitad siguiendo la línea del medio, pero esta vez hacia atrás, para que todos los pliegues que acabas de hacer queden por fuera.",
        "dart.step-08":
          "Túmbalo de lado. Dobla la capa de arriba hacia abajo para hacer un ala, empezando en la punta y siguiendo hacia atrás. Aprieta fuerte a lo largo del doblez.",
        "dart.step-09":
          "Dale la vuelta al avión entero para mirar el otro lado. Comprueba que queda igual.",
        "dart.step-10":
          "Pon el avión con la punta hacia arriba y mira por el cuerpo desde arriba. Las dos alas deberían ser iguales.",
        "dart.step-11":
          "Sujeta el cuerpo y levanta el ala de arriba hasta que quede estirada y plana, como un avión de verdad visto de frente.",
        "dart.step-12":
          "Dale la vuelta y haz lo mismo con la otra ala. Las dos alas deben quedar estiradas y niveladas, formando una V muy abierta. Eso es una Flecha.",
      },
      explanations: {
        "dart.step-01":
          "La línea del medio es la columna del avión. Todos los pliegues de después se miden con ella.",
        "dart.step-02":
          "Solo necesitabas la marca, no el doblez. Marcar y volver a abrir es la forma de dejarte una guía.",
        "dart.step-03":
          "Estos pliegues de las esquinas amontonan papel en la punta. Una punta pesada es lo que hace que el avión siga apuntando hacia delante en vez de dar vueltas.",
        "dart.step-05":
          "Doblar los lados otra vez hace la punta más afilada y más pesada, así el avión atraviesa el aire en lugar de frenarse con él.",
        "dart.step-07":
          "Doblar hacia atrás deja los bordes gruesos por fuera, lo que te da un lomo para sujetar y mantiene las alas niveladas.",
        "dart.step-08":
          "Las alas son las que sostienen el avión. Hacer los dos pliegues en el mismo sitio es lo que hace que vuele recto y no se tuerza.",
        "dart.step-11":
          "Las alas planas atrapan el aire por debajo. Si las dejas cerradas, el avión no tiene nada sobre lo que apoyarse y se cae.",
        "dart.step-12":
          "Las dos alas tienen que ser iguales. Si una queda más alta que la otra, el avión gira hacia ese lado en vez de volar recto.",
      },
      tips: {
        default:
          "Aprieta cada pliegue con la uña. Los dobleces marcados vuelan mejor que los blandos.",
        "dart.step-01": "Alinea bien las esquinas antes de apretar nada.",
        "dart.step-03":
          "Tómate tu tiempo para alinear el borde. Una esquina torcida aquí hace un vuelo curvo después.",
        "dart.step-08":
          "Dobla las dos alas a la misma distancia del medio, o el avión girará.",
        "dart.step-11": "Alas rectas y niveladas, vistas de frente, es lo que buscas.",
        "dart.step-12": "Mira desde la punta: las dos alas deben formar una V muy abierta.",
      },
    },

    bulldog: {
      name: "La Flecha Bulldog",
      description:
        "Una Flecha con la punta doblada sobre sí misma. Eso le da un morro corto, romo y pesado en vez de una aguja. Es más lenta que la Flecha pero mucho más dura: no se arruga al chocar contra una pared y sigue volando recta aunque tus pliegues queden un poco torcidos.",
      throwTip:
        "Agárralo por debajo del morro grueso y lánzalo fuerte y plano, hacia delante. No le importa un lanzamiento brusco.",
      titles: {
        "bulldog.step-01": "Dóblalo por la mitad",
        "bulldog.step-02": "Vuelve a abrirlo",
        "bulldog.step-03": "Trae la esquina derecha",
        "bulldog.step-04": "Ahora la esquina izquierda",
        "bulldog.step-05": "Doble el lado derecho otra vez",
        "bulldog.step-06": "Y el lado izquierdo",
        "bulldog.step-07": "Dobla la punta hacia abajo",
        "bulldog.step-08": "Dobla el avión por la mitad",
        "bulldog.step-09": "Baja las alas",
        "bulldog.step-10": "Dale la vuelta",
        "bulldog.step-11": "Ponlo con la punta arriba",
        "bulldog.step-12": "Abre el ala de este lado",
        "bulldog.step-13": "Abre el ala del otro lado",
      },
      steps: {
        "bulldog.step-01":
          "Pon el papel de pie, como una puerta. Dobla el borde derecho hasta que toque el borde izquierdo y aprieta el doblez con el pulgar para que se quede.",
        "bulldog.step-02":
          "Vuelve a abrir el papel del todo. Verás una línea por el medio donde doblaste. Esa línea es tu guía para todo lo demás.",
        "bulldog.step-03":
          "Coge la esquina de arriba a la derecha y dóblala hacia abajo y hacia dentro, de modo que su borde de arriba quede justo sobre la línea del medio. Apriétala bien.",
        "bulldog.step-04":
          "Haz exactamente lo mismo a la izquierda: la esquina de arriba a la izquierda hacia abajo y hacia dentro, hasta que su borde toque la línea del medio. Arriba queda como un tejado en punta.",
        "bulldog.step-05":
          "Dobla otra vez todo el borde inclinado de la derecha, para que también quede sobre la línea del medio. La punta se vuelve más fina y más afilada.",
        "bulldog.step-06":
          "Igual a la izquierda. Los dos bordes inclinados se juntan ahora en el medio y tienes una forma larga y estrecha con una punta afilada arriba.",
        "bulldog.step-07":
          "Ahora dobla esa punta afilada hacia abajo, sobre el avión. Baja el pico hasta que llegue al sitio donde acababan tus dos primeros pliegues de las esquinas.",
        "bulldog.step-08":
          "Dobla todo el avión por la mitad siguiendo la línea del medio, pero hacia atrás, para que todos los pliegues que acabas de hacer queden por fuera.",
        "bulldog.step-09":
          "Túmbalo de lado. Dobla la capa de arriba hacia abajo para hacer un ala, empezando en el morro romo y siguiendo hasta la cola.",
        "bulldog.step-10":
          "Dale la vuelta al avión entero para mirar el otro lado. Comprueba que la segunda ala queda igual que la primera.",
        "bulldog.step-11":
          "Pon el avión con la punta hacia arriba y mira por el cuerpo desde arriba.",
        "bulldog.step-12":
          "Sujeta el cuerpo y levanta el ala de arriba hasta que quede casi nivelada, como un avión de verdad visto de frente.",
        "bulldog.step-13":
          "Dale la vuelta y haz lo mismo con la otra ala. Las dos alas deben quedar estiradas y niveladas, apenas un poco levantadas. Eso es un Bulldog.",
      },
      explanations: {
        "bulldog.step-01":
          "La línea del medio es la columna del avión. Todos los pliegues de después se miden con ella.",
        "bulldog.step-02":
          "Solo necesitabas la marca, no el doblez. Marcar y volver a abrir es la forma de dejarte una guía.",
        "bulldog.step-03":
          "Estos pliegues de las esquinas amontonan papel delante. El peso delante es lo que hace que el avión siga apuntando hacia delante en vez de dar vueltas.",
        "bulldog.step-05":
          "Doblar los lados otra vez vuelve a duplicar el papel de delante. Hasta aquí es exactamente una Flecha.",
        "bulldog.step-07":
          "Este es el pliegue que lo convierte en Bulldog. Todo ese papel en punta vuelve y se queda en un bloque corto y grueso delante.",
        "bulldog.step-08":
          "Doblar hacia atrás deja los bordes gruesos por fuera, lo que te da un lomo para sujetar y mantiene las alas niveladas.",
        "bulldog.step-09":
          "Las alas son las que sostienen el avión. Hacer los dos pliegues en el mismo sitio es lo que hace que vuele recto y no se tuerza.",
        "bulldog.step-12":
          "Un morro romo aparta más aire, así que este avión vuela más despacio. Las alas planas le dan sustentación suficiente para seguir adelante igualmente.",
        "bulldog.step-13":
          "Las dos alas tienen que ser iguales. Si una queda más alta que la otra, el avión gira hacia ese lado en vez de volar recto.",
      },
      tips: {
        default:
          "Aprieta cada pliegue con la uña. Este avión perdona el plegado descuidado mejor que ningún otro, pero los dobleces marcados siguen volando más lejos.",
        "bulldog.step-05":
          "Aquí el papel tiene cuatro capas. Aprieta a lo largo del doblez, no encima de él.",
        "bulldog.step-07":
          "Dóblala por delante, no por debajo. El bloque romo va por fuera.",
        "bulldog.step-09":
          "Dobla las dos alas a la misma distancia del medio, o el avión girará.",
        "bulldog.step-13": "Mira desde la punta: las dos alas deben verse casi niveladas.",
      },
    },

    harrier: {
      name: "El Harrier",
      description:
        "Un planeador grande y lento. Sus alas son casi tan anchas como el papel y su morro va doblado plano en vez de en punta, así que flota en lugar de correr. Las aletitas de las puntas de las alas evitan que se vaya hacia un lado. Lanzado con suavidad, cruza una habitación a la deriva y aterriza blandito.",
      throwTip:
        "Sujétalo por debajo del cuerpo, justo detrás del morro. Apunta un poco hacia arriba y suéltalo con suavidad. Si lo lanzas fuerte, subirá, se parará y caerá de golpe.",
      titles: {
        "harrier.step-01": "Dóblalo por la mitad",
        "harrier.step-02": "Vuelve a abrirlo",
        "harrier.step-03": "Trae la esquina derecha",
        "harrier.step-04": "Ahora la esquina izquierda",
        "harrier.step-05": "Dobla la punta hacia abajo",
        "harrier.step-06": "Dobla el avión por la mitad",
        "harrier.step-07": "Baja las alas anchas",
        "harrier.step-08": "Dale la vuelta",
        "harrier.step-09": "Ponlo con la punta arriba",
        "harrier.step-10": "Dobla hacia arriba la punta del ala de este lado",
        "harrier.step-11": "Y la punta del ala del otro lado",
        "harrier.step-12": "Abre el ala de este lado",
        "harrier.step-13": "Abre el ala del otro lado",
      },
      steps: {
        "harrier.step-01":
          "Pon el papel de pie, como una puerta. Dobla el borde derecho hasta que toque el borde izquierdo y aprieta el doblez con el pulgar para que se quede.",
        "harrier.step-02":
          "Vuelve a abrir el papel del todo. Verás una línea por el medio donde doblaste. Esa línea es tu guía para todo lo demás.",
        "harrier.step-03":
          "Coge la esquina de arriba a la derecha y dóblala hacia abajo y hacia dentro, de modo que su borde de arriba quede justo sobre la línea del medio. Apriétala bien.",
        "harrier.step-04":
          "Haz exactamente lo mismo a la izquierda: la esquina de arriba a la izquierda hacia abajo y hacia dentro, hasta que su borde toque la línea del medio. Arriba queda como un tejado en punta.",
        "harrier.step-05":
          "No afiles la punta. En vez de eso dóblala hacia abajo, para que el pico caiga en el sitio donde acababan los dos pliegues de las esquinas. La parte de delante queda plana y ancha.",
        "harrier.step-06":
          "Dobla todo el avión por la mitad siguiendo la línea del medio, pero hacia atrás, para que los pliegues que acabas de hacer queden por fuera.",
        "harrier.step-07":
          "Túmbalo de lado. Dobla la capa de arriba hacia abajo para hacer un ala, pero esta vez empieza el doblez muy cerca del borde doblado, para que el ala salga ancha.",
        "harrier.step-08":
          "Dale la vuelta al avión entero para mirar el otro lado. Dobla la segunda ala igual que la primera.",
        "harrier.step-09":
          "Pon el avión con la punta hacia arriba y mira por el cuerpo desde arriba.",
        "harrier.step-10":
          "Coge el borde de más afuera del ala de arriba, más o menos a un pulgar de la punta, y dóblalo hacia arriba. Párate a medio camino. No lo aplastes del todo.",
        "harrier.step-11":
          "Dale la vuelta y dobla la otra punta de ala hacia arriba lo mismo. Las dos aletitas deben ser el reflejo la una de la otra.",
        "harrier.step-12":
          "Sujeta el cuerpo y levanta el ala de arriba entera hasta que quede casi nivelada. La aletita que hiciste debería quedar de pie en la punta.",
        "harrier.step-13":
          "Dale la vuelta y levanta la otra ala igual. Visto de frente deberías tener dos alas anchas y planas con las puntas levantadas.",
      },
      explanations: {
        "harrier.step-01":
          "La línea del medio es la columna del avión. Todos los pliegues de después se miden con ella.",
        "harrier.step-02":
          "Solo necesitabas la marca, no el doblez. Marcar y volver a abrir es la forma de dejarte una guía.",
        "harrier.step-03":
          "Estos pliegues de las esquinas amontonan papel delante, y ese es el peso que mantiene el morro apuntando hacia delante.",
        "harrier.step-05":
          "Un frente plano es más lento que una punta, y lo lento es justo lo que este avión quiere. Doblar el pico hacia abajo también evita que las solapas de las esquinas se abran solas.",
        "harrier.step-06":
          "Doblar hacia atrás deja los bordes gruesos por fuera, lo que te da un lomo para sujetar y mantiene las alas niveladas.",
        "harrier.step-07":
          "Las alas anchas sostienen más peso a menos velocidad. Ese es todo el truco de un avión que flota en vez de lanzarse.",
        "harrier.step-10":
          "Una punta de ala doblada hacia arriba funciona como un timón en cada extremo. Si el avión empieza a deslizarse de lado, las aletas lo empujan otra vez recto.",
        "harrier.step-12":
          "Las alas planas atrapan el aire por debajo. Con alas tan anchas, hasta un lanzamiento suave le da mucho sobre lo que apoyarse.",
        "harrier.step-13":
          "Las dos alas tienen que ser iguales. Si una queda más alta que la otra, el avión gira hacia ese lado en vez de planear recto.",
      },
      tips: {
        default:
          "En este avión todo depende de que las alas sean idénticas. Cada vez que dobles un lado, levántalo y compáralo con el otro antes de apretar.",
        "harrier.step-05":
          "Apunta el pico al sitio donde se juntan los dos bordes inclinados y aprieta.",
        "harrier.step-07":
          "Deja solo una tira estrecha en el medio para el cuerpo. Todo lo demás es ala.",
        "harrier.step-10": "Dobla suave, no marques. Una aleta aplastada no sirve de nada.",
        "harrier.step-13": "Míralo de frente: dos alas anchas y dos aletitas de pie.",
      },
    },

    "sea-glider": {
      name: "El Planeador Marino",
      description:
        "Un planeador largo y tranquilo. En vez de doblar primero las esquinas, enrollas el borde de delante dos veces, lo que pone una tira de papel pesado justo en el frente. Ese peso en el sitio correcto le hace seguir una línea larga, plana y lenta, como una gaviota sobre el agua. Es el que más tiempo aguanta en el aire de todo el hangar.",
      throwTip:
        "Sujétalo por debajo del cuerpo, cerca del medio. Apúntalo nivelado, o un pelín por encima, y empújalo con suavidad en vez de lanzarlo.",
      titles: {
        "sea-glider.step-01": "Dóblalo por la mitad",
        "sea-glider.step-02": "Vuelve a abrirlo",
        "sea-glider.step-03": "Enrolla el borde de arriba",
        "sea-glider.step-04": "Enróllalo otra vez",
        "sea-glider.step-05": "Trae la esquina derecha",
        "sea-glider.step-06": "Ahora la esquina izquierda",
        "sea-glider.step-07": "Dobla el avión por la mitad",
        "sea-glider.step-08": "Baja las alas anchas",
        "sea-glider.step-09": "Dale la vuelta",
        "sea-glider.step-10": "Ponlo con la punta arriba",
        "sea-glider.step-11": "Abre el ala de este lado",
        "sea-glider.step-12": "Abre el ala del otro lado",
      },
      steps: {
        "sea-glider.step-01":
          "Pon el papel de pie, como una puerta. Dobla el borde derecho hasta que toque el borde izquierdo y aprieta el doblez con el pulgar para que se quede.",
        "sea-glider.step-02":
          "Vuelve a abrir el papel del todo. Verás una línea por el medio donde doblaste. Esa línea es tu guía para todo lo demás.",
        "sea-glider.step-03":
          "Dobla hacia ti todo el borde de arriba, como tres dedos de ancho. Mantén el borde doblado paralelo a la parte de arriba de la hoja y apriétalo bien.",
        "sea-glider.step-04":
          "Dobla esa tira gruesa una vez más, lo mismo otra vez. El frente del papel tiene ya tres capas y se nota mucho más rígido.",
        "sea-glider.step-05":
          "Busca el medio del nuevo borde grueso de delante. Dobla la esquina de arriba a la derecha hacia abajo y hacia dentro, para que el borde grueso quede sobre la línea del medio.",
        "sea-glider.step-06":
          "Haz lo mismo a la izquierda. Los dos bordes gruesos se juntan ahora en el medio y el frente termina en punta.",
        "sea-glider.step-07":
          "Dobla todo el avión por la mitad siguiendo la línea del medio, pero hacia atrás, para que los pliegues que acabas de hacer queden por fuera.",
        "sea-glider.step-08":
          "Túmbalo de lado. Dobla la capa de arriba hacia abajo para hacer un ala, empezando el doblez cerca del borde doblado para que el ala salga ancha.",
        "sea-glider.step-09":
          "Dale la vuelta al avión entero para mirar el otro lado. Dobla la segunda ala igual que la primera.",
        "sea-glider.step-10":
          "Pon el avión con la punta hacia arriba y mira por el cuerpo desde arriba.",
        "sea-glider.step-11":
          "Sujeta el cuerpo y levanta el ala de arriba hasta que quede casi nivelada, como un avión de verdad visto de frente.",
        "sea-glider.step-12":
          "Dale la vuelta y levanta la otra ala igual. Dos alas largas y planas, apenas levantadas, y ya está.",
      },
      explanations: {
        "sea-glider.step-01":
          "La línea del medio es la columna del avión. Todos los pliegues de después se miden con ella.",
        "sea-glider.step-02":
          "Solo necesitabas la marca, no el doblez. Marcar y volver a abrir es la forma de dejarte una guía.",
        "sea-glider.step-03":
          "Enrollar el borde reparte el peso por todo el frente del avión en vez de dejarlo en un bulto. Repartido así, mantiene el avión nivelado.",
        "sea-glider.step-04":
          "Dos vueltas hacen el borde de delante rígido además de pesado. Un borde de ataque rígido no vibra, y un ala que no vibra planea más lejos.",
        "sea-glider.step-05":
          "Doblar el borde pesado hacia dentro lleva todo ese peso al morro, que es donde lo necesita un planeador.",
        "sea-glider.step-07":
          "Doblar hacia atrás deja los bordes gruesos por fuera, lo que te da un lomo para sujetar y mantiene las alas niveladas.",
        "sea-glider.step-08":
          "Alas largas y anchas con una cola ligera es la receta de un planeo lento y plano. Con alas estrechas este avión picaría.",
        "sea-glider.step-11":
          "Las alas planas atrapan el aire por debajo, y aquí hay mucha ala para atraparlo.",
        "sea-glider.step-12":
          "Las dos alas tienen que ser iguales. Si una queda más alta que la otra, el avión gira hacia ese lado en vez de planear recto.",
      },
      tips: {
        default:
          "Cada pliegue de este avión se mide desde el anterior, así que un enrollado torcido al principio sale como un avión torcido al final.",
        "sea-glider.step-03":
          "Alinea las dos esquinas de arriba antes de apretar, o el avión entero quedará inclinado.",
        "sea-glider.step-04": "Dobla la tira sobre sí misma, no la hoja entera.",
        "sea-glider.step-08":
          "Deja solo una tira estrecha en el medio para el cuerpo. Todo lo demás es ala.",
        "sea-glider.step-12":
          "Si pica al lanzarlo, dobla un poco hacia arriba los bordes de atrás de las alas.",
      },
    },

    hammer: {
      name: "El Martillo",
      description:
        "El peso pesado. Enrollas el frente del papel sobre sí mismo dos veces antes de hacer el morro, así que la punta terminada tiene seis capas o más apretadas dentro. Todo ese peso delante le deja atravesar el aire y volar muy lejos. Es el más difícil de plegar bien de todos y el más satisfactorio de lanzar.",
      throwTip:
        "Pellizca el morro grueso por debajo y lánzalo fuerte, rápido y un poco hacia arriba. Este es el único avión que quiere toda tu fuerza.",
      titles: {
        "hammer.step-01": "Dóblalo por la mitad",
        "hammer.step-02": "Vuelve a abrirlo",
        "hammer.step-03": "Trae la esquina derecha",
        "hammer.step-04": "Ahora la esquina izquierda",
        "hammer.step-05": "Enrolla la punta hacia atrás",
        "hammer.step-06": "Enróllala otra vez",
        "hammer.step-07": "Dobla la esquina derecha al medio",
        "hammer.step-08": "Ahora la esquina izquierda",
        "hammer.step-09": "Dobla el avión por la mitad",
        "hammer.step-10": "Baja las alas",
        "hammer.step-11": "Dale la vuelta",
        "hammer.step-12": "Ponlo con la punta arriba",
        "hammer.step-13": "Abre el ala de este lado",
        "hammer.step-14": "Abre el ala del otro lado",
      },
      steps: {
        "hammer.step-01":
          "Pon el papel de pie, como una puerta. Dobla el borde derecho hasta que toque el borde izquierdo y aprieta el doblez con el pulgar para que se quede.",
        "hammer.step-02":
          "Vuelve a abrir el papel del todo. Verás una línea por el medio donde doblaste. Esa línea es tu guía para todo lo demás.",
        "hammer.step-03":
          "Coge la esquina de arriba a la derecha y dóblala hacia abajo y hacia dentro, de modo que su borde de arriba quede justo sobre la línea del medio. Apriétala bien.",
        "hammer.step-04":
          "Haz exactamente lo mismo a la izquierda. La parte de arriba del papel queda ahora como un tejado en punta.",
        "hammer.step-05":
          "Dobla la punta hacia abajo sobre el avión, para que el pico caiga donde acababan los dos pliegues de las esquinas. El frente es ahora un borde plano.",
        "hammer.step-06":
          "Dobla ese frente plano otra vez, un poco menos lejos esta vez. El borde de delante se hace más ancho y mucho más grueso. Aprieta fuerte.",
        "hammer.step-07":
          "Busca el medio del borde grueso de delante. Dobla la esquina derecha de ese borde hacia abajo y hacia dentro, hasta que el borde quede sobre la línea del medio.",
        "hammer.step-08":
          "Haz lo mismo con la esquina izquierda. Aparece una punta nueva y todo el papel enrollado queda metido dentro de ella.",
        "hammer.step-09":
          "Dobla todo el avión por la mitad siguiendo la línea del medio, pero hacia atrás, para que todo lo que acabas de doblar quede por fuera.",
        "hammer.step-10":
          "Túmbalo de lado. Dobla la capa de arriba hacia abajo para hacer un ala, empezando en el morro y siguiendo hasta la cola.",
        "hammer.step-11":
          "Dale la vuelta al avión entero para mirar el otro lado. Dobla la segunda ala igual que la primera.",
        "hammer.step-12":
          "Pon el avión con la punta hacia arriba y mira por el cuerpo desde arriba. El morro debe ser un bloque macizo que puedas pellizcar.",
        "hammer.step-13":
          "Sujeta el cuerpo y levanta el ala de arriba hasta que quede nivelada, como un avión de verdad visto de frente.",
        "hammer.step-14":
          "Dale la vuelta y levanta la otra ala igual. Deja estas alas más planas que en los planeadores. Eso es un Martillo.",
      },
      explanations: {
        "hammer.step-01":
          "La línea del medio es la columna del avión. Todos los pliegues de después se miden con ella.",
        "hammer.step-02":
          "Solo necesitabas la marca, no el doblez. Marcar y volver a abrir es la forma de dejarte una guía.",
        "hammer.step-03":
          "Estos pliegues de las esquinas son la primera carga de papel que va hacia el morro. Todo lo que viene después amontona más encima.",
        "hammer.step-05":
          "Enrollar la punta hacia atrás en vez de afilarla duplica el papel de delante. Estás construyendo peso, no una aguja.",
        "hammer.step-06":
          "Cada vuelta dobla una banda que ya tiene varias capas. Dos vueltas es todo lo que el papel aguanta quedándose plano.",
        "hammer.step-07":
          "Esto arrastra toda la barra enrollada hasta la punta. Eso es lo que hace el morro mucho más pesado que la cola.",
        "hammer.step-09":
          "Doblar hacia atrás deja los bordes gruesos por fuera, lo que te da un lomo para sujetar y mantiene las alas niveladas.",
        "hammer.step-10":
          "Alas más estrechas significan menos aire empujando en contra, así que un avión pesado mantiene su velocidad y llega más lejos antes de aterrizar.",
        "hammer.step-13":
          "Un avión rápido y pesado necesita menos sustentación, no más, así que estas alas van más planas que las de un planeador.",
        "hammer.step-14":
          "Las dos alas tienen que ser iguales. A esta velocidad, hasta una diferencia pequeña manda el avión a una curva.",
      },
      tips: {
        default:
          "Aprieta cada pliegue con la uña y luego pásalo por el borde de la mesa. Los pliegues gruesos se abren solos si no los marcas de verdad.",
        "hammer.step-05":
          "Tómate tu tiempo. Si el pico cae torcido, todos los pliegues siguientes saldrán torcidos también.",
        "hammer.step-06": "Aplasta este bien con algo duro, como el dorso de una cuchara.",
        "hammer.step-07":
          "Seis capas son muchas. Dobla despacio y sujeta el papel mientras lo haces.",
        "hammer.step-14":
          "Mira desde la punta: las alas deben verse casi niveladas, no como una V profunda.",
      },
    },

    "square-cruiser": {
      name: "El Crucero Cuadrado",
      description:
        "El único avión de aquí que empieza con un cuadrado, así que lo primero que haces es fabricar uno. Un cuadrado te da alas cortas y anchas y un cuerpo rechoncho, y eso resulta ser un volador estable y sin prisas. Cruza una habitación en línea recta sin complicarse.",
      throwTip:
        "Sujétalo por debajo del cuerpo, detrás del morro, y lánzalo nivelado con un empujón medio. No quiere velocidad, quiere una salida suave.",
      titles: {
        "square-cruiser.prep.letter-01": "Dobla una esquina",
        "square-cruiser.prep.letter-02": "Vuelve a abrirlo",
        "square-cruiser.prep.letter-03": "Corta la tira sobrante",
        "square-cruiser.prep.a4-01": "Dobla una esquina",
        "square-cruiser.prep.a4-02": "Vuelve a abrirlo",
        "square-cruiser.prep.a4-03": "Corta la tira sobrante",
        "square-cruiser.prep.index-01": "Dobla una esquina",
        "square-cruiser.prep.index-02": "Vuelve a abrirlo",
        "square-cruiser.prep.index-03": "Corta la tira sobrante",
        "square-cruiser.step-01": "Dóblalo por la mitad",
        "square-cruiser.step-02": "Vuelve a abrirlo",
        "square-cruiser.step-03": "Trae la esquina derecha",
        "square-cruiser.step-04": "Ahora la esquina izquierda",
        "square-cruiser.step-05": "Dobla la punta hacia abajo",
        "square-cruiser.step-06": "Dobla la esquina derecha al medio",
        "square-cruiser.step-07": "Ahora la esquina izquierda",
        "square-cruiser.step-08": "Dobla el avión por la mitad",
        "square-cruiser.step-09": "Baja las alas",
        "square-cruiser.step-10": "Dale la vuelta",
        "square-cruiser.step-11": "Ponlo con la punta arriba",
        "square-cruiser.step-12": "Abre el ala de este lado",
        "square-cruiser.step-13": "Abre el ala del otro lado",
      },
      steps: {
        "square-cruiser.prep.letter-01":
          "Pon la hoja de pie. Dobla la esquina de arriba a la izquierda hacia abajo, hasta que el borde de arriba quede exactamente sobre el borde de la derecha. Aprieta el doblez.",
        "square-cruiser.prep.letter-02":
          "Vuelve a abrir el papel. El doblez ha dejado una línea que cruza la hoja. Todo lo que queda por encima de esa línea es un cuadrado perfecto.",
        "square-cruiser.prep.letter-03":
          "Corta por la línea y quédate con el cuadrado. Aparta la tira que sobra, no la vas a necesitar.",
        "square-cruiser.prep.a4-01":
          "Pon la hoja de pie. Dobla la esquina de arriba a la izquierda hacia abajo, hasta que el borde de arriba quede exactamente sobre el borde de la derecha. Aprieta el doblez.",
        "square-cruiser.prep.a4-02":
          "Vuelve a abrir el papel. El doblez ha dejado una línea que cruza la hoja. Todo lo que queda por encima de esa línea es un cuadrado perfecto.",
        "square-cruiser.prep.a4-03":
          "Corta por la línea y quédate con el cuadrado. Aparta la tira que sobra, no la vas a necesitar.",
        "square-cruiser.prep.index-01":
          "Pon la ficha de pie. Dobla la esquina de arriba a la izquierda hacia abajo, hasta que el borde de arriba quede exactamente sobre el borde de la derecha. Aprieta el doblez.",
        "square-cruiser.prep.index-02":
          "Vuelve a abrir la ficha. El doblez ha dejado una línea que la cruza. Todo lo que queda por encima de esa línea es un cuadrado perfecto.",
        "square-cruiser.prep.index-03":
          "Corta por la línea y quédate con el cuadrado. Es un cuadrado pequeño y rígido, así que espera un avión pequeño que no planea muy lejos.",
        "square-cruiser.step-01":
          "Pon el cuadrado delante de ti. Dobla el borde derecho hasta que toque el borde izquierdo, aprieta el doblez y ya tienes tu línea del medio.",
        "square-cruiser.step-02":
          "Vuelve a abrirlo del todo. La línea del medio es tu guía para todo lo demás.",
        "square-cruiser.step-03":
          "Dobla la esquina de arriba a la derecha hacia abajo y hacia dentro, para que el borde de arriba quede sobre la línea del medio. En un cuadrado, esa esquina llega justo al centro de la hoja.",
        "square-cruiser.step-04":
          "Haz lo mismo a la izquierda. La mitad de arriba del cuadrado es ahora un triángulo grande apoyado sobre la mitad de abajo.",
        "square-cruiser.step-05":
          "Dobla la punta de ese triángulo hacia abajo, para que el pico caiga en el centro del cuadrado. El frente queda plano y ancho.",
        "square-cruiser.step-06":
          "Dobla la esquina derecha del nuevo frente plano hacia abajo y hacia dentro, hasta la línea del medio, para que aparezca una punta nueva por encima de la solapa que acabas de doblar.",
        "square-cruiser.step-07":
          "Haz lo mismo a la izquierda. Las dos esquinas se juntan en el medio y sujetan en su sitio la solapa que hay debajo.",
        "square-cruiser.step-08":
          "Dobla todo el avión por la mitad siguiendo la línea del medio, pero hacia atrás, para que todo lo que acabas de doblar quede por fuera.",
        "square-cruiser.step-09":
          "Túmbalo de lado. Dobla la capa de arriba hacia abajo para hacer un ala, empezando en el morro y siguiendo hasta la cola.",
        "square-cruiser.step-10":
          "Dale la vuelta al avión entero para mirar el otro lado. Dobla la segunda ala igual que la primera.",
        "square-cruiser.step-11":
          "Pon el avión con la punta hacia arriba y mira por el cuerpo desde arriba.",
        "square-cruiser.step-12":
          "Sujeta el cuerpo y levanta el ala de arriba hasta que quede casi nivelada, como un avión de verdad visto de frente.",
        "square-cruiser.step-13":
          "Dale la vuelta y levanta la otra ala igual. Alas cortas, anchas y niveladas, y el Crucero está terminado.",
      },
      explanations: {
        "square-cruiser.prep.letter-01":
          "Doblar un borde sobre el borde de al lado es la forma de encontrar un cuadrado sin regla. El doblez mide por ti.",
        "square-cruiser.prep.letter-03":
          "Un cuadrado hace alas cortas y anchas. Si empezaras con una hoja larga, saldría un avión completamente distinto.",
        "square-cruiser.prep.a4-01":
          "Doblar un borde sobre el borde de al lado es la forma de encontrar un cuadrado sin regla. El doblez mide por ti.",
        "square-cruiser.prep.a4-03":
          "Un cuadrado hace alas cortas y anchas. Si empezaras con una hoja larga, saldría un avión completamente distinto.",
        "square-cruiser.prep.index-01":
          "Doblar un borde sobre el borde de al lado es la forma de encontrar un cuadrado sin regla. El doblez mide por ti.",
        "square-cruiser.prep.index-03":
          "Un cuadrado hace alas cortas y anchas. Si empezaras con una hoja larga, saldría un avión completamente distinto.",
        "square-cruiser.step-01":
          "La línea del medio es la columna del avión. Todos los pliegues de después se miden con ella.",
        "square-cruiser.step-02":
          "Solo necesitabas la marca, no el doblez. Marcar y volver a abrir es la forma de dejarte una guía.",
        "square-cruiser.step-03":
          "En un cuadrado estos pliegues de las esquinas son enormes, así que media hoja acaba doblada en el frente. De ahí sale el peso del avión.",
        "square-cruiser.step-05":
          "Doblar la punta plana deja el morro romo y evita que se clave en el suelo en cada aterrizaje.",
        "square-cruiser.step-06":
          "Estas dos esquinas sujetan la solapa de debajo para que el morro no se abra en el aire.",
        "square-cruiser.step-08":
          "Doblar hacia atrás deja los bordes gruesos por fuera, lo que te da un lomo para sujetar y mantiene las alas niveladas.",
        "square-cruiser.step-09":
          "Una hoja cuadrada es corta para lo ancha que es, así que estas alas salen amplias y rechonchas. Eso es lo que hace estable al Crucero.",
        "square-cruiser.step-12":
          "Las alas planas atrapan el aire por debajo. Las alas cortas tienen que estar niveladas para funcionar.",
        "square-cruiser.step-13":
          "Las dos alas tienen que ser iguales. Si una queda más alta que la otra, el avión gira hacia ese lado en vez de crucear recto.",
      },
      tips: {
        default:
          "Todo en este avión se mide desde la línea del medio y las esquinas, así que funciona con cualquier tamaño de cuadrado que sepas hacer.",
        "square-cruiser.prep.a4-01":
          "Mueve la esquina hasta que el borde de arriba quede exactamente sobre el borde del lado, y entonces aprieta.",
        "square-cruiser.prep.a4-03":
          "Pide ayuda a una persona adulta antes de usar tijeras, y corta por el doblez, no al lado.",
        "square-cruiser.prep.letter-03":
          "Pide ayuda a una persona adulta antes de usar tijeras, y corta por el doblez, no al lado.",
        "square-cruiser.prep.index-03":
          "Aquí el papel de impresora va mejor que la cartulina. La cartulina es rígida y no aguanta los pliegues del morro.",
        "square-cruiser.step-03":
          "La esquina debería caer justo en el centro del cuadrado. Úsalo como comprobación.",
        "square-cruiser.step-06":
          "No toques la solapa de debajo. Solo se mueven las dos esquinas nuevas.",
        "square-cruiser.step-13": "Mira desde la punta: dos alas cortas, casi niveladas.",
      },
    },
  },
  glossary: {
    "valley-fold": {
      term: "Pliegue de valle",
      definition: "Un pliegue cuyo doblez se hunde como un valle. El papel se dobla hacia ti.",
    },
    "mountain-fold": {
      term: "Pliegue de montaña",
      definition:
        "Lo contrario de un pliegue de valle: el doblez apunta hacia arriba como una montaña y el papel se dobla alejándose de ti.",
    },
    crease: {
      term: "Doblez marcado",
      definition: "La línea afilada que queda después de doblar el papel y apretarlo bien.",
    },
    "center-line": {
      term: "Línea del medio",
      definition:
        "El doblez que baja por el centro del papel y que usas como guía para los demás pliegues.",
    },
    "blunt-nose": {
      term: "Morro romo",
      definition:
        "Un morro hecho doblando la punta afilada sobre sí misma, de modo que el frente del avión queda plano y grueso en vez de puntiagudo.",
    },
    hem: {
      term: "Dobladillo",
      definition:
        "Una tira doblada a lo largo de un borde recto, como el dobladillo de una camisa. Enróllalo dos veces y ese borde se vuelve grueso y pesado.",
    },
    "partial-fold": {
      term: "Pliegue a medias",
      definition:
        "Un pliegue que paras a mitad de camino, así que el papel se dobla y se queda en ángulo en vez de quedar plano.",
    },
    "tip-fin": {
      term: "Aleta de punta",
      definition:
        "Un trocito al final de un ala que se dobla hacia arriba. Evita que el avión se deslice de lado por el aire.",
    },
    "square-from-rectangle": {
      term: "Hacer un cuadrado",
      definition:
        "Dobla un borde de la hoja sobre el borde de al lado. El doblez marca el cuadrado más grande que cabe dentro de la hoja, listo para cortar.",
    },
  },
};

export default planes;
export { planes };
