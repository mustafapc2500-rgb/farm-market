import { useParams, Link } from "react-router-dom";
import {
  Check,
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Palette,
  Image,
} from "lucide-react";
import { productRepository, categories, products } from "../data/products";
import { FarmArt } from "../components/FarmArt";
import { price } from "../lib/i18n";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { ProductCard } from "../components/ProductCard";
import { useEffect, useState } from "react";
import NotFound from "./NotFound";
export default function Details() {
  const { id } = useParams();
  const product = productRepository.get(id || "");
  const [view, setView] = useState<"main" | "detail">("main");
  useEffect(() => setView("main"), [id]);
  if (!product) return <NotFound />;
  return (
    <div className="container details-page">
      <div className="breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/products">المنتجات</Link>
        <span>/</span>
        <span>{product.title}</span>
      </div>
      <div className="details-grid">
        <div className="details-gallery">
          <div
            className={`details-image art-${product.art} ${view === "detail" ? "zoomed-art" : ""}`}
          >
            <FarmArt variant={product.art} />
            <span className="sample-badge">رسم توضيحي · نموذج تجريبي</span>
          </div>
          <div className="gallery-thumbnails">
            <button
              className={view === "main" ? "selected" : ""}
              aria-label="عرض التصميم كاملًا"
              aria-pressed={view === "main"}
              onClick={() => setView("main")}
            >
              <FarmArt variant={product.art} />
            </button>
            <button
              className={
                view === "detail"
                  ? "selected thumbnail-detail"
                  : "thumbnail-detail"
              }
              aria-label="تكبير تفاصيل الرسم التوضيحي"
              aria-pressed={view === "detail"}
              onClick={() => setView("detail")}
            >
              <FarmArt variant={product.art} />
            </button>
            <span>
              <Image size={15} />
              تصور توضيحي للخدمة
            </span>
          </div>
        </div>
        <div className="details-copy">
          <Link
            className="section-kicker"
            to={`/products?category=${product.category}`}
          >
            {categories.find((c) => c.id === product.category)?.title}
          </Link>
          <h1>{product.title}</h1>
          <span
            className={`availability ${product.available ? "" : "unavailable"}`}
          >
            <i />
            {product.available ? "متاح للاستفسار" : "غير متاح حاليًا"}
          </span>
          <div className="details-price">
            <strong dir="ltr">{price(product.price)}</strong>
            <span>سعر تجريبي · للخدمة الواحدة</span>
          </div>
          <p>{product.fullDescription}</p>
          <div className="includes">
            <h3>ماذا تتضمن الخدمة؟</h3>
            {product.includes.map((item) => (
              <div key={item}>
                <Check size={16} />
                {item}
              </div>
            ))}
          </div>
          {product.available ? (
            <WhatsAppButton productName={product.title} />
          ) : (
            <div className="unavailable-box">
              هذه الخدمة غير متاحة حاليًا.{" "}
              <Link to="/products">اكتشف الخدمات المتاحة</Link>
            </div>
          )}
          <p className="details-note">
            <ShieldCheck size={16} />
            لا تحتاج إلى مشاركة حسابك. نتفق على التفاصيل قبل البدء.
          </p>
          <div className="details-perks">
            <span>
              <MessageCircle size={20} />
              تواصل مباشر
            </span>
            <span>
              <Palette size={20} />
              تصميم مخصص
            </span>
            <span>
              <ShieldCheck size={20} />
              بدون دفع إلكتروني
            </span>
          </div>
        </div>
      </div>
      <section className="related-products section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">أكمل حكاية مزرعتك</span>
            <h2>قد تلهمك أيضًا</h2>
          </div>
          <Link className="text-link" to="/products">
            كل المنتجات
            <ArrowLeft size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((p) => p.id !== id && p.available)
            .slice(0, 3)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
    </div>
  );
}
