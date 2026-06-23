import { clientConfig, navLinks } from "@/config/client";

type HeaderProps = {
  onGetQuote: () => void;
};

export default function Header({ onGetQuote }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="min-w-0">
          <a href="#" className="block">
            <span className="text-xl font-bold tracking-tight text-stone-900 lg:text-2xl">
              {clientConfig.name}
            </span>
            <span className="block text-xs text-stone-500 lg:text-sm">
              {clientConfig.tagline}
            </span>
          </a>
        </div>

        <nav className="hidden items-center gap-6 xl:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-stone-700 transition hover:text-orange-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href={`tel:${clientConfig.phone.replace(/\s/g, "")}`}
            className="hidden text-sm font-medium text-stone-700 hover:text-orange-600 md:block"
          >
            {clientConfig.phone}
          </a>
          <button
            type="button"
            onClick={onGetQuote}
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Get Quote
          </button>
        </div>
      </div>
    </header>
  );
}
