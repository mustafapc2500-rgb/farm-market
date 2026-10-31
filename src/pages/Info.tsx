import { Link, useParams } from "react-router-dom";
import { Leaf, ArrowLeft, MessageCircle, Sprout, Check } from "lucide-react";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { FarmArt } from "../components/FarmArt";
import { whatsappUrl } from "../lib/whatsapp";
export function About() {
  return (
    <div className="container info-page">
      <div className="eyebrow">
        <Leaf size={16} />
        جذورنا شغف، وحصادنا إبداع
      </div>
      <h1>مزرعتك مساحة لخيالك.</h1>
      <div className="about-grid">
        <div>
          <p className="lead">
            فارم ماركت مساحة مستقلة لمحبي المزارع الافتراضية؛ نجمع فيها التصميم
            المدروس وروح الريف المبهجة.
          </p>
          <p>
            نساعدك على تخيّل مزرعة تعكس ذوقك، من تخطيط المساحات إلى اختيار ألوان
            وزوايا الديكور. فكرتنا بسيطة: تجربة ممتعة، تفاصيل واضحة، وتواصل
            إنساني مباشر.
          </p>
          <h2>نصمم معك، خطوة بخطوة</h2>
          {[
            "اختر الخدمة التي تناسب فكرتك.",
            "شاركنا صور مزرعتك ورؤيتك عبر واتساب.",
            "نتفق على النطاق والموعد والتفاصيل قبل البدء.",
            "تحصل على تصميم وإرشادات لتطبّقها بنفسك.",
          ].map((s, i) => (
            <div className="about-step" key={s}>
              <b>{i + 1}</b>
              {s}
            </div>
          ))}
          <Link to="/products" className="button primary">
            اكتشف الخدمات
            <ArrowLeft size={17} />
          </Link>
        </div>
        <div className="about-art">
          <FarmArt />
          <span>
            <Sprout size={20} />
            لكل مزرعة حكاية تستحق أن تُروى
          </span>
        </div>
      </div>
      <div className="info-callout">
        <Check size={22} />
        <p>
          نقدم خدمات تصميم واستشارة وتعليم فقط. لا نبيع حسابات أو عملات أو موارد
          داخل الألعاب، ولا نحتاج إلى بيانات الدخول. جميع العروض الحالية بيانات
          تجريبية، والمشروع غير تابع لأي شركة ألعاب.
        </p>
      </div>
    </div>
  );
}
export function Contact() {
  return (
    <div className="container info-page contact-page">
      <div className="eyebrow">
        <MessageCircle size={16} />
        يسعدنا أن نسمع منك
      </div>
      <h1>كل فكرة جميلة تبدأ بـ «مرحبًا».</h1>
      <p className="lead">
        شاركنا رؤيتك، اسأل عن خدمة، أو أخبرنا بما تحتاجه مزرعتك.
      </p>
      <div className="contact-grid">
        <div className="contact-panel">
          <span className="contact-icon">
            <MessageCircle size={34} />
          </span>
          <h2>نتحدث على واتساب</h2>
          <p>
            وسيلتنا المباشرة لمناقشة أفكارك، وتحديد نطاق الخدمة والموعد المناسب.
            لا يتم تحصيل أي مدفوعات عبر الموقع.
          </p>
          <WhatsAppButton />
          {!whatsappUrl(import.meta.env.VITE_WHATSAPP_NUMBER) && (
            <p className="setup-message">
              رقم البائع لم يُضف بعد. التواصل متوقف حتى اكتمال إعداد المتجر.
            </p>
          )}
        </div>
        <div className="contact-tips">
          <h2>لنبدأ من فكرتك</h2>
          <p>هذه التفاصيل تساعدنا على فهم ما تتخيله:</p>
          {[
            "اسم الخدمة التي تهمك",
            "صور للمزرعة أو المساحة التي تريد تطويرها",
            "الألوان والطابع الذي تحبه",
            "الموعد الذي يناسبك",
          ].map((s) => (
            <div key={s}>
              <Check size={17} />
              {s}
            </div>
          ))}
          <span>
            حافظ على خصوصيتك؛ لا ترسل كلمة مرور حسابك أو بيانات تسجيل الدخول.
          </span>
        </div>
      </div>
    </div>
  );
}
export function Legal() {
  const { page } = useParams();
  const titles: Record<string, string> = {
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    imprint: "البيانات القانونية",
  };
  return (
    <div className="container info-page legal-page">
      <div className="eyebrow">
        <Leaf size={16} />
        معلومات المتجر
      </div>
      <h1>{titles[page || ""] || "صفحة غير موجودة"}</h1>
      <div className="info-callout">
        <p>
          هذه صفحة مؤقتة للنسخة التجريبية. ستُستكمل بمعلومات مالك المتجر
          والسياسات القانونية المعتمدة قبل إطلاق الخدمة للعملاء.
        </p>
      </div>
      <h2>حول النسخة الحالية</h2>
      <p>
        يعرض الموقع نماذج توضيحية للخدمات وأسعارًا تجريبية، ولا يتيح الدفع أو
        إنشاء حساب. لا توجد أدوات تحليلات أو ملفات تعريف ارتباط تسويقية مضافة.
        عند تفعيل واتساب، ينتقل المستخدم إلى خدمة خارجية تخضع لسياسة الخصوصية
        الخاصة بها.
      </p>
      <Link to="/contact" className="text-link">
        صفحة التواصل
        <ArrowLeft size={17} />
      </Link>
    </div>
  );
}
