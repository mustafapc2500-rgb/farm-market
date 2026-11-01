import { ArrowUpLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { categories } from "../data/products";
import { price } from "../lib/i18n";
import { FarmArt } from "./FarmArt";
import { WhatsAppButton } from "./WhatsAppButton";
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link
        to={`/products/${product.id}`}
        className={`product-visual art-${product.art}`}
        aria-label={`تفاصيل ${product.title}`}
      >
        <FarmArt variant={product.art} />
        <span className="sample-badge">نموذج تجريبي</span>
        {product.id === "cozy-farm" && (
          <span className="featured-badge">
            <Sparkles size={12} /> اختيارنا لك
          </span>
        )}
      </Link>
      <div className="product-body">
        <div className="product-meta">
          <span>
            {categories.find((c) => c.id === product.category)?.title}
          </span>
          <span
            className={`availability ${!product.available ? "unavailable" : ""}`}
          >
            <i />
            {product.available ? "متاح للطلب" : "غير متاح حاليًا"}
          </span>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3>{product.title}</h3>
        </Link>
        <p>{product.description}</p>
        <div className="product-price">
          <strong dir="ltr">{price(product.price)}</strong>
          <span>للخدمة الواحدة</span>
        </div>
        <div className="product-actions">
          <Link className="button detail-button" to={`/products/${product.id}`}>
            عرض التفاصيل
            <ArrowUpLeft size={16} />
          </Link>
          {product.available && (
            <WhatsAppButton productName={product.title} compact />
          )}
        </div>
      </div>
    </article>
  );
}
