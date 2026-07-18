import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import NewsAdmin from "@/components/NewsAdmin";

// Admin surface: keep it out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function NewsAdminPage({
  params,
}: PageProps<"/[lang]/news/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const a = dict.newsAdmin;

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
            {a.title}
          </h1>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as CSSProperties}
            className="mt-3 max-w-2xl text-slate-300"
          >
            {a.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <NewsAdmin labels={a} lang={lang} />
      </section>
    </>
  );
}
