export type CategoryId = "consultation" | "layout" | "coaching" | "decoration";
export interface Product {
  id: string;
  title: string;
  category: CategoryId;
  description: string;
  fullDescription: string;
  price: number;
  available: boolean;
  featured?: boolean;
  art: "meadow" | "orchard" | "village" | "garden" | "sunset" | "plan";
  includes: string[];
}
export const categories: {
  id: CategoryId;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    id: "consultation",
    title: "استشارات المزارع",
    description: "أفكار صغيرة، فرق كبير",
    color: "sage",
  },
  {
    id: "layout",
    title: "تخطيط المزارع",
    description: "كل زاوية في مكانها",
    color: "yellow",
  },
  {
    id: "coaching",
    title: "تدريب وإرشاد",
    description: "ازرع مهارتك، خطوة بخطوة",
    color: "peach",
  },
  {
    id: "decoration",
    title: "تصاميم وديكورات",
    description: "لمسة تشبه ذوقك",
    color: "blue",
  },
];
export const products: Product[] = [
  {
    id: "cozy-farm",
    title: "تصميم مزرعة ريفية دافئة",
    category: "decoration",
    description: "ممرات جميلة وزوايا خضراء تحكي حكايتك.",
    fullDescription:
      "تصوّر بصري مخصص لمزرعتك الافتراضية بأسلوب ريفي دافئ. ننسّق الممرات والأشجار والمساحات الزخرفية، ونشارك معك مخططًا واضحًا لتطبيقه بنفسك داخل اللعبة. الخدمة تصميم وإرشاد فقط ولا تحتاج إلى مشاركة حسابك.",
    price: 29.9,
    available: true,
    featured: true,
    art: "meadow",
    includes: [
      "لوحة ألوان وأفكار متناسقة",
      "مخطط بصري لتوزيع الديكور",
      "جولة تعديل واحدة على التصميم",
    ],
  },
  {
    id: "smart-layout",
    title: "مخطط مزرعة متكامل",
    category: "layout",
    description: "مساحة مرتبة، وتفاصيل تجعل اللعب أسهل.",
    fullDescription:
      "جلسة تخطيط لتوزيع مناطق الإنتاج والزراعة والديكور في مزرعتك الافتراضية. نعتمد على الصور التي تشاركها وعلى أولوياتك لنقترح توزيعًا عمليًا وجميلًا، مع ملف إرشادي يمكنك الرجوع إليه.",
    price: 39.9,
    available: true,
    featured: true,
    art: "plan",
    includes: [
      "دراسة المساحة من صورك",
      "مخطط توزيع رقمي",
      "شرح خطوات تنفيذ المخطط",
    ],
  },
  {
    id: "farm-consultation",
    title: "جلسة إلهام لمزرعتك",
    category: "consultation",
    description: "نسمع أفكارك ونحوّلها إلى بداية جميلة.",
    fullDescription:
      "استشارة فردية عن بُعد لمناقشة أفكار مزرعتك الافتراضية، حل ازدحام المساحات، واختيار طابع بصري يناسبك. تحصل بعد الجلسة على ملخص عملي بالأفكار والخطوات المقترحة.",
    price: 14.9,
    available: true,
    featured: true,
    art: "orchard",
    includes: [
      "جلسة استشارة لمدة ٣٠ دقيقة",
      "اقتراحات تناسب أسلوبك",
      "ملخص رقمي بعد الجلسة",
    ],
  },
  {
    id: "garden-corner",
    title: "ركن الحديقة الحالمة",
    category: "decoration",
    description: "زهور وألوان وتفاصيل تستحق التوقف.",
    fullDescription:
      "تصميم ركن زخرفي صغير مستوحى من حدائق الريف. مناسب لمن يريد تجديد جزء من مزرعته الافتراضية دون إعادة تخطيطها بالكامل. نرسل لك تصورًا رقميًا واضحًا مع بدائل للعناصر.",
    price: 19.9,
    available: true,
    featured: true,
    art: "garden",
    includes: [
      "تصميم ركن واحد",
      "قائمة عناصر مقترحة وبدائلها",
      "تعديل واحد للألوان",
    ],
  },
  {
    id: "coaching-start",
    title: "خطوتك الأولى في المزرعة",
    category: "coaching",
    description: "إرشاد هادئ لتجربة لعب أكثر متعة.",
    fullDescription:
      "جلسة تدريب للمبتدئين تركّز على تنظيم وقت اللعب وفهم أولويات تطوير المزرعة الافتراضية. إرشاد تعليمي فقط، دون دخول إلى الحساب أو بيع موارد أو ضمان نتائج داخل اللعبة.",
    price: 24.9,
    available: true,
    art: "village",
    includes: [
      "جلسة إرشاد لمدة ٤٥ دقيقة",
      "خطة أهداف تناسب وقتك",
      "إجابات عن أسئلتك أثناء الجلسة",
    ],
  },
  {
    id: "sunset-estate",
    title: "تصميم ريفي عند الغروب",
    category: "decoration",
    description: "لوحة ريفية بألوان الشمس الذهبية.",
    fullDescription:
      "تصميم موسمي لمزرعتك الافتراضية بألوان دافئة وتكوين هادئ. هذا المثال غير متاح حاليًا للحجز، ويمكنك تصفح خدمات التصميم الأخرى المتاحة.",
    price: 34.9,
    available: false,
    art: "sunset",
    includes: ["تصور بصري موسمي", "توزيع عناصر الديكور", "لوحة ألوان دافئة"],
  },
];
// Repository boundary: replace this adapter with Supabase in a later phase.
export const productRepository = {
  list: () => products,
  get: (id: string) => products.find((p) => p.id === id),
};
