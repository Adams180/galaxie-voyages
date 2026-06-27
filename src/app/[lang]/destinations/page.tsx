import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { routes } from "@/lib/data";

export default async function DestinationsPage({
  params,
  searchParams,
}: PageProps<"/[lang]/destinations">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.destinations;
  const c = dict.common;

  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : "";
  const to = typeof sp.to === "string" ? sp.to : "";

  const touches = (r: { a: string; b: string }, city: string) =>
    r.a === city || r.b === city;
  const filtered = routes.filter(
    (r) => (!from || touches(r, from)) && (!to || touches(r, to)),
  );

  return (
    <>
      <PageHero title={d.title} subtitle={d.subtitle}>
        {(from || to) && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
            {from || "…"} <span className="text-teal-300">⇄</span> {to || "…"}
          </p>
        )}
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {/* desktop table */}
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-band text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">{d.tableRoute}</th>
                <th className="px-5 py-3 font-semibold">{d.tableDuration}</th>
                <th className="px-5 py-3 font-semibold">{d.tableDepartures}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr key={r.code} className="transition hover:bg-band">
                  <td className="px-5 py-4 font-semibold text-fg">
                    {r.a} <span className="text-accent">⇄</span> {r.b}
                    {r.popular && (
                      <span className="ml-2 rounded-full bg-gold-400/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-highlight">
                        {c.popular}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    ~{r.hours}
                    {c.hours}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {r.departures.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-elevated px-2 py-0.5 text-xs font-medium text-fg"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* mobile cards */}
          <div className="divide-y divide-line md:hidden">
            {filtered.map((r) => (
              <div key={r.code} className="p-4">
                <div className="flex items-center gap-2 font-semibold text-fg">
                  {r.a} <span className="text-accent">⇄</span> {r.b}
                </div>
                <div className="mt-1 text-xs text-muted">
                  ~{r.hours}
                  {c.hours}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.departures.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-elevated px-2 py-0.5 text-xs font-medium text-fg"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted">—</div>
          )}
        </div>

        <p className="mt-5 text-sm text-muted">{d.note}</p>
      </section>
    </>
  );
}

function PageHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
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
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}
