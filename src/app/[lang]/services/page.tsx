import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import ServiceRequestForm from "@/components/ServiceRequestForm";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

// Simple line icons, matching the site's stroke style.
const icons = {
  people: (
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  ),
  goods: (
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
  ),
  rental: (
    <path d="M8 6v6M16 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9h4M6 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM16 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
  ),
  deposit: (
    <path d="M3 21h18M6 18V9M10 18V9M14 18V9M18 18V9M12 2 3 7h18l-9-5z" />
  ),
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
    >
      {children}
    </svg>
  );
}

export default async function ServicesPage({
  params,
}: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const o = dict.offers;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 400px at 80% 0%, #1a3a6e, transparent), linear-gradient(180deg, #0a172d, #060b16)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-32 sm:px-6">
          <h1
            data-reveal
            className="text-3xl font-black tracking-tight text-white sm:text-4xl"
          >
            {o.title}
          </h1>
          <p
            data-reveal
            style={delay(90)}
            className="mt-3 max-w-2xl text-slate-300"
          >
            {o.subtitle}
          </p>
        </div>
      </section>

      {/* Informational offers */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { key: "people", icon: icons.people, c: o.people },
            { key: "goods", icon: icons.goods, c: o.goods },
          ].map((s, i) => (
            <div
              key={s.key}
              data-reveal
              style={delay(i * 120)}
              className="group rounded-2xl border border-line bg-surface p-7 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy-900/15"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-elevated">
                <Icon>{s.icon}</Icon>
              </div>
              <h2 className="mt-5 text-xl font-bold text-fg">{s.c.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {s.c.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Rental form */}
      <section
        id="location"
        className="border-t border-line bg-band scroll-mt-24"
      >
        <div className="mx-auto max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <div data-reveal="left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface">
              <Icon>{icons.rental}</Icon>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-fg">{o.rental.title}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {o.rental.text}
            </p>
          </div>
          <div
            data-reveal="right"
            className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:mt-0"
          >
            <ServiceRequestForm variant="rental" labels={o.form} />
          </div>
        </div>
      </section>

      {/* Deposit form */}
      <section id="depot" className="border-t border-line scroll-mt-24">
        <div className="mx-auto max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <div data-reveal="left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-elevated">
              <Icon>{icons.deposit}</Icon>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-fg">{o.deposit.title}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {o.deposit.text}
            </p>
          </div>
          <div
            data-reveal="right"
            className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:mt-0"
          >
            <ServiceRequestForm variant="deposit" labels={o.form} />
          </div>
        </div>
      </section>
    </>
  );
}
