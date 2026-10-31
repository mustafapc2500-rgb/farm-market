import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpLeft,
  Globe2,
  Menu,
  Sprout,
  X,
  Leaf,
  Heart,
} from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { t } from "../lib/i18n";
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`logo ${light ? "light" : ""}`}
      aria-label="فارم ماركت — الرئيسية"
    >
      <span className="logo-mark">
        <Sprout size={30} strokeWidth={1.7} />
      </span>
      <span>
        <b>
          فارم ماركت<span className="logo-dot">.</span>
        </b>
        <small>FARM MARKET</small>
      </span>
    </Link>
  );
}
export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    if (location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" }),
      );
    } else window.scrollTo(0, 0);
  }, [location]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return (
    <>
      <a href="#main" className="skip-link">
        انتقل إلى المحتوى
      </a>
      <div className="announcement">
        <Leaf size={13} />
        <span>أفكار تُزرع بحب، ومزارع تنبض بالجمال</span>
        <span className="announcement-dot">✦</span>
        <span>خدمات رقمية بلمسة ريفية</span>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="القائمة الرئيسية">
            <NavLink end to="/">
              {t.home}
            </NavLink>
            <NavLink to="/products">{t.products}</NavLink>
            <Link to="/#categories">{t.categories}</Link>
            <Link to="/about">{t.about}</Link>
            <Link to="/contact">{t.contact}</Link>
          </nav>
          <div className="header-actions">
            <span className="language">
              <Globe2 size={16} />
              العربية
            </span>
            <WhatsAppButton />
            <button
              className="mobile-menu"
              onClick={() => setOpen(!open)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="القائمة على الهاتف"
          >
            <NavLink end to="/">
              الرئيسية
            </NavLink>
            <NavLink to="/products">المنتجات</NavLink>
            <Link to="/#categories">الأقسام</Link>
            <Link to="/about">من نحن</Link>
            <Link to="/contact">تواصل معنا</Link>
          </nav>
        )}
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer>
        <div className="container footer-grid">
          <div className="footer-brand">
            <Logo light />
            <p>
              مساحة للأفكار الجميلة، وشريكك في صنع
              <br />
              مزرعة افتراضية تشبهك.
            </p>
            <span className="footer-made">
              صُنع بشغف، ونما بحب <Heart size={13} />
            </span>
          </div>
          <div>
            <h3>اكتشف فارم ماركت</h3>
            <Link to="/">الرئيسية</Link>
            <Link to="/products">جميع المنتجات</Link>
            <Link to="/#categories">أقسام الخدمات</Link>
            <Link to="/about">من نحن</Link>
          </div>
          <div>
            <h3>نحن هنا لمساعدتك</h3>
            <Link to="/contact">
              تواصل معنا <ArrowUpLeft size={13} />
            </Link>
            <Link to="/legal/privacy">سياسة الخصوصية</Link>
            <Link to="/legal/terms">الشروط والأحكام</Link>
            <Link to="/legal/imprint">البيانات القانونية</Link>
          </div>
          <div className="footer-contact">
            <h3>لفكرة جميلة، بداية بسيطة</h3>
            <p>أخبرنا عن مزرعتك، ولنزرع الفكرة معًا.</p>
            <WhatsAppButton />
            <small>خدمات رقمية فقط · بدون دفع إلكتروني</small>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} فارم ماركت. جميع الحقوق محفوظة.
          </span>
          <span>مشروع مستقل، غير تابع لأي شركة ألعاب.</span>
          <span>كل المنتجات المعروضة نماذج تجريبية.</span>
        </div>
      </footer>
    </>
  );
}
