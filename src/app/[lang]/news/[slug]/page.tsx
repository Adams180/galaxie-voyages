import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import {
  effectivelyPublished,
  getArticleBySlug,
  translationFor,
  type Locale,
} from "@/lib/newsroom";
import { renderBody, excerpt } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/news/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const a = await getArticleBySlug(slug);
  if (!a || !effectivelyPublished(a)) return {};
  const t = translationFor(a, lang as Locale);
  if (!t) return {};
  return {
    title: t.seoTitle || t.title,
    description: t.seoDescription || excerpt(t.body, 160),
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/[lang]/news/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const n = dict.news;

  const a = await getArticleBySlug(slug);
  if (!a || !effectivelyPublished(a)) notFound();
  const t = translationFor(a, lang as Locale);
  if (!t) notFound();

  const date = a.publishedAt ?? a.createdAt;
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-32 sm:px-6">
          <Link
            href={`/${lang}/news`}
            className="text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            {n.backToNews}
          </Link>
          <h1
            data-reveal
            className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl"
          >
            {t.title}
          </h1>
          <div
            data-reveal
            style={{ "--reveal-delay": "90ms" } as CSSProperties}
            className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-slate-300"
          >
            <time dateTime={new Date(date).toISOString()}>{fmtDate(date)}</time>
            {a.author?.name && (
              <>
                <span>·</span>
                <span>
                  {n.by} {a.author.name}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {a.image?.url && (
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-line bg-elevated">
            <Image
              src={a.image.url}
              alt={a.image.alt || t.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}
        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: renderBody(t.body) }}
        />
      </article>
    </>
  );
}
