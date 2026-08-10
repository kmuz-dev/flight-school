/**
 * Japanese site chrome. Translated from ui/en.ts key for key; `{placeholder}`
 * slots must survive translation or format() leaves a gap in the sentence.
 *
 * Written in the plain, friendly register the English uses with a ten-year-old:
 * です・ます, no honorific stacking, no 漢語 where a everyday word will do.
 */
import type { UiDictionary } from "../types";

const ui: UiDictionary = {
  "brand.name": "フライトスクール",

  "nav.hangar": "ハンガー",
  "nav.logbook": "わたしの記録",
  "nav.wings": "ウイング: {count}",
  "nav.backToHangar": "ハンガーにもどる",
  "nav.dayFlight": "昼のフライト",
  "nav.nightFlight": "夜のフライト",

  "hangar.title": "ハンガー",
  "hangar.subtitle":
    "機体をえらんでください。どの折り方も3Dで見られます。まっさらな紙から初飛行まで。",
  "hangar.eyebrow": "紙のためのフライトスクール - 駐機中の機体 {count} 機",
  "hangar.steps": "ステップ",
  "hangar.wingsEarned": "獲得したウイング",
  "hangar.filterAll": "すべて",
  "hangar.filterLabel": "ライセンスで機体をしぼりこむ",
  "hangar.fleetOverview": "機体一覧",
  "hangar.preview": "{name} を3Dで見る",
  "hangar.empty": "そのライセンスの機体はまだありません。",
  "hangar.footerLine": "訓練生名簿 - ライセンス番号 0815-FA",

  "tier.easy": "ビギナー",
  "tier.medium": "パイロット",
  "tier.advanced": "エース",

  "tutorial.license.easy": "ビギナー・ライセンス",
  "tutorial.license.medium": "パイロット・ライセンス",
  "tutorial.license.advanced": "エース・ライセンス",

  "rating.speed": "スピード",
  "rating.distance": "飛距離",
  "rating.airtime": "滞空時間",
  "rating.ease": "折りやすさ",
  "rating.gauge": "{label}: 5 段階中 {value}",

  "preflight.eyebrow": "フライト前の準備",
  "preflight.getYourPaper": "準備: 紙を用意しよう",
  "preflight.paper": "紙",
  "preflight.weight": "厚さ",
  "preflight.folds": "折り",
  "preflight.time": "時間",
  "preflight.creases": "折りすじ",
  "preflight.creasesAllValley": "すべて谷折り",
  "preflight.creasesMix": "谷折り {valley}、山折り {mountain}",
  "preflight.paperValue.letter-a4": "A4 かレター、1枚",
  "preflight.paperValue.square": "A4 かレターから切り出した正方形",
  "preflight.weightValue": "80 g/m²、ふつうのコピー用紙",
  "preflight.foldsValue": "{count} 回の折り",
  "preflight.flightProfile": "飛びかた",
  "preflight.specimen": "図 1.1 - 試作機",
  "preflight.manifestLine": "ハンガーの {total} 機のうち {index} 機目",
  "preflight.viewerLabel": "完成した機体。まわして見られます",
  "preflight.throwTip": "投げかたのコツ",
  "preflight.paperQuestion": "どんな紙を持っていますか？",
  "preflight.paperChoice.a4": "A4",
  "preflight.paperChoice.letter": "US レター",
  "preflight.paperChoice.square": "正方形",
  "preflight.paperChoice.index-4x6": "4x6 カード",
  "preflight.paperNeedsPrep": "先に {count} ステップ、正しい形に切りそろえます",
  "preflight.paperNoPrep": "切らずに、この紙のまま折りはじめられます",
  "preflight.startFolding": "折りはじめる",
  "preflight.resume": "ステップ {step} からつづける",
  "preflight.orbitHint": "ドラッグでまわす",

  "tutorial.backToHangar": "ハンガー",
  "tutorial.exit": "やめる",
  "tutorial.progressLabel": "{current} / {total}",
  "tutorial.stageLabel": "折り台",
  "tutorial.viewHint": "ドラッグでまわす",
  "tutorial.cameraGroupLabel": "カメラの向き",
  "tutorial.camera.front": "正面",
  "tutorial.camera.threeQuarter": "3/4",
  "tutorial.camera.top": "真上",
  "tutorial.playingFold": "折り {step} を再生中",
  "tutorial.pausedFold": "一時停止 - 折り {step}",
  "tutorial.transportLabel": "再生コントロール",
  "tutorial.play": "折りを再生する",
  "tutorial.pause": "折りを止める",
  "tutorial.prevStep": "前の折りへ",
  "tutorial.nextStep": "次の折りへ",
  "tutorial.replay": "この折りをもう一度",
  "tutorial.stepLabel": "ステップ {current} / {total}",
  "tutorial.timeReadout": "{elapsed} / {total} - 速さ {speed}x",
  "tutorial.scrubLabel": "折りの途中を前後にうごかす",
  "tutorial.stripLabel": "ステップにジャンプ",
  "tutorial.goToStep": "ステップ {step} へ",
  "tutorial.stepRegionLabel": "いまのステップ",
  "tutorial.why": "なぜ",
  "tutorial.foldTerms": "折り紙のことば",
  "tutorial.selfCheck": "わたしの紙もこうなった",
  "tutorial.back": "もどる",
  "tutorial.nextFold": "次の折り",
  "tutorial.finish": "完成",
  "tutorial.foldsToWings": "ウイングまであと {count} 回",
  "tutorial.tipLabel": "コツ:",

  "tutorial.paper.a4": "A4 - 210 x 297 mm",
  "tutorial.paper.letter": "レター - 8.5 x 11 インチ",
  "tutorial.paper.square": "正方形 - 210 x 210 mm",
  "tutorial.paper.index-4x6": "インデックスカード - 4 x 6 インチ",

  "completion.eyebrow": "ミッション完了",
  "completion.title": "ウイングを手に入れました。",
  "completion.body":
    "よくできました、訓練生。広いところへ行って、少し上に向けて、水平に投げてみましょう。",
  "completion.certificateLabel": "飛行証明書",
  "completion.certified": "認定",
  "completion.rewardIssued": "記章を授与",
  "completion.wingsBadge": "{tier} ウイング",
  "completion.logFlight": "フライトを記録する",
  "completion.returnToHangar": "ハンガーにもどる",
  "completion.foldAgain": "もう一度折る",
  "completion.statsLabel": "飛行記録",
  "completion.statFolds": "折り",
  "completion.statCertified": "認定",
  "completion.statWings": "ウイング",
  "completion.nextInHangar": "ハンガーの次の機体",
  "completion.nextMeta": "{folds} 回の折り、{license}",
  "completion.foldNextPlane": "次の機体を折る",
  "completion.allComplete":
    "これが最後の機体でした。ハンガーの全機がきみのものです。",

  "error.title": "この機体はばらばらになりました。",
  "error.body":
    "この画面で何かがうまくいきませんでした。進みぐあいは保存してあるので、やめたところからそのまま続けられます。",
  "error.retry": "もう一度ためす",

  "a11y.themeToggle": "昼のフライトと夜のフライトを切りかえる",
  "a11y.localePicker": "言語をえらぶ",
};

export default ui;
export { ui };
