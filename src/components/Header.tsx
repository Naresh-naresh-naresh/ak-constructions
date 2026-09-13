"use client";

import Link from "next/link";
import { useState } from "react";
import { clientConfig, navLinks } from "@/config/client";

type HeaderProps = {
  onGetQuote: () => void;
  /**
   * Whether to show the Packages anchor. Driven by whether any package is
   * actually published, so the nav can never point at a section that isn't
   * rendered.
   */
  showPackagesLink?: boolean;
};

export default function Header({ onGetQuote, showPackagesLink }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = showPackagesLink
    ? [
        ...navLinks.slice(0, 2),
        { label: "Packages", href: "#packages" },
        ...navLinks.slice(2),
      ]
    : navLinks;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="min-w-0">
          <a href="#" className="flex items-center gap-2.5 lg:gap-3">
            {/* The client's logo file has a white background baked in (no alpha),
                so mix-blend-multiply drops it out against the light header
                instead of showing a white box over the blurred backdrop. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ak-logo.webp"
              alt=""
              aria-hidden="true"
              className="h-9 w-auto shrink-0 mix-blend-multiply lg:h-11"
            />
            {/* One bold line, no tagline beneath: the full name is long enough
                that the two stacked lines competed with each other, and the
                tagline is already said in the hero. */}
            <span className="min-w-0 truncate text-lg font-bold tracking-tight text-stone-900 sm:text-xl xl:whitespace-nowrap xl:text-lg 2xl:text-xl">
              {clientConfig.name}
            </span>
          </a>
        </div>

        <nav className="hidden items-center gap-5 xl:flex 2xl:gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-stone-700 transition hover:text-orange-600"
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
          <Link
            href="/login"
            className="hidden rounded-full border border-orange-500 px-5 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 sm:block"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={onGetQuote}
            className="hidden rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 sm:block"
          >
            Get Quote
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 xl:hidden"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-stone-200 bg-white px-4 py-4 xl:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-orange-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-orange-600"
              >
                Login
              </Link>
            </li>
            <li>
              <a
                href={`tel:${clientConfig.phone.replace(/\s/g, "")}`}
                className="block rounded-lg px-3 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-orange-600"
              >
                {clientConfig.phone}
              </a>
            </li>
            <li className="mt-1">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onGetQuote();
                }}
                className="w-full rounded-full bg-orange-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Get Quote
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
