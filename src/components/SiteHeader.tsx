"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

type NavLabels = {
  home: string;
  destinations: string;
  offers: string;
  fleet: string;
  gallery: string;
  news: string;
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
    { href: `/${lang}/services`, label: nav.offers },
    { href: `/${lang}/fleet`, label: nav.fleet },
    { href: `/${lang}/gallery`, label: nav.gallery },
    { href: `/${lang}/news`, label: nav.news },
    { href: `/${lang}/about`, label: nav.about },
    { href: `/${lang}/contact`, label: nav.contact },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter,border-color] duration-500 ${
        solid
          ? "border-b border-line bg-surface/70 text-fg shadow-[0_8px_30px_-12px_rgba(8,15,35,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-surface/65"
          : "border-b border-transparent bg-gradient-to-b from-black/70 to-transparent text-white"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] duration-500 sm:px-6 ${
          solid ? "h-14" : "h-20"
        }`}
      >
        <Link
          href={`/${lang}`}
          aria-label="Galaxie Voyages"
          className="gv-press transition-transform hover:scale-[1.02]"
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => {
            const active = isActive(l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-active={active}
                className={`gv-navlink rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-gold-400" : "opacity-80 hover:opacity-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle label={themeLabel} />
          <Link
            href={`/${lang}/contact`}
            className="gv-press gv-shine hidden rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-lg hover:shadow-gold-500/25 sm:inline-block"
          >
            {nav.book}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="gv-press inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
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

      {/* mobile sheet */}
      <nav
        className={`overflow-hidden border-line bg-surface text-fg transition-[max-height,opacity] duration-300 md:hidden ${
          open ? "max-h-96 border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                isActive(l.href, l.exact)
                  ? "bg-elevated text-gold-500 dark:text-gold-400"
                  : "text-muted hover:bg-elevated"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={`/${lang}/contact`}
            onClick={() => setOpen(false)}
            className="gv-press mt-2 rounded-full bg-gold-400 px-4 py-3 text-center text-sm font-semibold text-navy-900"
          >
            {nav.book}
          </Link>
        </div>
      </nav>
    </header>
  );
}
