import { Search, SlidersHorizontal, X, Leaf, ArrowLeft } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { categories, productRepository } from "../data/products";
import { ProductCard } from "../components/ProductCard";
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const query = params.get("q") || "";
  const sort = params.get("sort") || "featured";
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .toLowerCase()
      .trim();
  const items = productRepository
    .list()
    .filter(
      (p) =>
        (!category || p.category === category) &&
        normalize(p.title + " " + p.description).includes(normalize(query)),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : Number(!!b.featured) - Number(!!a.featured),
    );
  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span>المنتجات</span>
          </div>
          <div className="eyebrow">
            <Leaf size={15} />
            أفكار تنمو معك
          </div>
          <h1>
            شيء جميل لكل مزرعة<span>.</span>
          </h1>
          <p>
            اكتشف خدمات التصميم والتخطيط والإرشاد. اختر ما يلهمك، ودعنا نهتم
            بالباقي.
          </p>
          <span className="banner-flower">✳</span>
        </div>
      </section>
      <section className="section catalog-section">
        <div className="container">
          <div className="catalog-toolbar">
            <div className="search-field">
              <Search size={19} />
              <input
                aria-label="ابحث عن خدمة"
                placeholder="ما الذي تبحث عنه لمزرعتك؟"
                value={query}
                onChange={(e) => update("q", e.target.value)}
              />
              {query && (
                <button aria-label="مسح البحث" onClick={() => update("q", "")}>
                  <X size={17} />
                </button>
              )}
            </div>
            <label className="sort-field">
              <SlidersHorizontal size={17} />
              <span>الترتيب:</span>
              <select
                aria-label="ترتيب المنتجات"
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
              >
                <option value="featured">المميزة أولًا</option>
                <option value="low">السعر: الأقل أولًا</option>
                <option value="high">السعر: الأعلى أولًا</option>
              </select>
            </label>
          </div>
          <div
            className="filter-chips"
            role="group"
            aria-label="تصفية حسب القسم"
          >
            <button
              className={!category ? "selected" : ""}
              aria-pressed={!category}
              onClick={() => update("category", "")}
            >
              جميع الخدمات
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                aria-pressed={category === c.id}
                className={category === c.id ? "selected" : ""}
                onClick={() => update("category", c.id)}
              >
                {c.title}
              </button>
            ))}
          </div>
          <div className="catalog-results">
            <span aria-live="polite">
              {items.length} خدمات{" "}
              {category ? "في هذا القسم" : "بانتظار أفكارك"}
            </span>
            <span>كل المنتجات نماذج تجريبية</span>
          </div>
          {items.length ? (
            <div className="product-grid catalog-grid">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={38} />
              <h2>لم نعثر على هذه الفكرة بعد</h2>
              <p>جرّب كلمات أخرى أو استكشف جميع خدماتنا.</p>
              <button className="button primary" onClick={() => setParams({})}>
                عرض جميع الخدمات
                <ArrowLeft size={17} />
              </button>
            </div>
          )}
          <div className="catalog-help">
            <SproutIcon />
            <div>
              <h3>لم تجد ما يشبه فكرتك؟</h3>
              <p>يسعدنا أن نسمع رؤيتك ونقترح الخدمة المناسبة.</p>
            </div>
            <Link className="text-link" to="/contact">
              دعنا نتحدث
              <ArrowLeft size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
function SproutIcon() {
  return <Leaf size={35} strokeWidth={1.2} />;
}
