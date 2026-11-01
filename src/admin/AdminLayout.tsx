import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpLeft,
  Boxes,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "../components/Layout";
import { useAdminAuth } from "./AuthProvider";

function SidebarContents({ close }: { close?: () => void }) {
  const { signOut } = useAdminAuth();
  return (
    <>
      <Logo light />
      <div className="admin-sidebar-caption">مساحة الإدارة</div>
      <nav aria-label="التنقل في لوحة الإدارة">
        <NavLink end to="/admin" onClick={close}>
          <LayoutDashboard size={20} />
          نظرة عامة
        </NavLink>
        <NavLink to="/admin/products" onClick={close}>
          <Boxes size={20} />
          المنتجات<span>عرض فقط</span>
        </NavLink>
      </nav>
      <div className="admin-sidebar-note">
        <Leaf size={23} />
        <b>كل تفصيلة في مكانها</b>
        <p>تابع منتجاتك وحالة نشرها من مكان واحد.</p>
      </div>
      <div className="admin-sidebar-bottom">
        <Link to="/">
          <ArrowUpLeft size={18} />
          زيارة المتجر
        </Link>
        <button
          onClick={() => {
            close?.();
            void signOut();
          }}
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );
}
export function AdminLayout() {
  const drawer = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  useEffect(() => {
    drawer.current?.close();
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const products = location.pathname === "/admin/products";
  return (
    <div className="admin-frame">
      <a href="#admin-main" className="skip-link">
        انتقل إلى محتوى الإدارة
      </a>
      <aside className="admin-sidebar">
        <SidebarContents />
      </aside>
      <dialog
        className="admin-drawer"
        ref={drawer}
        aria-label="قائمة الإدارة"
        onClick={(event) => {
          if (event.target === drawer.current) drawer.current?.close();
        }}
      >
        <button
          className="admin-drawer-close"
          onClick={() => drawer.current?.close()}
          aria-label="إغلاق قائمة الإدارة"
        >
          <X size={22} />
        </button>
        <SidebarContents close={() => drawer.current?.close()} />
      </dialog>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <button
              className="admin-menu-button"
              onClick={() => drawer.current?.showModal()}
              aria-label="فتح قائمة الإدارة"
            >
              <Menu size={22} />
            </button>
            <span>
              فارم ماركت <span aria-hidden="true">/</span>{" "}
              {products ? "المنتجات" : "لوحة الإدارة"}
            </span>
          </div>
          <span className="admin-verified">
            <ShieldCheck size={16} />
            جلسة معتمدة
          </span>
        </header>
        <main id="admin-main" className="admin-main">
          <Outlet />
        </main>
        <div className="admin-workspace-footer">
          فارم ماركت · مساحة إدارة المنتجات
        </div>
      </div>
    </div>
  );
}
