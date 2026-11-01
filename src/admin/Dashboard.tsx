import { useEffect, useState } from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Boxes,
  CircleCheck,
  Grid2X2,
  Leaf,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { adminClient } from "./client";
import { useAdminAuth } from "./AuthProvider";
import { AdminReadError, PAGE_SIZE, readDashboard } from "./repository";
import type { DashboardData } from "./repository";
import { price } from "../lib/i18n";
import type { AdminProduct } from "./database.types";
const number = (value: number) =>
  new Intl.NumberFormat("ar", { numberingSystem: "arab" }).format(value);
function Publication({ published }: { published: boolean }) {
  return (
    <span className={`admin-pill ${published ? "published" : "draft"}`}>
      {published ? <CircleCheck size={13} /> : <Archive size={13} />}{" "}
      {published ? "منشور" : "مسودة"}
    </span>
  );
}
function Availability({ available }: { available: boolean }) {
  return (
    <span
      className={`admin-product-availability ${available ? "" : "not-available"}`}
    >
      <i />
      {available ? "متاح" : "غير متاح"}
    </span>
  );
}
function ProductList({ products }: { products: AdminProduct[] }) {
  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-product-table">
          <caption className="admin-sr-only">
            قائمة المنتجات في قاعدة البيانات
          </caption>
          <thead>
            <tr>
              <th scope="col">المنتج</th>
              <th scope="col">السعر</th>
              <th scope="col">القسم</th>
              <th scope="col">التوفر</th>
              <th scope="col">حالة النشر</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="admin-product-name">
                    <span className="admin-product-symbol">
                      <Leaf size={21} />
                    </span>
                    <div>
                      <strong>{product.name}</strong>
                      <span dir="ltr">{product.slug}</span>
                      {product.is_sample && <small>بيانات تجريبية</small>}
                    </div>
                  </div>
                </td>
                <td>
                  <strong dir="ltr" className="admin-table-price">
                    {price(product.price_eur)}
                  </strong>
                </td>
                <td>{product.categoryName}</td>
                <td>
                  <Availability available={product.is_available} />
                </td>
                <td>
                  <Publication published={product.is_published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul
        className="admin-mobile-products"
        aria-label="قائمة المنتجات على الهاتف"
      >
        {products.map((product) => (
          <li key={product.id}>
            <div className="admin-mobile-product-title">
              <span className="admin-product-symbol">
                <Leaf size={21} />
              </span>
              <h3>{product.name}</h3>
            </div>
            <div className="admin-mobile-product-meta">
              <span>{product.categoryName}</span>
              <strong dir="ltr">{price(product.price_eur)}</strong>
            </div>
            {product.is_sample && (
              <span className="admin-sample-label">بيانات تجريبية</span>
            )}
            <div className="admin-mobile-product-status">
              <Availability available={product.is_available} />
              <Publication published={product.is_published} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
export function AdminDashboard({
  productsOnly = false,
}: {
  productsOnly?: boolean;
}) {
  const { revalidate, expireSession } = useAdminAuth();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!adminClient) return;
    const controller = new AbortController();
    let cancelled = false;
    setBusy(true);
    setError(false);
    setData(null);
    void readDashboard(adminClient, page, controller.signal)
      .then((result) => {
        if (!cancelled) {
          if (page > 0 && result.products.length === 0) {
            setPage(0);
            return;
          }
          setData(result);
        }
      })
      .catch((problem) => {
        if (cancelled) return;
        if (problem instanceof AdminReadError && problem.kind === "session")
          expireSession();
        else if (
          problem instanceof AdminReadError &&
          ["denied", "authorization"].includes(problem.kind)
        )
          void revalidate();
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, revision, revalidate, expireSession]);
  const refresh = () => setRevision((value) => value + 1);
  const stats = [
    {
      label: "إجمالي المنتجات",
      value: data?.counts.total,
      icon: Boxes,
      tone: "green",
    },
    {
      label: "المنتجات المنشورة",
      value: data?.counts.published,
      icon: CircleCheck,
      tone: "blue",
    },
    {
      label: "المسودات",
      value: data?.counts.drafts,
      icon: Archive,
      tone: "yellow",
    },
    {
      label: "الأقسام",
      value: data?.counts.categories,
      icon: Grid2X2,
      tone: "orange",
    },
  ];
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">
            <Sprout size={16} />
            {productsOnly ? "كتالوجك في مكان واحد" : "أهلًا بك في مساحة إدارتك"}
          </span>
          <h1>{productsOnly ? "المنتجات" : "نظرة على مزرعتك الرقمية"}</h1>
          <p>
            {productsOnly
              ? "اطّلع على منتجاتك وأسعارها وحالة نشرها."
              : "تابع منتجات المتجر وأقسامه بوضوح، خطوة بخطوة."}
          </p>
        </div>
        <button
          className="button admin-refresh"
          onClick={refresh}
          disabled={busy}
        >
          <RefreshCw size={17} className={busy ? "admin-spin" : ""} />
          تحديث البيانات
        </button>
      </div>
      {!productsOnly && (
        <section
          className="admin-stats"
          aria-label="إحصاءات المتجر"
          aria-busy={busy}
        >
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <article className={`admin-stat ${tone}`} key={label}>
              <div>
                <span>{label}</span>
                <strong>{value === undefined ? "—" : number(value)}</strong>
              </div>
              <span className="admin-stat-icon">
                <Icon size={25} />
              </span>
            </article>
          ))}
        </section>
      )}
      <section className="admin-products-panel" aria-busy={busy}>
        <div className="admin-panel-heading">
          <div>
            <span className="admin-panel-icon">
              <Boxes size={22} />
            </span>
            <div>
              <h2>{productsOnly ? "قائمة المنتجات" : "منتجات المتجر"}</h2>
              <p>البيانات من Supabase · وفق صلاحيات حسابك</p>
            </div>
          </div>
          <span className="admin-read-only">
            <ShieldCheck size={14} />
            عرض فقط
          </span>
        </div>
        {busy ? (
          <div className="admin-data-state" role="status">
            <LoaderCircle size={31} className="admin-spin" />
            <h3>نحمّل بيانات المتجر</h3>
            <p>نراجع صلاحياتك قبل عرض المنتجات.</p>
          </div>
        ) : error ? (
          <div className="admin-data-state" role="alert">
            <Archive size={34} />
            <h3>تعذر تحميل البيانات</h3>
            <p>
              لم نتمكن من جلب بيانات المتجر. حاول التحديث بعد التحقق من الاتصال.
            </p>
            <button className="button secondary" onClick={refresh}>
              إعادة المحاولة
            </button>
          </div>
        ) : data && data.counts.total === 0 ? (
          <div className="admin-data-state admin-empty-state">
            <span>
              <Sprout size={50} strokeWidth={1.4} />
            </span>
            <h3>مساحة جاهزة لأول منتج</h3>
            <p>
              لا توجد منتجات في قاعدة البيانات بعد. ستظهر هنا المنتجات التي
              تضيفها في مرحلة إدارة المحتوى القادمة.
            </p>
            <small>
              المنتجات التجريبية في واجهة المتجر مستقلة عن هذه القائمة.
            </small>
          </div>
        ) : (
          data && (
            <>
              <ProductList products={data.products} />
              <div className="admin-pagination">
                <span>
                  عرض {number(page * PAGE_SIZE + 1)}–
                  {number(Math.min((page + 1) * PAGE_SIZE, data.counts.total))}{" "}
                  من {number(data.counts.total)} منتج
                </span>
                <div>
                  <button
                    aria-label="الصفحة السابقة"
                    disabled={page === 0}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    <ArrowRight size={17} />
                    السابق
                  </button>
                  <button
                    aria-label="الصفحة التالية"
                    disabled={(page + 1) * PAGE_SIZE >= data.counts.total}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    التالي
                    <ArrowLeft size={17} />
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </section>
      <div className="admin-phase-note">
        <Leaf size={20} />
        <p>
          هذه المرحلة للمتابعة والقراءة فقط. إضافة المنتجات وتعديلها ورفع الصور
          ستتوفر في مرحلة لاحقة.
        </p>
      </div>
    </>
  );
}
