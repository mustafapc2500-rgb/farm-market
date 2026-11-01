import { MessageCircle, Settings2 } from "lucide-react";
import { useState } from "react";
import { whatsappUrl } from "../lib/whatsapp";
export function WhatsAppButton({
  productName,
  compact = false,
  className = "",
}: {
  productName?: string;
  compact?: boolean;
  className?: string;
}) {
  const [notice, setNotice] = useState(false);
  const href = whatsappUrl(import.meta.env.VITE_WHATSAPP_NUMBER, productName);
  const label = compact
    ? "استفسر"
    : productName
      ? "استفسر عبر واتساب"
      : "تواصل عبر واتساب";
  return (
    <div className={`whatsapp-wrap ${className}`}>
      {href ? (
        <a
          className="button whatsapp"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} />
          {label}
        </a>
      ) : (
        <>
          <button
            type="button"
            className="button whatsapp"
            aria-expanded={notice}
            onClick={() => setNotice(!notice)}
          >
            <MessageCircle size={18} />
            {label}
          </button>
          {notice && (
            <div role="status" className="config-notice">
              <Settings2 size={17} />
              <span>
                التواصل غير مفعّل بعد. يلزم إعداد رقم واتساب البائع لتتمكن من
                إرسال استفسارك.
              </span>
              <button
                aria-label="إغلاق التنبيه"
                onClick={() => setNotice(false)}
              >
                ×
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
