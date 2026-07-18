import type { CSSProperties } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { listNews } from "@/lib/news";

// News is runtime content (Upstash Redis), so render at request time.
export const dynamic = "force-dynamic";

export default async function NewsPage({ params }: PageProps<"/[lang]/news">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const n = dict.news;
  const items = await listNews();

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
            {n.title}
          </h1>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as CSSProperties}
            className="mt-3 max-w-2xl text-slate-300"
          >
            {n.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {items.length === 0 ? (
          <div
            data-reveal
            className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-elevated text-accent">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8V6z" />
              </svg>
            </div>
            <p className="mt-5 text-base font-medium text-muted">{n.empty}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {items.map((item, i) => (
              <article
                key={item.id}
                data-reveal
                style={{ "--reveal-delay": `${Math.min(i, 4) * 90}ms` } as CSSProperties}
                className="overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy-900/10"
              >
                {item.image && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-elevated">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 896px) 100vw, 896px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-faint">
                    <time dateTime={new Date(item.ts).toISOString()}>
                      {fmtDate(item.ts)}
                    </time>
                    {item.author && (
                      <>
                        <span>·</span>
                        <span>
                          {n.by} {item.author}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-fg sm:text-2xl">
                    {item.title}
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
