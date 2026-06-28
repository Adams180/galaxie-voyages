import type { CSSProperties } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { fleet } from "@/lib/data";

export default async function FleetPage({ params }: PageProps<"/[lang]/fleet">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const fl = dict.fleet;

  return (
    <>
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
            {fl.title}
          </h1>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as CSSProperties}
            className="mt-3 max-w-2xl text-slate-300"
          >
            {fl.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {fleet.map((coach, i) => {
            const cls = fl.classes[coach.key];
            const featured = coach.key === "vip";
            return (
              <div
                key={coach.key}
                data-reveal
                style={{ "--reveal-delay": `${i * 120}ms` } as CSSProperties}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy-900/15 ${
                  featured ? "border-gold-400/50 shadow-xl" : "border-line"
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={coach.img}
                    alt={cls.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {featured && (
                    <span className="absolute left-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-navy-900">
                      ★ {fl.featured}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h2 className="text-xl font-bold text-fg">{cls.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {cls.text}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-highlight">
                    {coach.seats} {fl.seats}
                  </div>
                  <ul className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-5 text-sm">
                    {coach.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-muted">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-accent"
                        >
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {fl.amenities[a]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
