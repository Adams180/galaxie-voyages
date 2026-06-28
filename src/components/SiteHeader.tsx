"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

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
  themeLabel,
}: {
  lang: string;
  nav: NavLabels;
  themeLabel: string;
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

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-line bg-surface/95 text-fg backdrop-blur"
          : "bg-gradient-to-b from-black/70 to-transparent text-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${lang}`} aria-label="Galaxie Voyages">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive(l.href, l.exact)
                  ? "text-gold-400"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle label={themeLabel} />
          <Link
            href={`/${lang}/contact`}
            className="hidden rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-gold-300 sm:inline-block"
          >
            {nav.book}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
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
        <nav className="border-t border-line bg-surface text-fg md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-medium ${
                  isActive(l.href, l.exact)
                    ? "bg-elevated text-gold-500 dark:text-gold-400"
                    : "text-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={`/${lang}/contact`}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gold-400 px-4 py-3 text-center text-sm font-semibold text-navy-900"
            >
              {nav.book}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
