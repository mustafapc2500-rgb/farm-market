export function whatsappUrl(number: string | undefined, productName?: string) {
  const clean = number?.trim() ?? "";
  if (!/^[1-9]\d{6,14}$/.test(clean)) return null;
  const message = productName
    ? `مرحبًا فارم ماركت! أود الاستفسار عن خدمة «${productName}» ومعرفة تفاصيلها.`
    : "مرحبًا فارم ماركت! أود معرفة المزيد عن خدمات تصميم وتخطيط المزارع.";
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
