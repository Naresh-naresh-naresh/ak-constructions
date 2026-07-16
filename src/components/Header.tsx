"use client";

import Link from "next/link";
import { useState } from "react";
import { clientConfig, navLinks } from "@/config/client";

type HeaderProps = {
  onGetQuote: () => void;
};

export default function Header({ onGetQuote }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

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
          <Link
            href="/track"
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
            {navLinks.map((link) => (
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
                href="/track"
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
