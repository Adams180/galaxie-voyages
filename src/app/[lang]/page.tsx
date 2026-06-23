import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { routes, cities, company } from "@/lib/data";
import HeroSlideshow from "@/components/HeroSlideshow";
import Gallery from "@/components/Gallery";

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
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
            {dict.hero.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
            {dict.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            {dict.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/destinations`}
              className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-400"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-white/10 bg-ink-850">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-4 text-center">
              <div className="text-3xl font-black text-teal-300">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {dict.features.title}
          </h2>
          <p className="mt-3 text-slate-400">{dict.features.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.features.items.map((item, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-white/10 bg-ink-800 p-6 transition hover:border-teal-500/50 hover:bg-ink-700"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-600 text-teal-300 transition group-hover:bg-teal-500 group-hover:text-white">
                <FeatureIcon i={i} />
              </div>
              <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── On-board experience ── */}
      <section className="bg-ink-850 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {dict.experience.title}
            </h2>
            <p className="mt-3 text-slate-400">{dict.experience.subtitle}</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {dict.experience.items.map((item, i) => (
              <div key={i} className="bg-ink-800 p-7">
                <div className="text-sm font-mono text-teal-400">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Routes row (no fares) ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {dict.popularRoutes.title}
              </h2>
              <p className="mt-3 text-slate-400">{dict.popularRoutes.subtitle}</p>
            </div>
            <Link
              href={`/${lang}/destinations`}
              className="text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              {dict.popularRoutes.cta} →
            </Link>
          </div>
        </div>

        <div className="row-scroll mt-10 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:max-w-6xl">
          {routes.map((r) => (
            <Link
              key={r.code}
              href={`/${lang}/destinations?from=${encodeURIComponent(r.a)}&to=${encodeURIComponent(r.b)}`}
              className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-navy-600 to-ink-800 p-5 transition hover:-translate-y-1 hover:border-teal-400/50 hover:shadow-2xl hover:shadow-navy-900/50"
            >
              <div
                aria-hidden
                className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-500/20 blur-2xl transition group-hover:bg-teal-400/30"
              />
              {r.popular && (
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-300">
                  {c.popular}
                </span>
              )}
              <div className="mt-3 flex items-center gap-2 text-xl font-bold text-white">
                <span>{r.a}</span>
                <span className="text-teal-300">⇄</span>
                <span>{r.b}</span>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
                <span>
                  ~{r.hours}
                  {c.hours}
                </span>
                <span className="text-teal-300">
                  {r.departures.length} {c.departures.toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Network / coverage ── */}
      <section className="bg-ink-850 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {dict.network.title}
            </h2>
            <p className="mt-3 text-slate-400">{dict.network.subtitle}</p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-teal-300">
              {dict.network.citiesTitle}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-white/10 bg-ink-800 px-4 py-1.5 text-sm text-slate-200"
                >
                  {city}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-500">{dict.network.note}</p>
          </div>

          {/* stylised corridor diagram */}
          <div className="rounded-2xl border border-white/10 bg-ink-900 p-6">
            <ul className="space-y-3">
              {routes.map((r) => (
                <li
                  key={r.code}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-800 px-5 py-4"
                >
                  <span className="flex items-center gap-2 font-medium text-white">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    {r.a}
                    <span className="text-slate-500">⇄</span>
                    {r.b}
                  </span>
                  <span className="text-xs text-slate-400">
                    ~{r.hours}
                    {c.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {dict.testimonials.title}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {dict.testimonials.items.map((t, i) => (
              <figure
                key={i}
                className="flex flex-col rounded-2xl border border-white/10 bg-ink-800 p-6"
              >
                <div className="text-3xl leading-none text-teal-400">“</div>
                <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-slate-200">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 border-t border-white/10 pt-4 text-sm">
                  <span className="font-semibold text-white">{t.author}</span>
                  <span className="text-slate-500"> · {t.city}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="bg-ink-850 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {dict.gallery.title}
            </h2>
            <p className="mt-3 text-slate-400">{dict.gallery.subtitle}</p>
          </div>
          <div className="mt-10">
            <Gallery />
          </div>
        </div>
      </section>

      {/* ── Parent group (GHF SARL) ── */}
      <section className="relative overflow-hidden border-y border-white/10 bg-ink-850">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              {dict.parent.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {dict.parent.title}
            </h2>
            <p className="mt-3 text-slate-400">{dict.parent.text}</p>
          </div>
          <Link
            href={`/${lang}/about`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h2 className="max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            {dict.hero.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/destinations`}
              className="rounded-full bg-teal-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-teal-400"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
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
