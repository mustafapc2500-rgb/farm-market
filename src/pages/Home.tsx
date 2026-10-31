import {
  ArrowLeft,
  ArrowUpLeft,
  Check,
  Compass,
  Flower2,
  Headphones,
  Leaf,
  Map,
  MessagesSquare,
  MousePointer2,
  Palette,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { categories, products } from "../data/products";
import { FarmArt } from "../components/FarmArt";
import { ProductCard } from "../components/ProductCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
const icons = [Compass, Map, Sprout, Palette];
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <span />
              <Leaf size={14} />
              من شغفك، تبدأ الحكاية
            </div>
            <h1>
              لمزرعتك حكاية
              <br />
              تستحق أن تكون{" "}
              <span>
                أجمل
                <svg viewBox="0 0 170 12" aria-hidden="true">
                  <path
                    d="M3 8Q80-3 166 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="heading-flower" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p>
              أفكار ملهمة، تصاميم مميزة، ولمسات تصنع الفرق.
              <br className="desktop-break" /> نساعدك في تحويل مزرعتك الافتراضية
              إلى عالم يشبهك.
            </p>
            <div className="hero-buttons">
              <Link className="button primary" to="/products">
                تصفح المنتجات
                <ArrowLeft size={19} />
              </Link>
              <Link className="button secondary" to="/contact">
                تواصل معنا
                <MessagesSquare size={18} />
              </Link>
            </div>
            <div className="hero-notes">
              <span>
                <Check size={14} />
                تصاميم حسب ذوقك
              </span>
              <span>
                <Check size={14} />
                أسعار واضحة
              </span>
              <span>
                <Check size={14} />
                تواصل مباشر
              </span>
            </div>
          </div>
          <div className="hero-picture">
            <div className="art-orbit" />
            <div className="floating-label top-label">
              <span className="label-icon">
                <Sprout size={23} />
              </span>
              <span>
                <b>فكرة صغيرة</b>
                <small>مزرعة استثنائية</small>
              </span>
              <Sparkles size={17} />
            </div>
            <FarmArt hero />
            <div className="floating-label bottom-label">
              <span className="sun-icon">
                <Sun size={21} />
              </span>
              <span>
                <b>هنا تنمو أفكارك</b>
                <small>تفاصيل مصممة بحب</small>
              </span>
              <span className="little-leaf">❧</span>
            </div>
            <div className="art-caption">
              A LITTLE FARM. A LOT OF POSSIBILITIES.
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>خيالك هو البداية، ونحن نهتم بالتفاصيل</span>
          <span>
            <Flower2 size={17} />
            زرعنا الشغف في كل خدمة
          </span>
          <span>
            <MousePointer2 size={16} />
            اختر، استفسر، ودعنا نبدأ
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
            {categories.map((c, i) => {
              const Icon = icons[i];
              return (
                <Link
                  key={c.id}
                  to={`/products?category=${c.id}`}
                  className={`category-card ${c.color}`}
                >
                  <div className="category-icon">
                    <Icon size={30} strokeWidth={1.5} />
                    <span>✦</span>
                  </div>
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
                أفكار تحبها، ومزرعة تتمناها <Sparkles size={24} />
              </h2>
            </div>
            <Link to="/products" className="text-link">
              اكتشف كل المنتجات
              <ArrowLeft size={17} />
            </Link>
          </div>
          <p className="demo-note">
            مجموعة تجريبية للتعريف بخدماتنا — الأسعار والتوفر أمثلة توضيحية.
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
              نهتم بالتفاصيل الصغيرة،
              <br />
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
