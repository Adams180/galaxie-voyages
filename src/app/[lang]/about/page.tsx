import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const a = dict.about;
  const c = dict.common;

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1000px 500px at 75% 0%, #1a3a6e, transparent), linear-gradient(180deg, #0a172d, #060b16)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            « {c.slogan} »
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {a.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{a.lead}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-5 text-muted">
          {a.story.map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}

          <div className="mt-8 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-6">
            <h2 className="text-lg font-bold text-fg">{a.missionTitle}</h2>
            <p className="mt-2 text-fg">{a.mission}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="relative aspect-[3/4]">
            <Image
              src="/vehicles/staff-coaster.jpg"
              alt="Galaxie Voyages"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-band">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-fg">{a.valuesTitle}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {a.values.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-surface p-6"
              >
                <div className="text-2xl font-black text-highlight">
                  0{i + 1}
                </div>
                <h3 className="mt-3 font-semibold text-fg">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {v.text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-muted">{a.parentNote}</p>
        </div>
      </section>
    </>
  );
}
