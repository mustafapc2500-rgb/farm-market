import { Link } from "react-router-dom";
import { Sprout, ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container empty-state not-found">
      <Sprout size={64} strokeWidth={1} />
      <span>404</span>
      <h1>هذه البذرة لم تنبت هنا بعد</h1>
      <p>الصفحة أو المنتج الذي تبحث عنه غير موجود.</p>
      <Link to="/products" className="button primary">
        اكتشف المنتجات
        <ArrowLeft size={18} />
      </Link>
    </div>
  );
}
