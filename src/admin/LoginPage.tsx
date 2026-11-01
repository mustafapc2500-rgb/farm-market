import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../components/Layout";
import { useAdminAuth } from "./AuthProvider";
import { AdminAccessScreen } from "./AccessScreen";

export function AdminLoginPage() {
  const { state, signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (state.status === "authorized") return <Navigate to="/admin" replace />;
  if (state.status !== "signed-out") return <AdminAccessScreen />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const message = await signIn(email, password);
      setPassword("");
      setError(message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-login-page">
      <div className="admin-login-art">
        <img src="/artwork/farm-world.webp" alt="" width="1536" height="1024" />
        <div className="admin-login-story">
          <span className="admin-story-tag">
            <ShieldCheck size={18} />
            مساحة المديرين المعتمدين
          </span>
          <h2>
            وراء كل مزرعة جميلة، <br />
            تفاصيل تُدار بعناية.
          </h2>
          <p>أهلًا بك في مساحة إدارة عالم فارم ماركت.</p>
        </div>
      </div>
      <div className="admin-login-content">
        <Logo />
        <Link className="admin-back-link" to="/">
          <ArrowRight size={17} />
          العودة إلى المتجر
        </Link>
        <section className="admin-login-form-card">
          <span className="admin-login-lock">
            <LockKeyhole size={28} />
          </span>
          <span className="admin-eyebrow">أهلًا بعودتك</span>
          <h1>تسجيل دخول الإدارة</h1>
          <p>أدخل بيانات حسابك المعتمد للمتابعة.</p>
          {(error || state.message) && (
            <div className="admin-form-error" role="alert">
              {error || state.message}
            </div>
          )}
          <form onSubmit={submit} aria-busy={busy}>
            <label htmlFor="admin-email">البريد الإلكتروني</label>
            <div className="admin-input">
              <Mail size={19} />
              <input
                id="admin-email"
                type="email"
                dir="ltr"
                autoComplete="username"
                inputMode="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
              />
            </div>
            <label htmlFor="admin-password">كلمة المرور</label>
            <div className="admin-input">
              <LockKeyhole size={19} />
              <input
                id="admin-password"
                type={visible ? "text" : "password"}
                dir="ltr"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
                disabled={busy}
              >
                {visible ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <button
              className="button primary admin-login-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle className="admin-spin" size={19} />
                  جارٍ تسجيل الدخول…
                </>
              ) : (
                <>
                  دخول لوحة الإدارة
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          <p className="admin-login-policy">
            <ShieldCheck size={17} />
            الدخول مخصص للحسابات المخوّلة مسبقًا. لا يتوفر إنشاء حساب عام من هذه
            الصفحة.
          </p>
        </section>
        <small className="admin-login-note">
          تُحفظ الجلسة في علامة التبويب الحالية فقط.
        </small>
      </div>
    </div>
  );
}
