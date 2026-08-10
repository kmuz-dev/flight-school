/**
 * Arabic site chrome. Translated from ui/en.ts key for key; `{placeholder}`
 * slots must survive translation or format() leaves a gap in the sentence.
 *
 * The page runs under dir="rtl" (app/[locale]/layout.tsx), so nothing here
 * needs directional markup. Two things that do need care: measurements like
 * "210 x 297 mm" are bidi-neutral runs inside RTL text and reorder correctly on
 * their own, and left/right in FOLDING instructions is a physical direction on
 * the table, not a reading direction, so it is translated literally and never
 * mirrored. The geometry does not mirror either (SPEC.md §5).
 */
import type { UiDictionary } from "../types";

const ui: UiDictionary = {
  "brand.name": "مدرسة الطيران",

  "nav.hangar": "الحظيرة",
  "nav.logbook": "سجلّي",
  "nav.wings": "الأجنحة: {count}",
  "nav.backToHangar": "العودة إلى الحظيرة",
  "nav.dayFlight": "طيران نهاري",
  "nav.nightFlight": "طيران ليلي",

  "hangar.title": "الحظيرة",
  "hangar.subtitle": "اختر طائرة. كل طيّة تُعرض بأبعاد ثلاثية، من الورقة المستوية إلى أول تحليق.",
  "hangar.eyebrow": "مدرسة طيران للورق - {count} طائرات في الساحة",
  "hangar.steps": "الخطوات",
  "hangar.wingsEarned": "الأجنحة المكتسبة",
  "hangar.filterAll": "الكل",
  "hangar.filterLabel": "تصفية الأسطول حسب الرخصة",
  "hangar.fleetOverview": "نظرة عامة على الأسطول",
  "hangar.preview": "شاهد {name} بأبعاد ثلاثية",
  "hangar.empty": "لا توجد بعد طائرات بهذه الرخصة.",
  "hangar.footerLine": "كشف الطلاب - الرخصة رقم 0815-FA",

  "tier.easy": "مبتدئ",
  "tier.medium": "طيّار",
  "tier.advanced": "بارع",

  "tutorial.license.easy": "رخصة المبتدئ",
  "tutorial.license.medium": "رخصة الطيّار",
  "tutorial.license.advanced": "رخصة البارع",

  "rating.speed": "السرعة",
  "rating.distance": "المسافة",
  "rating.airtime": "زمن التحليق",
  "rating.ease": "السهولة",
  "rating.gauge": "{label}: {value} من 5",

  "preflight.eyebrow": "ما قبل الإقلاع",
  "preflight.getYourPaper": "ما قبل الإقلاع: أحضر ورقتك",
  "preflight.paper": "الورق",
  "preflight.weight": "السماكة",
  "preflight.folds": "الطيّات",
  "preflight.time": "الوقت",
  "preflight.creases": "الثنيات",
  "preflight.creasesAllValley": "كلها طيّات وادٍ",
  "preflight.creasesMix": "{valley} وادٍ، {mountain} جبل",
  "preflight.paperValue.letter-a4": "A4 أو Letter، ورقة واحدة",
  "preflight.paperValue.square": "مربّع مقصوص من A4 أو Letter",
  "preflight.weightValue": "80 غم/م²، ورق طابعة عادي",
  "preflight.foldsValue": "{count} طيّة",
  "preflight.flightProfile": "خصائص التحليق",
  "preflight.specimen": "شكل 1.1 - نموذج أولي",
  "preflight.manifestLine": "الطائرة {index} من {total} في الحظيرة",
  "preflight.viewerLabel": "الطائرة المكتملة، يمكنك تدويرها",
  "preflight.throwTip": "نصيحة الرمي",
  "preflight.paperQuestion": "أي ورق لديك؟",
  "preflight.paperChoice.a4": "A4",
  "preflight.paperChoice.letter": "US Letter",
  "preflight.paperChoice.square": "مربّع",
  "preflight.paperChoice.index-4x6": "بطاقة 4x6",
  "preflight.paperNeedsPrep": "{count} خطوات إضافية أولاً، لقصّها إلى الشكل الصحيح",
  "preflight.paperNoPrep": "اطوِ من هذه مباشرة، بلا قصّ",
  "preflight.startFolding": "ابدأ الطي",
  "preflight.resume": "تابع من الخطوة {step}",
  "preflight.orbitHint": "اسحب للتدوير",

  "tutorial.backToHangar": "الحظيرة",
  "tutorial.exit": "خروج",
  "tutorial.progressLabel": "{current} / {total}",
  "tutorial.stageLabel": "طاولة الطي",
  "tutorial.viewHint": "اسحب للتدوير",
  "tutorial.cameraGroupLabel": "زاوية الكاميرا",
  "tutorial.camera.front": "أمامية",
  "tutorial.camera.threeQuarter": "3/4",
  "tutorial.camera.top": "علوية",
  "tutorial.playingFold": "تشغيل الطيّة {step}",
  "tutorial.pausedFold": "متوقف - الطيّة {step}",
  "tutorial.transportLabel": "أدوات التشغيل",
  "tutorial.play": "شغّل الطيّة",
  "tutorial.pause": "أوقف الطيّة",
  "tutorial.prevStep": "إلى الطيّة السابقة",
  "tutorial.nextStep": "إلى الطيّة التالية",
  "tutorial.replay": "أعد هذه الطيّة",
  "tutorial.stepLabel": "الخطوة {current} / {total}",
  "tutorial.timeReadout": "{elapsed} / {total} - السرعة {speed}x",
  "tutorial.scrubLabel": "التنقل داخل الطيّة",
  "tutorial.stripLabel": "الانتقال إلى خطوة",
  "tutorial.goToStep": "انتقل إلى الخطوة {step}",
  "tutorial.stepRegionLabel": "الخطوة الحالية",
  "tutorial.why": "لماذا",
  "tutorial.foldTerms": "مصطلحات الطي",
  "tutorial.selfCheck": "ورقتي تبدو هكذا",
  "tutorial.back": "رجوع",
  "tutorial.nextFold": "الطيّة التالية",
  "tutorial.finish": "إنهاء",
  "tutorial.foldsToWings": "{count} طيّات تفصلك عن أجنحتك",
  "tutorial.tipLabel": "نصيحة:",

  "tutorial.paper.a4": "A4 - 210 x 297 مم",
  "tutorial.paper.letter": "Letter - 8.5 x 11 بوصة",
  "tutorial.paper.square": "مربّع - 210 x 210 مم",
  "tutorial.paper.index-4x6": "بطاقة فهرسة - 4 x 6 بوصة",

  "completion.eyebrow": "اكتملت المهمة",
  "completion.title": "لقد نلت أجنحتك.",
  "completion.body":
    "أحسنت أيها الطالب. ابحث عن مكان واسع، وجّهها إلى أعلى قليلاً، وارمها بشكل مستوٍ.",
  "completion.certificateLabel": "شهادة طيران",
  "completion.certified": "معتمدة",
  "completion.rewardIssued": "مُنحت المكافأة",
  "completion.wingsBadge": "أجنحة {tier}",
  "completion.logFlight": "سجّل رحلتك",
  "completion.returnToHangar": "العودة إلى الحظيرة",
  "completion.foldAgain": "اطوِها مرة أخرى",
  "completion.statsLabel": "سجل الرحلة",
  "completion.statFolds": "الطيّات",
  "completion.statCertified": "معتمدة",
  "completion.statWings": "الأجنحة",
  "completion.nextInHangar": "التالية في الحظيرة",
  "completion.nextMeta": "{folds} طيّة، {license}",
  "completion.foldNextPlane": "اطوِ الطائرة التالية",
  "completion.allComplete": "كانت تلك آخر طائرة في الساحة. كل طائرات الحظيرة صارت لك.",

  "error.title": "تفكّكت هذه الطائرة.",
  "error.body":
    "حدث خطأ ما في هذه الشاشة. تقدّمك محفوظ، فيمكنك المتابعة من حيث توقّفت تمامًا.",
  "error.retry": "حاول من جديد",

  "a11y.themeToggle": "التبديل بين الطيران النهاري والليلي",
  "a11y.localePicker": "اختر لغة",
};

export default ui;
export { ui };
