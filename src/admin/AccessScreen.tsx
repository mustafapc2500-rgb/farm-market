import {
  ArrowRight,
  LoaderCircle,
  Settings2,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Layout";
import { useAdminAuth } from "./AuthProvider";

export function AdminAccessScreen() {
  const { state, signOut, revalidate } = useAdminAuth();
  const checking = state.status === "checking";
  const missing = state.status === "unconfigured";
  const forbidden = state.status === "forbidden";
  const Icon = checking
    ? LoaderCircle
    : missing
      ? Settings2
      : forbidden
        ? ShieldAlert
        : WifiOff;
  return (
    <div className="admin-access-page">
      <div className="admin-access-brand">
        <Logo />
      </div>
      <section className="admin-access-card" aria-busy={checking}>
        <span className={`admin-access-icon ${checking ? "admin-spin" : ""}`}>
          <Icon size={34} />
        </span>
        <span className="admin-eyebrow">مساحة إدارة فارم ماركت</span>
        <h1>
          {checking
            ? "نتحقق من جلستك بأمان"
            : missing
              ? "لوحة الإدارة تحتاج إلى إعداد"
              : forbidden
                ? "هذا الحساب غير مخوّل للإدارة"
                : "تعذر التحقق من صلاحية الوصول"}
        </h1>
        <p role={checking ? "status" : "alert"}>
          {checking
            ? "لحظات قليلة للتأكد من هويتك وصلاحيات حسابك."
            : missing
              ? "يجب إعداد اتصال Supabase بالمفتاح العام المخصص للمشروع، والسماح بتخزين الجلسة في هذا المتصفح. المتجر متاح للتصفح كالمعتاد."
              : forbidden
                ? "تسجيل الدخول وحده لا يمنح صلاحية الإدارة. يمكن لمالك المشروع منح هذه الصلاحية يدويًا للحسابات المعتمدة فقط."
                : (state.message ??
                  "تحقق من الاتصال وإعداد خدمة الإدارة ثم حاول مجددًا.")}
        </p>
        {!checking && (
          <div className="admin-access-actions">
            {!missing && !forbidden && (
              <button
                className="button primary"
                onClick={() => void revalidate()}
              >
                إعادة التحقق
              </button>
            )}
            {!missing && (
              <button
                className="button secondary"
                onClick={() => void signOut()}
              >
                تسجيل الخروج
              </button>
            )}
            <Link className="admin-back-link" to="/">
              <ArrowRight size={17} />
              العودة إلى المتجر
            </Link>
          </div>
        )}
      </section>
      <p className="admin-access-footnote">
        جلسة آمنة · صلاحيات معتمدة · إدارة واضحة
      </p>
    </div>
  );
}
