import {
  ArrowLeft,
  ArrowUpLeft,
  Check,
  Flower2,
  Headphones,
  Leaf,
  MessagesSquare,
  MousePointer2,
  Palette,
  ShieldCheck,
  Sparkles,
  Sprout,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { categories, products } from "../data/products";
import { FarmArt, CategoryArt } from "../components/FarmArt";
import { ProductCard } from "../components/ProductCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-sky" aria-hidden="true">
          <span className="cloud cloud-one" />
          <span className="cloud cloud-two" />
          <span className="sunshine" />
        </div>
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sprout size={17} /> أهلًا بك في عالم فارم ماركت{" "}
              <span aria-hidden="true">✦</span>
            </div>
            <h1>
              كل ما تحتاجه لمزرعتك{" "}
              <span>
                في مكان واحد
                <svg viewBox="0 0 390 14" aria-hidden="true">
                  <path
                    d="M5 10Q190-6 385 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p>اكتشف خدمات وأفكارًا مميزة تجعل تجربة مزرعتك أجمل.</p>
            <div className="hero-buttons">
              <Link className="button primary" to="/products">
                تصفح المنتجات
                <ArrowLeft size={20} />
              </Link>
              <WhatsAppButton className="hero-inquiry" />
            </div>
            <div className="hero-notes">
              <span>
                <Check size={16} />
                خدمات تناسب أفكارك
              </span>
              <span>
                <Check size={16} />
                تواصل مباشر
              </span>
              <span>
                <Check size={16} />
                أسعار واضحة
              </span>
            </div>
          </div>
          <div className="hero-picture">
            <FarmArt hero />
            <div className="world-sticker">
              <span>
                <Leaf size={21} />
              </span>
              <div>
                <b>عالم صغير، خيال كبير</b>
                <small>لمزرعتك لمسة تستحقها</small>
              </div>
              <Sparkles size={20} />
            </div>
            <span className="world-tag" aria-hidden="true">
              ازرع فكرتك <Sprout size={18} />
            </span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>
            <Flower2 size={20} />
            تفاصيل صغيرة تصنع عالمًا أجمل
          </span>
          <span>
            <MessagesSquare size={20} />
            اختر خدمتك وتحدث معنا
          </span>
          <span>
            <MousePointer2 size={20} />
            خدمات رقمية · بدون دفع إلكتروني
          </span>
        </div>
      </section>
      <section className="section categories-section" id="categories">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                <span />
                مساحات للإبداع
              </span>
              <h2>ماذا تحتاج مزرعتك اليوم؟</h2>
            </div>
            <p>لكل فكرة مكان، ولكل مزرعة لمستها الخاصة.</p>
          </div>
          <div className="category-grid">
            {categories.map((c) => {
              return (
                <Link
                  key={c.id}
                  to={`/products?category=${c.id}`}
                  className={`category-card ${c.color}`}
                >
                  <CategoryArt category={c.id} />
                  <span className="category-spark" aria-hidden="true">
                    ✦
                  </span>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
                  </div>
                  <ArrowUpLeft size={20} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                <span />
                مختارة بعناية
              </span>
              <h2>
                لمسات مميزة لعالمك <Sparkles size={24} />
              </h2>
            </div>
            <Link to="/products" className="text-link">
              اكتشف كل المنتجات
              <ArrowLeft size={17} />
            </Link>
          </div>
          <p className="demo-note">
            <Leaf size={15} /> منتجات تجريبية لاستكشاف الخدمات — الأسعار والتوفر
            أمثلة توضيحية.
          </p>
          <div className="product-grid">
            {products
              .filter((p) => p.featured)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      </section>
      <section className="why-section section" id="why">
        <div className="container why-inner">
          <div className="why-intro">
            <span className="section-kicker">
              <span />
              أكثر من مجرد تصميم
            </span>
            <h2>
              نهتم بالتفاصيل الصغيرة، <br />
              لتستمتع بالصورة الكبيرة.
            </h2>
            <p>
              من أول فكرة حتى آخر لمسة، نرافقك بخدمة واضحة وتجربة مريحة تستحقها.
            </p>
            <Link className="text-link" to="/about">
              تعرّف علينا أكثر
              <ArrowLeft size={17} />
            </Link>
            <Leaf className="why-leaf" size={90} strokeWidth={0.7} />
          </div>
          <div className="benefits">
            {[
              {
                icon: MessagesSquare,
                title: "تواصل سريع ومباشر",
                text: "بلا تعقيد. تحدث معنا عبر واتساب وشاركنا أفكارك.",
              },
              {
                icon: Palette,
                title: "خدمة تشبهك",
                text: "نصغي لذوقك ونصمم بما يناسب رؤيتك ومزرعتك.",
              },
              {
                icon: Tag,
                title: "أسعار واضحة من البداية",
                text: "كل التفاصيل أمامك، لتختار ما يناسبك بكل راحة.",
              },
              {
                icon: Headphones,
                title: "دعم بروح ودودة",
                text: "أسئلتك مرحّب بها، ونحن هنا لنساعدك في كل خطوة.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div className="benefit" key={title}>
                <span>
                  <Icon size={23} strokeWidth={1.5} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container cta-section">
        <div className="cta-sprout">
          <Sprout size={86} strokeWidth={1} />
          <span>✦</span>
        </div>
        <div>
          <span>دعنا نزرع شيئًا جميلًا معًا</span>
          <h2>فكرتك القادمة تبدأ بمحادثة.</h2>
          <p>عندك سؤال أو فكرة مختلفة؟ يسعدنا أن نسمع منك.</p>
        </div>
        <WhatsAppButton />
        <ShieldCheck className="cta-decoration" size={110} strokeWidth={0.6} />
      </section>
    </>
  );
}
