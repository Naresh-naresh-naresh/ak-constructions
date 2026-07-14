import Link from "next/link";
import { clientConfig } from "@/config/client";
import { buildWhatsAppUrl } from "@/lib/utils";

type FloatingContactProps = {
  onGetQuote: () => void;
};

export default function FloatingContact({ onGetQuote }: FloatingContactProps) {
  const whatsappUrl = buildWhatsAppUrl(
    clientConfig.whatsapp,
    `Hi ${clientConfig.name}, I'd like to know more about your interior & construction services.`
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href={`tel:${clientConfig.phone.replace(/\s/g, "")}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition hover:scale-105 hover:bg-orange-600"
        aria-label="Call us"
        title="Call us"
      >
        📞
      </a>
      <a
        href={`mailto:${clientConfig.email}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition hover:scale-105 hover:bg-orange-600"
        aria-label="Email us"
        title="Email us"
      >
        ✉️
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
        aria-label="WhatsApp us"
        title="WhatsApp us"
      >
        💬
      </a>
      <button
        type="button"
        onClick={onGetQuote}
        className="hidden h-12 rounded-full bg-stone-900 px-4 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800 sm:block"
      >
        Get Quote
      </button>
      <Link
        href="/track"
        className="hidden h-12 items-center rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 shadow-lg transition hover:border-orange-300 hover:text-orange-600 sm:flex"
      >
        Track My Project
      </Link>
    </div>
  );
}
