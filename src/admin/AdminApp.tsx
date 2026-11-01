import { Navigate, Outlet, Route, Routes, Link } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./AuthProvider";
import { AdminAccessScreen } from "./AccessScreen";
import { AdminLoginPage } from "./LoginPage";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./Dashboard";
import "./admin.css";
function RequireAdministrator() {
  const { state } = useAdminAuth();
  if (state.status === "signed-out")
    return <Navigate to="/admin/login" replace />;
  if (state.status !== "authorized") return <AdminAccessScreen />;
  return <Outlet />;
}
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<RequireAdministrator />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminDashboard productsOnly />} />
            <Route
              path="*"
              element={
                <div className="admin-data-state">
                  <h1>صفحة الإدارة غير موجودة</h1>
                  <Link className="button primary" to="/admin">
                    العودة إلى لوحة الإدارة
                  </Link>
                </div>
              }
            />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
