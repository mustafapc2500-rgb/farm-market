import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { adminClient, adminConfiguration, clearAdminStorage } from "./client";

type AuthState =
  | {
      status:
        | "checking"
        | "authorized"
        | "forbidden"
        | "unavailable"
        | "unconfigured";
      message?: string;
    }
  | { status: "signed-out"; message?: string };
interface AuthContextValue {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  revalidate: () => Promise<void>;
  expireSession: () => void;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const connectionMessage =
  "تعذر التحقق من صلاحيات الجلسة. تحقق من الاتصال وإعداد خدمة الإدارة ثم حاول مجددًا.";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: adminClient ? "checking" : "unconfigured",
  });
  const epoch = useRef(0);
  const alive = useRef(true);
  const loggingOut = useRef(false);
  const hadSession = useRef(false);
  const eventTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const expireSession = useCallback(() => {
    epoch.current++;
    clearAdminStorage();
    if (alive.current)
      setState({
        status: "signed-out",
        message: "انتهت الجلسة. سجّل الدخول مجددًا.",
      });
  }, []);

  const revalidate = useCallback(async () => {
    if (!adminClient || loggingOut.current) return;
    const ticket = ++epoch.current;
    const current = () =>
      alive.current && !loggingOut.current && ticket === epoch.current;
    setState({ status: "checking" });
    try {
      const restored = await adminClient.auth.getSession();
      if (!current()) return;
      if (restored.error) {
        expireSession();
        return;
      }
      if (!restored.data.session) {
        setState({
          status: "signed-out",
          message: hadSession.current
            ? "انتهت الجلسة. سجّل الدخول مجددًا."
            : undefined,
        });
        return;
      }
      hadSession.current = true;
      // Stored session/user fields are never accepted as authorization evidence.
      const verified = await adminClient.auth.getUser();
      if (!current()) return;
      if (verified.error || !verified.data.user) {
        if (
          verified.error?.status === 401 ||
          verified.error?.status === 403 ||
          !verified.error
        )
          expireSession();
        else setState({ status: "unavailable", message: connectionMessage });
        return;
      }
      const result = await adminClient.rpc("current_user_is_admin");
      if (!current()) return;
      if (result.error) {
        if (result.status === 401) expireSession();
        else setState({ status: "unavailable", message: connectionMessage });
        return;
      }
      setState(
        result.data === true
          ? { status: "authorized" }
          : { status: "forbidden" },
      );
    } catch {
      if (current())
        setState({ status: "unavailable", message: connectionMessage });
    }
  }, [expireSession]);

  useEffect(() => {
    alive.current = true;
    if (!adminClient)
      return () => {
        alive.current = false;
      };
    const { data } = adminClient.auth.onAuthStateChange((event) => {
      if (loggingOut.current || event === "INITIAL_SESSION") return;
      epoch.current++;
      clearTimeout(eventTimer.current);
      if (event === "SIGNED_OUT") {
        setState({
          status: "signed-out",
          message: hadSession.current
            ? "انتهت الجلسة. سجّل الدخول مجددًا."
            : undefined,
        });
        return;
      }
      // Never await or call another Auth method inside this SDK callback (Auth lock).
      setState({ status: "checking" });
      eventTimer.current = setTimeout(() => {
        void revalidate();
      }, 0);
    });
    void revalidate();
    return () => {
      alive.current = false;
      epoch.current++;
      clearTimeout(eventTimer.current);
      data.subscription.unsubscribe();
    };
  }, [revalidate]);

  useEffect(() => {
    if (state.status !== "authorized") return;
    const onFocus = () => {
      if (document.visibilityState === "visible") void revalidate();
    };
    const timer = setInterval(() => {
      void revalidate();
    }, 60_000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [state.status, revalidate]);

  const signIn = async (email: string, password: string) => {
    if (!adminClient) return "خدمة تسجيل الدخول تحتاج إلى إعداد قبل المتابعة.";
    try {
      const { error } = await adminClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (!error) return null;
      if (error.status === 429)
        return "محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مجددًا.";
      if (!error.status || error.status >= 500)
        return "تعذر الاتصال بخدمة تسجيل الدخول. حاول مجددًا بعد قليل.";
      return "تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.";
    } catch {
      return "تعذر الاتصال بخدمة تسجيل الدخول. حاول مجددًا بعد قليل.";
    }
  };
  const signOut = async () => {
    loggingOut.current = true;
    epoch.current++;
    clearTimeout(eventTimer.current);
    setState({ status: "checking" });
    try {
      await adminClient?.auth.signOut({ scope: "local" });
    } catch {
      /* Clear the current tab even if server-side refresh-token revocation fails. */
    } finally {
      clearAdminStorage();
      hadSession.current = false;
      epoch.current++;
      loggingOut.current = false;
      if (alive.current) setState({ status: "signed-out" });
    }
  };
  return (
    <AuthContext.Provider
      value={{
        state:
          !adminClient && adminConfiguration.status !== "ready"
            ? { status: "unconfigured" }
            : state,
        signIn,
        signOut,
        revalidate,
        expireSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AdminAuthProvider is required");
  return context;
}
