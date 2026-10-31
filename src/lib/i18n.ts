// Keep shared interface copy centralized; future locales can implement this shape.
export const locales = {
  ar: {
    direction: "rtl",
    home: "الرئيسية",
    products: "المنتجات",
    categories: "الأقسام",
    about: "من نحن",
    contact: "تواصل معنا",
    browse: "تصفح المنتجات",
    details: "عرض التفاصيل",
    sample: "نموذج تجريبي",
  },
} as const;
export const locale = "ar";
export const t = locales[locale];
export const price = (value: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    value,
  );
