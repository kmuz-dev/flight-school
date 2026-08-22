/**
 * Portuguese plane prose. Translated from planes/en.ts key for key.
 *
 * Writing bar (PRD §2): a sharp 10-year-old follows every instruction alone.
 * "Left" and "right" are places on the table, not reading order, so they are
 * translated literally and never swapped.
 */
import type { PlanesDictionary } from "../types";

const planes: PlanesDictionary = {
  planes: {
    dart: {
      name: "O Dardo",
      description:
        "O clássico. Doze dobras, um bico afiado e um voo direito e rápido. Se só dobraste um avião de papel na vida, é bem provável que fosse parecido com este.",
      throwTip:
        "Segura-o por baixo, perto do bico. Aponta um pouco para cima e lança-o depressa e direito. Se ele picar para baixo, dobra ligeiramente para cima os bordos de trás das asas.",
      titles: {
        "dart.step-01": "Dobra ao meio",
        "dart.step-02": "Volta a abrir",
        "dart.step-03": "Traz o canto direito",
        "dart.step-04": "Agora o canto esquerdo",
        "dart.step-05": "Dobra outra vez o lado direito",
        "dart.step-06": "E o lado esquerdo",
        "dart.step-07": "Dobra o avião todo ao meio",
        "dart.step-08": "Baixa as asas",
        "dart.step-09": "Vira-o ao contrário",
        "dart.step-10": "Põe-no com o bico para cima",
        "dart.step-11": "Abre a asa deste lado",
        "dart.step-12": "Abre a asa do outro lado",
      },
      steps: {
        "dart.step-01":
          "Põe o papel ao alto, como uma porta. Dobra o bordo direito até encontrar o bordo esquerdo e passa o polegar ao longo da dobra para ela ficar marcada.",
        "dart.step-02":
          "Volta a abrir o papel todo. Vais ver uma linha ao meio onde dobraste. Essa linha é o teu guia para tudo o resto.",
        "dart.step-03":
          "Pega no canto de cima à direita e dobra-o para baixo e para dentro, de modo que o bordo de cima fique mesmo em cima da linha do meio. Alisa bem.",
        "dart.step-04":
          "Faz exatamente o mesmo à esquerda: o canto de cima à esquerda para baixo e para dentro, até o bordo tocar na linha do meio. A parte de cima deve agora parecer um telhado em bico.",
        "dart.step-05":
          "Dobra outra vez todo o bordo inclinado da direita, para que fique também em cima da linha do meio. O bico fica mais fino e mais afiado.",
        "dart.step-06":
          "O mesmo à esquerda. Os dois bordos inclinados encontram-se agora ao meio, e o papel fica comprido e estreito com uma ponta afiada em cima.",
        "dart.step-07":
          "Dobra o avião todo ao meio pela linha do meio, mas desta vez para trás, para que todas as dobras que acabaste de fazer fiquem por fora.",
        "dart.step-08":
          "Deita-o de lado. Dobra a camada de cima para baixo para fazer uma asa, começando no bico e indo para trás. Carrega com força ao longo da dobra.",
        "dart.step-09":
          "Vira o avião todo ao contrário para olhares para o outro lado. Verifica se está igual.",
        "dart.step-10":
          "Põe o avião com o bico para cima e olha a direito pelo corpo. As duas asas devem estar iguais.",
        "dart.step-11":
          "Segura no corpo e levanta a asa de cima até ficar esticada e plana, como um avião a sério visto de frente.",
        "dart.step-12":
          "Vira-o ao contrário e faz o mesmo à outra asa. As duas asas devem agora ficar esticadas e ao nível, formando um V muito aberto. Isto é um Dardo.",
      },
      explanations: {
        "dart.step-01":
          "A linha do meio é a espinha do avião. Todas as dobras seguintes medem-se por ela.",
        "dart.step-02":
          "Só precisavas da marca, não da dobra. Vincar e voltar a abrir é a maneira de deixares um guia para ti.",
        "dart.step-03":
          "Estas dobras dos cantos amontoam papel no bico. Um bico pesado é o que faz o avião continuar a apontar para a frente em vez de dar cambalhotas.",
        "dart.step-05":
          "Dobrar os lados outra vez torna o bico mais afiado e mais pesado, para o avião furar o ar em vez de o apanhar de frente.",
        "dart.step-07":
          "Dobrar para trás deixa os bordos grossos por fora, o que te dá uma quilha para segurar e mantém as asas ao nível.",
        "dart.step-08":
          "As asas são o que sustenta o avião. Fazer as duas dobras no mesmo sítio é o que faz com que voe direito em vez de curvar.",
        "dart.step-11":
          "Asas planas apanham o ar por baixo. Se as deixares fechadas, o avião não tem nada onde se apoiar e cai.",
        "dart.step-12":
          "As duas asas têm de estar iguais. Se uma ficar mais alta do que a outra, o avião rola para esse lado em vez de voar direito.",
      },
      tips: {
        default: "Marca cada dobra com a unha. Vincos bem marcados voam melhor do que vincos moles.",
        "dart.step-01": "Alinha os cantos antes de carregares em qualquer coisa.",
        "dart.step-03":
          "Não tenhas pressa a alinhar o bordo. Um canto torto aqui dá um voo curvo lá mais para a frente.",
        "dart.step-08":
          "Dobra as duas asas à mesma distância do meio, ou o avião vai virar.",
        "dart.step-11": "Asas bem esticadas e ao nível, vistas de frente, é o que queres.",
        "dart.step-12": "Espreita pelo bico: as duas asas devem parecer um V muito aberto.",
      },
    },

    bulldog: {
      name: "O Dardo Bulldog",
      description:
        "Um Dardo com a ponta afiada dobrada sobre si mesma. Isso dá-lhe um nariz curto, rombo e pesado em vez de uma agulha. É mais lento do que o Dardo mas muito mais resistente: não se amarrota quando bate numa parede e continua a voar direito mesmo que as tuas dobras fiquem um pouco tortas.",
      throwTip:
        "Agarra o nariz grosso por baixo e lança-o com força e a direito, bem à frente. Não se importa com um lançamento à bruta.",
      titles: {
        "bulldog.step-01": "Dobra ao meio",
        "bulldog.step-02": "Volta a abrir",
        "bulldog.step-03": "Traz o canto direito",
        "bulldog.step-04": "Agora o canto esquerdo",
        "bulldog.step-05": "Dobra outra vez o lado direito",
        "bulldog.step-06": "E o lado esquerdo",
        "bulldog.step-07": "Dobra a ponta para baixo",
        "bulldog.step-08": "Dobra o avião todo ao meio",
        "bulldog.step-09": "Baixa as asas",
        "bulldog.step-10": "Vira-o ao contrário",
        "bulldog.step-11": "Põe-no com o bico para cima",
        "bulldog.step-12": "Abre a asa deste lado",
        "bulldog.step-13": "Abre a asa do outro lado",
      },
      steps: {
        "bulldog.step-01":
          "Põe o papel ao alto, como uma porta. Dobra o bordo direito até encontrar o bordo esquerdo e passa o polegar ao longo da dobra para ela ficar marcada.",
        "bulldog.step-02":
          "Volta a abrir o papel todo. Vais ver uma linha ao meio onde dobraste. Essa linha é o teu guia para tudo o resto.",
        "bulldog.step-03":
          "Pega no canto de cima à direita e dobra-o para baixo e para dentro, de modo que o bordo de cima fique mesmo em cima da linha do meio. Alisa bem.",
        "bulldog.step-04":
          "Faz exatamente o mesmo à esquerda: o canto de cima à esquerda para baixo e para dentro, até o bordo tocar na linha do meio. A parte de cima fica agora como um telhado em bico.",
        "bulldog.step-05":
          "Dobra outra vez todo o bordo inclinado da direita, para que fique também em cima da linha do meio. O bico fica mais fino e mais afiado.",
        "bulldog.step-06":
          "O mesmo à esquerda. Os dois bordos inclinados encontram-se agora ao meio e tens uma forma comprida e estreita com uma ponta afiada em cima.",
        "bulldog.step-07":
          "Agora dobra essa ponta afiada a direito para baixo, por cima do avião. Traz a ponta até chegar ao sítio onde acabaram as tuas duas primeiras dobras dos cantos.",
        "bulldog.step-08":
          "Dobra o avião todo ao meio pela linha do meio, mas para trás, para que todas as dobras que acabaste de fazer fiquem por fora.",
        "bulldog.step-09":
          "Deita-o de lado. Dobra a camada de cima para baixo para fazer uma asa, começando no nariz rombo e indo até à cauda.",
        "bulldog.step-10":
          "Vira o avião todo ao contrário para olhares para o outro lado. Verifica se a segunda asa está igual à primeira.",
        "bulldog.step-11": "Põe o avião com o bico para cima e olha a direito pelo corpo.",
        "bulldog.step-12":
          "Segura no corpo e levanta a asa de cima até ficar quase ao nível, como um avião a sério visto de frente.",
        "bulldog.step-13":
          "Vira-o ao contrário e faz o mesmo à outra asa. As duas asas devem ficar esticadas e ao nível, inclinadas só um bocadinho para cima. Isto é um Bulldog.",
      },
      explanations: {
        "bulldog.step-01":
          "A linha do meio é a espinha do avião. Todas as dobras seguintes medem-se por ela.",
        "bulldog.step-02":
          "Só precisavas da marca, não da dobra. Vincar e voltar a abrir é a maneira de deixares um guia para ti.",
        "bulldog.step-03":
          "Estas dobras dos cantos amontoam papel à frente. O peso à frente é o que faz um avião continuar a apontar para a frente em vez de dar cambalhotas.",
        "bulldog.step-05":
          "Dobrar os lados outra vez volta a duplicar o papel à frente. Até aqui é exatamente um Dardo.",
        "bulldog.step-07":
          "Esta é a dobra que faz dele um Bulldog. Todo aquele papel em bico volta para trás e fica num bloco curto e grosso à frente.",
        "bulldog.step-08":
          "Dobrar para trás deixa os bordos grossos por fora, o que te dá uma quilha para segurar e mantém as asas ao nível.",
        "bulldog.step-09":
          "As asas são o que sustenta o avião. Fazer as duas dobras no mesmo sítio é o que faz com que voe direito em vez de curvar.",
        "bulldog.step-12":
          "Um nariz rombo empurra mais ar para o lado, por isso este avião voa mais devagar. As asas planas dão-lhe sustentação suficiente para continuar na mesma.",
        "bulldog.step-13":
          "As duas asas têm de estar iguais. Se uma ficar mais alta do que a outra, o avião rola para esse lado em vez de voar direito.",
      },
      tips: {
        default:
          "Marca cada dobra com a unha. Este avião perdoa dobragem desleixada melhor do que qualquer outro, mas vincos bem marcados voam sempre mais longe.",
        "bulldog.step-05":
          "Aqui o papel tem quatro camadas. Carrega ao longo da dobra, não em cima dela.",
        "bulldog.step-07":
          "Dobra-a por cima da frente, não por baixo. O bloco rombo fica por fora.",
        "bulldog.step-09":
          "Dobra as duas asas à mesma distância do meio, ou o avião vai virar.",
        "bulldog.step-13": "Espreita pelo bico: as duas asas devem parecer quase ao nível.",
      },
    },

    harrier: {
      name: "O Harrier",
      description:
        "Um planador grande e lento. As asas são quase tão largas como o papel e o nariz vai dobrado plano em vez de em bico, por isso ele flutua em vez de correr. As barbatanas pequenas nas pontas das asas evitam que se desvie para um lado. Lançado com jeito, atravessa uma sala a pairar e pousa devagarinho.",
      throwTip:
        "Segura-o por baixo do corpo, mesmo atrás do nariz. Aponta um pouco para cima e larga-o com suavidade. Se o atirares com força, sobe, perde velocidade e cai de chapa.",
      titles: {
        "harrier.step-01": "Dobra ao meio",
        "harrier.step-02": "Volta a abrir",
        "harrier.step-03": "Traz o canto direito",
        "harrier.step-04": "Agora o canto esquerdo",
        "harrier.step-05": "Dobra a ponta para baixo",
        "harrier.step-06": "Dobra o avião todo ao meio",
        "harrier.step-07": "Baixa as asas largas",
        "harrier.step-08": "Vira-o ao contrário",
        "harrier.step-09": "Põe-no com o bico para cima",
        "harrier.step-10": "Dobra para cima a ponta da asa deste lado",
        "harrier.step-11": "E a ponta da asa do outro lado",
        "harrier.step-12": "Abre a asa deste lado",
        "harrier.step-13": "Abre a asa do outro lado",
      },
      steps: {
        "harrier.step-01":
          "Põe o papel ao alto, como uma porta. Dobra o bordo direito até encontrar o bordo esquerdo e passa o polegar ao longo da dobra para ela ficar marcada.",
        "harrier.step-02":
          "Volta a abrir o papel todo. Vais ver uma linha ao meio onde dobraste. Essa linha é o teu guia para tudo o resto.",
        "harrier.step-03":
          "Pega no canto de cima à direita e dobra-o para baixo e para dentro, de modo que o bordo de cima fique mesmo em cima da linha do meio. Alisa bem.",
        "harrier.step-04":
          "Faz exatamente o mesmo à esquerda: o canto de cima à esquerda para baixo e para dentro, até o bordo tocar na linha do meio. A parte de cima fica agora como um telhado em bico.",
        "harrier.step-05":
          "Não afies a ponta. Em vez disso dobra-a a direito para baixo, para que a ponta caia no sítio onde acabaram as duas dobras dos cantos. A frente fica plana e larga.",
        "harrier.step-06":
          "Dobra o avião todo ao meio pela linha do meio, mas para trás, para que as dobras que acabaste de fazer fiquem por fora.",
        "harrier.step-07":
          "Deita-o de lado. Dobra a camada de cima para baixo para fazer uma asa, mas desta vez começa a dobra bem perto do bordo dobrado, para a asa sair larga.",
        "harrier.step-08":
          "Vira o avião todo ao contrário para olhares para o outro lado. Dobra a segunda asa igual à primeira.",
        "harrier.step-09": "Põe o avião com o bico para cima e olha a direito pelo corpo.",
        "harrier.step-10":
          "Pega no bordo mais de fora da asa de cima, mais ou menos à largura de um polegar da ponta, e dobra-o para cima. Para a meio caminho. Não o esmagues.",
        "harrier.step-11":
          "Vira-o ao contrário e dobra a outra ponta de asa para cima na mesma medida. As duas barbatanas devem ser o espelho uma da outra.",
        "harrier.step-12":
          "Segura no corpo e levanta a asa de cima inteira até ficar quase ao nível. A barbatana que fizeste deve agora ficar de pé na ponta.",
        "harrier.step-13":
          "Vira-o ao contrário e levanta a outra asa da mesma maneira. Visto de frente deves ter duas asas largas e planas com duas pontas viradas para cima.",
      },
      explanations: {
        "harrier.step-01":
          "A linha do meio é a espinha do avião. Todas as dobras seguintes medem-se por ela.",
        "harrier.step-02":
          "Só precisavas da marca, não da dobra. Vincar e voltar a abrir é a maneira de deixares um guia para ti.",
        "harrier.step-03":
          "Estas dobras dos cantos amontoam papel à frente, e é esse peso que mantém o nariz a apontar em frente.",
        "harrier.step-05":
          "Uma frente plana é mais lenta do que um bico, e lento é exatamente o que este avião quer. Dobrar a ponta para baixo também impede que as abas dos cantos se abram sozinhas.",
        "harrier.step-06":
          "Dobrar para trás deixa os bordos grossos por fora, o que te dá uma quilha para segurar e mantém as asas ao nível.",
        "harrier.step-07":
          "Asas largas sustentam mais peso a menos velocidade. É esse todo o truque de um avião que flutua em vez de disparar.",
        "harrier.step-10":
          "Uma ponta de asa dobrada para cima funciona como um leme em cada extremidade. Se o avião começar a escorregar de lado, as barbatanas empurram-no outra vez a direito.",
        "harrier.step-12":
          "Asas planas apanham o ar por baixo. Com asas tão largas, até um lançamento suave dá ao avião muito onde se apoiar.",
        "harrier.step-13":
          "As duas asas têm de estar iguais. Se uma ficar mais alta do que a outra, o avião rola para esse lado em vez de planar direito.",
      },
      tips: {
        default:
          "Neste avião tudo depende de as asas ficarem iguaizinhas. Sempre que dobrares um lado, levanta-o e compara-o com o outro antes de carregares.",
        "harrier.step-05":
          "Aponta a ponta ao sítio onde os dois bordos inclinados se encontram e depois carrega.",
        "harrier.step-07":
          "Deixa só uma tira estreita ao meio para o corpo. Tudo o resto é asa.",
        "harrier.step-10": "Curva, não vinques. Uma barbatana esmagada não serve de nada.",
        "harrier.step-13": "Olha para ele de frente: duas asas largas, duas barbatanas de pé.",
      },
    },

    "sea-glider": {
      name: "O Planador do Mar",
      description:
        "Um planador comprido e calmo. Em vez de dobrares primeiro os cantos, enrolas o bordo da frente duas vezes, o que põe uma tira de papel pesado mesmo à frente. Esse peso no sítio certo faz com que siga uma linha comprida, plana e lenta, como uma gaivota sobre a água. É o que se aguenta mais tempo no ar de todo o hangar.",
      throwTip:
        "Segura-o por baixo do corpo, perto do meio. Aponta-o ao nível, ou um bocadinho acima, e empurra-o com suavidade em vez de o atirares.",
      titles: {
        "sea-glider.step-01": "Dobra ao meio",
        "sea-glider.step-02": "Volta a abrir",
        "sea-glider.step-03": "Enrola o bordo de cima",
        "sea-glider.step-04": "Enrola outra vez",
        "sea-glider.step-05": "Traz o canto direito",
        "sea-glider.step-06": "Agora o canto esquerdo",
        "sea-glider.step-07": "Dobra o avião todo ao meio",
        "sea-glider.step-08": "Baixa as asas largas",
        "sea-glider.step-09": "Vira-o ao contrário",
        "sea-glider.step-10": "Põe-no com o bico para cima",
        "sea-glider.step-11": "Abre a asa deste lado",
        "sea-glider.step-12": "Abre a asa do outro lado",
      },
      steps: {
        "sea-glider.step-01":
          "Põe o papel ao alto, como uma porta. Dobra o bordo direito até encontrar o bordo esquerdo e passa o polegar ao longo da dobra para ela ficar marcada.",
        "sea-glider.step-02":
          "Volta a abrir o papel todo. Vais ver uma linha ao meio onde dobraste. Essa linha é o teu guia para tudo o resto.",
        "sea-glider.step-03":
          "Dobra na tua direção todo o bordo de cima, cerca de três dedos de largura. Mantém o bordo dobrado ao nível do topo da folha e depois alisa bem.",
        "sea-glider.step-04":
          "Dobra essa tira grossa mais uma vez, outra vez a mesma medida. A frente do papel tem agora três camadas e está claramente mais rija.",
        "sea-glider.step-05":
          "Encontra o meio do novo bordo grosso da frente. Dobra o canto de cima à direita para baixo e para dentro, para que o bordo grosso fique em cima da linha do meio.",
        "sea-glider.step-06":
          "Faz o mesmo à esquerda. Os dois bordos grossos encontram-se agora ao meio e a frente acaba em bico.",
        "sea-glider.step-07":
          "Dobra o avião todo ao meio pela linha do meio, mas para trás, para que as dobras que acabaste de fazer fiquem por fora.",
        "sea-glider.step-08":
          "Deita-o de lado. Dobra a camada de cima para baixo para fazer uma asa, começando a dobra perto do bordo dobrado para a asa sair larga.",
        "sea-glider.step-09":
          "Vira o avião todo ao contrário para olhares para o outro lado. Dobra a segunda asa igual à primeira.",
        "sea-glider.step-10": "Põe o avião com o bico para cima e olha a direito pelo corpo.",
        "sea-glider.step-11":
          "Segura no corpo e levanta a asa de cima até ficar quase ao nível, como um avião a sério visto de frente.",
        "sea-glider.step-12":
          "Vira-o ao contrário e levanta a outra asa da mesma maneira. Duas asas compridas e planas, viradas só um bocadinho para cima, e está pronto.",
      },
      explanations: {
        "sea-glider.step-01":
          "A linha do meio é a espinha do avião. Todas as dobras seguintes medem-se por ela.",
        "sea-glider.step-02":
          "Só precisavas da marca, não da dobra. Vincar e voltar a abrir é a maneira de deixares um guia para ti.",
        "sea-glider.step-03":
          "Enrolar o bordo espalha o peso por toda a frente do avião em vez de o deixar num monte só. Espalhado assim, mantém o avião direito.",
        "sea-glider.step-04":
          "Duas voltas deixam o bordo da frente rijo além de pesado. Um bordo de ataque rijo não vibra, e uma asa que não vibra plana mais longe.",
        "sea-glider.step-05":
          "Dobrar o bordo pesado para dentro leva todo esse peso para o nariz, que é onde um planador precisa dele.",
        "sea-glider.step-07":
          "Dobrar para trás deixa os bordos grossos por fora, o que te dá uma quilha para segurar e mantém as asas ao nível.",
        "sea-glider.step-08":
          "Asas compridas e largas com uma cauda leve é a receita para um planeio lento e plano. Com asas estreitas este avião picava.",
        "sea-glider.step-11":
          "Asas planas apanham o ar por baixo, e aqui há muita asa para o apanhar.",
        "sea-glider.step-12":
          "As duas asas têm de estar iguais. Se uma ficar mais alta do que a outra, o avião rola para esse lado em vez de planar direito.",
      },
      tips: {
        default:
          "Cada dobra deste avião mede-se pela anterior, por isso um enrolar torto ao início aparece como um avião torto no fim.",
        "sea-glider.step-03":
          "Alinha os dois cantos de cima antes de carregares, ou o avião todo fica inclinado.",
        "sea-glider.step-04": "Dobra a tira sobre si mesma, não a folha inteira.",
        "sea-glider.step-08":
          "Deixa só uma tira estreita ao meio para o corpo. Tudo o resto é asa.",
        "sea-glider.step-12":
          "Se picar quando o lançares, dobra um pouco para cima os bordos mesmo de trás das asas.",
      },
    },

    hammer: {
      name: "O Martelo",
      description:
        "O peso-pesado. Enrolas a frente do papel sobre si mesma duas vezes antes de fazeres o nariz, por isso a ponta acabada tem seis camadas ou mais lá dentro. Todo esse peso à frente deixa-o furar o ar e voar muito longe. É o mais difícil de dobrar com jeito e o mais satisfatório de lançar.",
      throwTip:
        "Aperta o nariz grosso por baixo e lança-o com força, depressa e ligeiramente para cima. Este é o único avião que quer toda a tua força.",
      titles: {
        "hammer.step-01": "Dobra ao meio",
        "hammer.step-02": "Volta a abrir",
        "hammer.step-03": "Traz o canto direito",
        "hammer.step-04": "Agora o canto esquerdo",
        "hammer.step-05": "Enrola a ponta para trás",
        "hammer.step-06": "Enrola outra vez",
        "hammer.step-07": "Dobra o canto direito ao meio",
        "hammer.step-08": "Agora o canto esquerdo",
        "hammer.step-09": "Dobra o avião todo ao meio",
        "hammer.step-10": "Baixa as asas",
        "hammer.step-11": "Vira-o ao contrário",
        "hammer.step-12": "Põe-no com o bico para cima",
        "hammer.step-13": "Abre a asa deste lado",
        "hammer.step-14": "Abre a asa do outro lado",
      },
      steps: {
        "hammer.step-01":
          "Põe o papel ao alto, como uma porta. Dobra o bordo direito até encontrar o bordo esquerdo e passa o polegar ao longo da dobra para ela ficar marcada.",
        "hammer.step-02":
          "Volta a abrir o papel todo. Vais ver uma linha ao meio onde dobraste. Essa linha é o teu guia para tudo o resto.",
        "hammer.step-03":
          "Pega no canto de cima à direita e dobra-o para baixo e para dentro, de modo que o bordo de cima fique mesmo em cima da linha do meio. Alisa bem.",
        "hammer.step-04":
          "Faz exatamente o mesmo à esquerda. A parte de cima do papel fica agora como um telhado em bico.",
        "hammer.step-05":
          "Dobra a ponta a direito para baixo por cima do avião, para que a ponta caia onde acabaram as duas dobras dos cantos. A frente é agora um bordo plano.",
        "hammer.step-06":
          "Dobra essa frente plana outra vez, um pouco menos longe desta vez. O bordo da frente fica mais largo e muito mais grosso. Carrega com força.",
        "hammer.step-07":
          "Encontra o meio do bordo grosso da frente. Dobra o canto direito desse bordo para baixo e para dentro, até o bordo ficar em cima da linha do meio.",
        "hammer.step-08":
          "Faz o mesmo com o canto esquerdo. Aparece um bico novo, e todo o papel enrolado fica agora arrumado lá dentro.",
        "hammer.step-09":
          "Dobra o avião todo ao meio pela linha do meio, mas para trás, para que tudo o que acabaste de dobrar fique por fora.",
        "hammer.step-10":
          "Deita-o de lado. Dobra a camada de cima para baixo para fazer uma asa, começando no bico e indo até à cauda.",
        "hammer.step-11":
          "Vira o avião todo ao contrário para olhares para o outro lado. Dobra a segunda asa igual à primeira.",
        "hammer.step-12":
          "Põe o avião com o bico para cima e olha a direito pelo corpo. O nariz deve ser um bloco maciço que consegues apertar.",
        "hammer.step-13":
          "Segura no corpo e levanta a asa de cima até ficar ao nível, como um avião a sério visto de frente.",
        "hammer.step-14":
          "Vira-o ao contrário e levanta a outra asa da mesma maneira. Deixa estas asas mais planas do que nos planadores. Isto é um Martelo.",
      },
      explanations: {
        "hammer.step-01":
          "A linha do meio é a espinha do avião. Todas as dobras seguintes medem-se por ela.",
        "hammer.step-02":
          "Só precisavas da marca, não da dobra. Vincar e voltar a abrir é a maneira de deixares um guia para ti.",
        "hammer.step-03":
          "Estas dobras dos cantos são a primeira carga de papel a caminho do nariz. Tudo o que vem a seguir amontoa mais por cima.",
        "hammer.step-05":
          "Enrolar a ponta para trás em vez de a afiar duplica o papel à frente. Estás a construir peso, não um espeto.",
        "hammer.step-06":
          "Cada volta dobra uma faixa que já tem várias camadas. Duas voltas é tudo o que o papel aguenta continuando deitado.",
        "hammer.step-07":
          "Isto arrasta toda a barra enrolada para dentro do bico. É isso que torna o nariz tão mais pesado do que a cauda.",
        "hammer.step-09":
          "Dobrar para trás deixa os bordos grossos por fora, o que te dá uma quilha para segurar e mantém as asas ao nível.",
        "hammer.step-10":
          "Asas mais estreitas significam menos ar a empurrar ao contrário, por isso um avião pesado mantém a velocidade e vai mais longe antes de aterrar.",
        "hammer.step-13":
          "Um avião rápido e pesado precisa de menos sustentação, não de mais, por isso estas asas ficam mais planas do que as de um planador.",
        "hammer.step-14":
          "As duas asas têm de estar iguais. A esta velocidade, até uma diferença pequena manda o avião para uma curva.",
      },
      tips: {
        default:
          "Marca cada dobra com a unha e depois passa-a pelo canto da mesa. As dobras grossas abrem sozinhas se não as vincares a sério.",
        "hammer.step-05":
          "Não tenhas pressa. Se a ponta cair torta, todas as dobras a seguir saem tortas também.",
        "hammer.step-06": "Achata bem esta com algo duro, como as costas de uma colher.",
        "hammer.step-07":
          "Seis camadas é muito. Dobra devagar e segura o papel enquanto o fazes.",
        "hammer.step-14":
          "Espreita pelo bico: as asas devem parecer quase ao nível, não um V fundo.",
      },
    },

    "square-cruiser": {
      name: "O Cruzeiro Quadrado",
      description:
        "O único avião daqui que começa num quadrado, por isso a primeira coisa que fazes é fabricar um. Um quadrado dá-te asas curtas e largas e um corpo atarracado, e isso acaba por dar um voador calmo e sem pressas. Atravessa uma sala em linha reta sem grandes complicações.",
      throwTip:
        "Segura-o por baixo do corpo atrás do nariz e lança-o ao nível com um empurrão médio. Não quer velocidade, quer uma largada suave.",
      titles: {
        "square-cruiser.prep.letter-01": "Dobra um canto",
        "square-cruiser.prep.letter-02": "Volta a abrir",
        "square-cruiser.prep.letter-03": "Corta a tira que sobra",
        "square-cruiser.prep.a4-01": "Dobra um canto",
        "square-cruiser.prep.a4-02": "Volta a abrir",
        "square-cruiser.prep.a4-03": "Corta a tira que sobra",
        "square-cruiser.prep.index-01": "Dobra um canto",
        "square-cruiser.prep.index-02": "Volta a abrir",
        "square-cruiser.prep.index-03": "Corta a tira que sobra",
        "square-cruiser.step-01": "Dobra ao meio",
        "square-cruiser.step-02": "Volta a abrir",
        "square-cruiser.step-03": "Traz o canto direito",
        "square-cruiser.step-04": "Agora o canto esquerdo",
        "square-cruiser.step-05": "Dobra a ponta para baixo",
        "square-cruiser.step-06": "Dobra o canto direito ao meio",
        "square-cruiser.step-07": "Agora o canto esquerdo",
        "square-cruiser.step-08": "Dobra o avião todo ao meio",
        "square-cruiser.step-09": "Baixa as asas",
        "square-cruiser.step-10": "Vira-o ao contrário",
        "square-cruiser.step-11": "Põe-no com o bico para cima",
        "square-cruiser.step-12": "Abre a asa deste lado",
        "square-cruiser.step-13": "Abre a asa do outro lado",
      },
      steps: {
        "square-cruiser.prep.letter-01":
          "Põe a folha ao alto. Dobra o canto de cima à esquerda por cima e para baixo, até o bordo de cima ficar exatamente em cima do bordo da direita. Alisa a dobra.",
        "square-cruiser.prep.letter-02":
          "Volta a abrir o papel. A dobra deixou uma linha a atravessar a folha. Tudo o que está acima dessa linha é um quadrado perfeito.",
        "square-cruiser.prep.letter-03":
          "Corta pela linha e fica com o quadrado. Põe a tira que sobra de lado, não vais precisar dela.",
        "square-cruiser.prep.a4-01":
          "Põe a folha ao alto. Dobra o canto de cima à esquerda por cima e para baixo, até o bordo de cima ficar exatamente em cima do bordo da direita. Alisa a dobra.",
        "square-cruiser.prep.a4-02":
          "Volta a abrir o papel. A dobra deixou uma linha a atravessar a folha. Tudo o que está acima dessa linha é um quadrado perfeito.",
        "square-cruiser.prep.a4-03":
          "Corta pela linha e fica com o quadrado. Põe a tira que sobra de lado, não vais precisar dela.",
        "square-cruiser.prep.index-01":
          "Põe a ficha ao alto. Dobra o canto de cima à esquerda por cima e para baixo, até o bordo de cima ficar exatamente em cima do bordo da direita. Alisa a dobra.",
        "square-cruiser.prep.index-02":
          "Volta a abrir a ficha. A dobra deixou uma linha a atravessá-la. Tudo o que está acima dessa linha é um quadrado perfeito.",
        "square-cruiser.prep.index-03":
          "Corta pela linha e fica com o quadrado. É um quadrado pequeno e rijo, por isso espera um avião pequeno que não plana muito longe.",
        "square-cruiser.step-01":
          "Põe o quadrado à tua frente. Dobra o bordo direito até encontrar o bordo esquerdo, passa o dedo ao longo da dobra, e tens a tua linha do meio.",
        "square-cruiser.step-02":
          "Volta a abrir todo. A linha ao meio é o teu guia para tudo o resto.",
        "square-cruiser.step-03":
          "Dobra o canto de cima à direita para baixo e para dentro, para que o bordo de cima fique em cima da linha do meio. Num quadrado, esse canto chega mesmo ao centro da folha.",
        "square-cruiser.step-04":
          "Faz o mesmo à esquerda. A metade de cima do quadrado é agora um triângulo grande assente na metade de baixo.",
        "square-cruiser.step-05":
          "Dobra a ponta desse triângulo a direito para baixo, para que caia no meio do quadrado. A frente fica plana e larga.",
        "square-cruiser.step-06":
          "Dobra o canto direito da nova frente plana para baixo e para dentro até à linha do meio, para que apareça um bico novo por cima da aba que acabaste de dobrar.",
        "square-cruiser.step-07":
          "Faz o mesmo à esquerda. Os dois cantos encontram-se ao meio e seguram no sítio a aba que está por baixo.",
        "square-cruiser.step-08":
          "Dobra o avião todo ao meio pela linha do meio, mas para trás, para que tudo o que acabaste de dobrar fique por fora.",
        "square-cruiser.step-09":
          "Deita-o de lado. Dobra a camada de cima para baixo para fazer uma asa, começando no bico e indo até à cauda.",
        "square-cruiser.step-10":
          "Vira o avião todo ao contrário para olhares para o outro lado. Dobra a segunda asa igual à primeira.",
        "square-cruiser.step-11": "Põe o avião com o bico para cima e olha a direito pelo corpo.",
        "square-cruiser.step-12":
          "Segura no corpo e levanta a asa de cima até ficar quase ao nível, como um avião a sério visto de frente.",
        "square-cruiser.step-13":
          "Vira-o ao contrário e levanta a outra asa da mesma maneira. Asas curtas, largas e ao nível, e o Cruzeiro está pronto.",
      },
      explanations: {
        "square-cruiser.prep.letter-01":
          "Dobrar um bordo por cima do bordo do lado é a maneira de encontrar um quadrado sem régua. A dobra mede por ti.",
        "square-cruiser.prep.letter-03":
          "Um quadrado faz asas curtas e largas. Se começasses com uma folha comprida, saía um avião completamente diferente.",
        "square-cruiser.prep.a4-01":
          "Dobrar um bordo por cima do bordo do lado é a maneira de encontrar um quadrado sem régua. A dobra mede por ti.",
        "square-cruiser.prep.a4-03":
          "Um quadrado faz asas curtas e largas. Se começasses com uma folha comprida, saía um avião completamente diferente.",
        "square-cruiser.prep.index-01":
          "Dobrar um bordo por cima do bordo do lado é a maneira de encontrar um quadrado sem régua. A dobra mede por ti.",
        "square-cruiser.prep.index-03":
          "Um quadrado faz asas curtas e largas. Se começasses com uma folha comprida, saía um avião completamente diferente.",
        "square-cruiser.step-01":
          "A linha do meio é a espinha do avião. Todas as dobras seguintes medem-se por ela.",
        "square-cruiser.step-02":
          "Só precisavas da marca, não da dobra. Vincar e voltar a abrir é a maneira de deixares um guia para ti.",
        "square-cruiser.step-03":
          "Num quadrado estas dobras dos cantos são enormes, por isso metade da folha acaba dobrada à frente. É daí que vem o peso do avião.",
        "square-cruiser.step-05":
          "Dobrar a ponta para baixo deixa o nariz rombo e impede que se espete no chão em cada aterragem.",
        "square-cruiser.step-06":
          "Estes dois cantos trancam a aba que está por baixo para que o nariz não se abra no ar.",
        "square-cruiser.step-08":
          "Dobrar para trás deixa os bordos grossos por fora, o que te dá uma quilha para segurar e mantém as asas ao nível.",
        "square-cruiser.step-09":
          "Uma folha quadrada é curta para a largura que tem, por isso estas asas saem largas e atarracadas. É isso que torna o Cruzeiro tão estável.",
        "square-cruiser.step-12":
          "Asas planas apanham o ar por baixo. As asas curtas têm de estar ao nível para funcionarem.",
        "square-cruiser.step-13":
          "As duas asas têm de estar iguais. Se uma ficar mais alta do que a outra, o avião rola para esse lado em vez de cruzar direito.",
      },
      tips: {
        default:
          "Tudo neste avião se mede a partir da linha do meio e dos cantos, por isso funciona com qualquer tamanho de quadrado que consigas fazer.",
        "square-cruiser.prep.a4-01":
          "Vai deslizando o canto até o bordo de cima assentar exatamente no bordo do lado, e só depois carrega.",
        "square-cruiser.prep.a4-03":
          "Pede ajuda a uma pessoa adulta antes de usares a tesoura, e corta pela dobra, não ao lado dela.",
        "square-cruiser.prep.letter-03":
          "Pede ajuda a uma pessoa adulta antes de usares a tesoura, e corta pela dobra, não ao lado dela.",
        "square-cruiser.prep.index-03":
          "Aqui o papel de impressora funciona melhor do que a cartolina. A cartolina é rija e não segura as dobras do nariz.",
        "square-cruiser.step-03":
          "O canto deve cair mesmo no centro do quadrado. Usa isso como verificação.",
        "square-cruiser.step-06":
          "Não mexas na aba de baixo. Só os dois cantos novos é que se mexem.",
        "square-cruiser.step-13": "Espreita pelo bico: duas asas curtas, quase ao nível.",
      },
    },
  },
  glossary: {
    "valley-fold": {
      term: "Dobra de vale",
      definition: "Uma dobra cujo vinco afunda como um vale. O papel dobra na tua direção.",
    },
    "mountain-fold": {
      term: "Dobra de montanha",
      definition:
        "O contrário da dobra de vale: o vinco aponta para cima como uma montanha, e o papel dobra para longe de ti.",
    },
    crease: {
      term: "Vinco",
      definition: "A linha afiada que fica depois de dobrares o papel e o alisares bem.",
    },
    "center-line": {
      term: "Linha do meio",
      definition:
        "O vinco que desce pelo meio do papel e que usas como guia para as outras dobras.",
    },
    "blunt-nose": {
      term: "Nariz rombo",
      definition:
        "Um nariz feito dobrando a ponta afiada sobre si mesma, de forma que a frente do avião fica plana e grossa em vez de bicuda.",
    },
    hem: {
      term: "Bainha",
      definition:
        "Uma tira dobrada ao longo de um bordo direito, como a bainha de uma camisa. Enrola-a duas vezes e esse bordo fica grosso e pesado.",
    },
    "partial-fold": {
      term: "Dobra a meio",
      definition:
        "Uma dobra que paras a meio caminho, de forma que o papel se curva e fica inclinado em vez de assentar plano.",
    },
    "tip-fin": {
      term: "Barbatana de ponta",
      definition:
        "Um pedacinho na ponta de uma asa que fica dobrado para cima. Impede que o avião deslize de lado pelo ar.",
    },
    "square-from-rectangle": {
      term: "Fazer um quadrado",
      definition:
        "Dobra um bordo da folha por cima do bordo do lado. A dobra marca o maior quadrado que cabe dentro da folha, pronto a cortar.",
    },
  },
};

export default planes;
export { planes };
