import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { routes, cities, company } from "@/lib/data";
import HeroSlideshow from "@/components/HeroSlideshow";
import Gallery from "@/components/Gallery";
import Comments from "@/components/Comments";
import CountUp from "@/components/CountUp";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const c = dict.common;

  const stats = [
    { value: company.stats.routes, label: dict.stats.routes },
    { value: company.stats.cities, label: dict.stats.cities },
    { value: company.stats.passengersPerYear, label: dict.stats.passengers },
    { value: company.stats.onTime, label: dict.stats.onTime },
  ];

  return (
    <>
      {/* ── Cinematic hero with photo slideshow ── */}
      <section className="relative isolate overflow-hidden">
        <HeroSlideshow />

        <div className="mx-auto max-w-6xl px-4 pb-28 pt-36 sm:px-6 sm:pb-40 sm:pt-48">
          <p
            data-reveal="fade"
            className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300"
          >
            {dict.hero.eyebrow}
          </p>
          <h1
            data-reveal
            style={delay(90)}
            className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            {dict.hero.title}
          </h1>
          <p
            data-reveal
            style={delay(180)}
            className="mt-4 text-lg font-semibold italic"
          >
            <span className="gv-gradient-text">« {c.slogan} »</span>
          </p>
          <p
            data-reveal
            style={delay(260)}
            className="mt-4 max-w-xl text-lg text-slate-300"
          >
            {dict.hero.subtitle}
          </p>
          <div
            data-reveal
            style={delay(340)}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href={`/${lang}/destinations`}
              className="gv-press rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-lg hover:shadow-gold-500/25"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="gv-press rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* scroll cue */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
        >
          <div className="gv-float flex h-9 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
            <span className="block h-1.5 w-1 rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-line bg-band">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              style={delay(i * 90)}
              className="px-4 text-center"
            >
              <div className="text-3xl font-black text-highlight sm:text-4xl">
                <CountUp value={String(s.value)} />
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl" data-reveal>
          <h2 className="gv-h2 text-3xl font-bold tracking-tight text-fg">
            {dict.services.title}
          </h2>
          <p className="mt-3 text-muted">{dict.services.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.services.items.map((item, i) => (
            <div
              key={i}
              data-reveal
              style={delay(i * 80)}
              className="group rounded-2xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1.5 hover:border-gold-400/50 hover:shadow-xl hover:shadow-navy-900/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-600 text-gold-300 transition duration-300 group-hover:scale-110 group-hover:bg-gold-400 group-hover:text-navy-900">
                <ServiceIcon i={i} />
              </div>
              <h3 className="mt-4 font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features (why travel) ── */}
      <section className="bg-band py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl" data-reveal>
            <h2 className="gv-h2 text-3xl font-bold tracking-tight text-fg">
              {dict.features.title}
            </h2>
            <p className="mt-3 text-muted">{dict.features.subtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dict.features.items.map((item, i) => (
              <div
                key={i}
                data-reveal
                style={delay(i * 80)}
                className="group rounded-2xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-500/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-accent transition duration-300 group-hover:scale-110">
                  <FeatureIcon i={i} />
                </div>
                <h3 className="mt-4 font-semibold text-fg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── On-board experience ── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl" data-reveal>
          <h2 className="gv-h2 text-3xl font-bold tracking-tight text-fg">
            {dict.experience.title}
          </h2>
          <p className="mt-3 text-muted">{dict.experience.subtitle}</p>
        </div>
        <div
          data-reveal="scale"
          className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {dict.experience.items.map((item, i) => (
            <div
              key={i}
              className="bg-surface p-7 transition-colors duration-300 hover:bg-elevated"
            >
              <div className="font-mono text-sm text-highlight">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Routes row (no fares) ── */}
      <section className="bg-band py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div>
              <h2 className="gv-h2 text-3xl font-bold tracking-tight text-fg">
                {dict.popularRoutes.title}
              </h2>
              <p className="mt-3 text-muted">{dict.popularRoutes.subtitle}</p>
            </div>
            <Link
              href={`/${lang}/destinations`}
              className="text-sm font-semibold text-accent transition hover:opacity-80"
            >
              {dict.popularRoutes.cta} →
            </Link>
          </div>
        </div>

        <div
          data-reveal="fade"
          className="row-scroll mt-10 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:max-w-6xl"
        >
          {routes.map((r) => (
            <Link
              key={r.code}
              href={`/${lang}/destinations?from=${encodeURIComponent(r.a)}&to=${encodeURIComponent(r.b)}`}
              className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-navy-600 to-navy-800 p-6 text-white transition duration-300 hover:-translate-y-1.5 hover:border-gold-400/50 hover:shadow-2xl hover:shadow-navy-900/40"
            >
              <div
                aria-hidden
                className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-500/20 blur-2xl transition duration-500 group-hover:bg-gold-400/25"
              />
              {r.popular && (
                <span className="inline-block rounded-full bg-gold-400/15 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gold-300">
                  {c.popular}
                </span>
              )}
              {/* itinerary: departure → destination */}
              <div className="mt-4">
                <div className="flex items-center gap-3 text-lg font-bold">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-300 ring-4 ring-teal-300/15" />
                  <span>{r.a}</span>
                </div>
                <div className="ml-[4px] h-6 border-l border-dashed border-white/25" />
                <div className="flex items-center gap-3 text-lg font-bold">
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-gold-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  <span>{r.b}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-gold-300 opacity-80 transition-all duration-300 group-hover:gap-2 group-hover:opacity-100">
                {c.seeRoutes}
                <span aria-hidden>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Network / coverage ── */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div data-reveal="left">
          <h2 className="gv-h2 text-3xl font-bold tracking-tight text-fg">
            {dict.network.title}
          </h2>
          <p className="mt-3 text-muted">{dict.network.subtitle}</p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent">
            {dict.network.citiesTitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map((city) => (
              <span
                key={city}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-fg transition hover:border-gold-400/50 hover:text-highlight"
              >
                {city}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-faint">{dict.network.note}</p>
        </div>

        <div
          data-reveal="right"
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <ul className="space-y-3">
            {routes.map((r) => (
              <li
                key={r.code}
                className="flex items-center justify-between rounded-xl border border-line bg-band px-5 py-4 transition hover:border-gold-400/40"
              >
                <span className="flex items-center gap-2 font-medium text-fg">
                  <span className="h-2 w-2 rounded-full bg-gold-400" />
                  {r.a}
                  <span className="text-faint">⇄</span>
                  {r.b}
                </span>
                <span className="text-xs text-muted">
                  ~{r.hours}
                  {c.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="bg-band py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div className="max-w-2xl">
              <h2 className="gv-h2 text-3xl font-bold tracking-tight text-fg">
                {dict.gallery.title}
              </h2>
              <p className="mt-3 text-muted">{dict.gallery.subtitle}</p>
            </div>
            <Link
              href={`/${lang}/gallery`}
              className="text-sm font-semibold text-accent transition hover:opacity-80"
            >
              {dict.gallery.cta} →
            </Link>
          </div>
          <div className="mt-10" data-reveal="fade">
            <Gallery />
          </div>
          <div className="mt-10 text-center" data-reveal="fade">
            <Link
              href={`/${lang}/gallery`}
              className="gv-press inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-fg transition hover:bg-elevated"
            >
              {dict.gallery.cta} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Traveller reviews (user comments, no account) ── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl" data-reveal>
          <h2 className="gv-h2 text-3xl font-bold tracking-tight text-fg">
            {dict.comments.title}
          </h2>
          <p className="mt-3 text-muted">{dict.comments.subtitle}</p>
        </div>
        <div className="mt-10" data-reveal="fade">
          <Comments labels={dict.comments} seeds={dict.comments.seed} />
        </div>
      </section>

      {/* ── Parent group (GHF SARL) ── */}
      <section className="border-y border-line bg-band">
        <div
          data-reveal
          className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {dict.parent.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">
              {dict.parent.title}
            </h2>
            <p className="mt-3 text-muted">{dict.parent.text}</p>
          </div>
          <Link
            href={`/${lang}/about`}
            className="gv-press inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-fg transition hover:bg-elevated"
          >
            {dict.parent.cta} →
          </Link>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(800px 300px at 50% 0%, #1a3a6e, transparent), linear-gradient(180deg, #0a172d, #060b16)",
          }}
        />
        <div
          data-reveal
          className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6"
        >
          <h2 className="max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            {dict.hero.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/destinations`}
              className="gv-press rounded-full bg-gold-400 px-8 py-3 text-sm font-semibold text-navy-900 transition hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-lg hover:shadow-gold-500/25"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="gv-press rounded-full border border-white/25 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceIcon({ i }: { i: number }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (i) {
    case 0:
      return (
        <svg {...common}>
          <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M3 11h18M7 17v2M17 17v2" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <path d="M12 21c4-4 7-7.5 7-11a7 7 0 1 0-14 0c0 3.5 3 7 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="4" />
          <path d="M11 11l8 8M16 16l2-2M19 19l2-2" />
        </svg>
      );
  }
}

function FeatureIcon({ i }: { i: number }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (i) {
    case 0:
      return (
        <svg {...common}>
          <path d="M12 3l7 3v6c0 4-3 6.5-7 9-4-2.5-7-5-7-9V6l7-3z" />
          <path d="M9.5 12l1.8 1.8 3.2-3.6" />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 17v2M17 17v2" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
        </svg>
      );
  }
}
