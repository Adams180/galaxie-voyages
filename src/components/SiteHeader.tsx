"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import LangSwitcher from "./LangSwitcher";

type NavLabels = {
  home: string;
  destinations: string;
  fleet: string;
  about: string;
  contact: string;
  book: string;
};

export default function SiteHeader({
  lang,
  nav,
}: {
  lang: string;
  nav: NavLabels;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${lang}`, label: nav.home, exact: true },
    { href: `/${lang}/destinations`, label: nav.destinations },
    { href: `/${lang}/fleet`, label: nav.fleet },
    { href: `/${lang}/about`, label: nav.about },
    { href: `/${lang}/contact`, label: nav.contact },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-ink-900/95 backdrop-blur"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${lang}`} aria-label="Galaxie Voyages">
          <Logo variant="light" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive(l.href, l.exact)
                  ? "text-teal-300"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher current={lang} />
          <Link
            href={`/${lang}/contact`}
            className="hidden rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-400 sm:inline-block"
          >
            {nav.book}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-ink-900 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-medium ${
                  isActive(l.href, l.exact)
                    ? "bg-white/5 text-teal-300"
                    : "text-slate-200"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={`/${lang}/contact`}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-teal-500 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {nav.book}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
