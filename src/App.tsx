import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Details from "./pages/Details";
import { About, Contact, Legal } from "./pages/Info";
import NotFound from "./pages/NotFound";
const AdminApp = lazy(() => import("./admin/AdminApp"));
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "لمزرعتك حكاية أجمل",
      "/products": "الخدمات والمنتجات",
      "/about": "من نحن",
      "/contact": "تواصل معنا",
      "/admin": "لوحة الإدارة",
      "/admin/login": "تسجيل دخول الإدارة",
      "/admin/products": "منتجات المتجر",
    };
    document.title = `${titles[pathname] || "اكتشف مزرعتك القادمة"} | فارم ماركت`;
  }, [pathname]);
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense
            fallback={
              <div
                role="status"
                style={{ padding: "3rem", textAlign: "center" }}
              >
                جارٍ تحميل مساحة الإدارة…
              </div>
            }
          >
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Catalog />} />
        <Route path="products/:id" element={<Details />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="legal/:page" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
