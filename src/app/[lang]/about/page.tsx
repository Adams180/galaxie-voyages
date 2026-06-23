import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const a = dict.about;

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
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {a.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{a.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-5 text-slate-300">
          {a.story.map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-6">
          <h2 className="text-lg font-bold text-white">{a.missionTitle}</h2>
          <p className="mt-2 text-slate-200">{a.mission}</p>
        </div>
      </section>

      <section className="bg-ink-850">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-white">{a.valuesTitle}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {a.values.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-ink-800 p-6"
              >
                <div className="text-2xl font-black text-teal-300">
                  0{i + 1}
                </div>
                <h3 className="mt-3 font-semibold text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {v.text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-slate-400">
            {a.parentNote}
          </p>
        </div>
      </section>
    </>
  );
}
