import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { fleet } from "@/lib/data";

const coachImage: Record<string, string> = {
  vip: "/img/bus-interior.jpg",
  classic: "/img/bus-coaster.jpg",
};

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
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {fl.title}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">{fl.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {fleet.map((coach) => {
            const cls = fl.classes[coach.key];
            const featured = coach.key === "vip";
            return (
              <div
                key={coach.key}
                className={`flex flex-col overflow-hidden rounded-2xl border ${
                  featured
                    ? "border-teal-500/40 bg-gradient-to-br from-navy-600 to-ink-800 shadow-2xl"
                    : "border-white/10 bg-ink-800"
                }`}
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={coachImage[coach.key]}
                    alt={cls.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{cls.name}</h2>
                  {featured && (
                    <span className="rounded-full bg-teal-500 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
                      ★
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {cls.text}
                </p>
                <div className="mt-4 text-sm font-semibold text-teal-300">
                  {coach.seats} {fl.seats}
                </div>
                <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
                  {coach.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-slate-300">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-teal-300"
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
