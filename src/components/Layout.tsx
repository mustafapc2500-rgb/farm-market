import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpLeft, Globe2, Menu, Wheat, X, Heart } from "lucide-react";
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
        <svg
          viewBox="0 0 64 64"
          role="img"
          aria-label="شارة فارم ماركت الأصلية"
        >
          <path
            d="M7 34L32 12l25 22v23H7Z"
            fill="#e6653f"
            stroke="#7c3d24"
            strokeWidth="2"
          />
          <path
            d="M3 34L32 7l29 27-5 6L32 18 8 40Z"
            fill="#ffdc72"
            stroke="#9a652e"
            strokeWidth="2"
          />
          <path d="M23 38h18v19H23Z" fill="#fff6d6" />
          <path d="M26 42l12 13m0-13L26 55" stroke="#d76b42" strokeWidth="2" />
          <path d="M26 25h12v9H26Z" fill="#fff0bb" />
          <path d="M3 56q27-14 58 0v5H3Z" fill="#75bc42" />
          <path
            d="M10 54V39m0 8L4 41m6 2 6-7M53 54V36m0 10-7-6m7 0 5-7"
            fill="none"
            stroke="#f7c74d"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span>
        <b>فارم ماركت</b>
        <small>
          FARM <span>MARKET</span>
        </small>
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
        <Wheat size={16} />
        <span>عالم من الأفكار الجميلة لمزرعتك</span>
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
