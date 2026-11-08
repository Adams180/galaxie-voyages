import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import {
  listArticles,
  translationFor,
  effectivelyPublished,
  type ArticleStatus,
  type Locale,
} from "@/lib/newsroom";
import { requirePublisher } from "./guard";
import { deleteArticleAction, signOutAction } from "./actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const statusKey: Record<ArticleStatus, string> = {
  draft: "statusDraft",
  published: "statusPublished",
  scheduled: "statusScheduled",
  unpublished: "statusUnpublished",
};
const statusColor: Record<ArticleStatus, string> = {
  draft: "bg-slate-500/15 text-slate-500 dark:text-slate-300",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  scheduled: "bg-gold-400/15 text-highlight",
  unpublished: "bg-red-500/15 text-red-600 dark:text-red-300",
};

export default async function NewsroomDashboard({
  params,
}: PageProps<"/[lang]/newsroom">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const actor = await requirePublisher(lang);
  const dict = await getDictionary(lang);
  const nr = dict.newsroom;
  const articles = await listArticles();

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-fg">
            {nr.dashboardTitle}
          </h1>
          <p className="mt-1 text-sm text-faint">{actor.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${lang}/newsroom/team`}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-gold-400/50 hover:text-highlight"
          >
            {nr.team}
          </Link>
          <Link
            href={`/${lang}/newsroom/audit`}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-gold-400/50 hover:text-highlight"
          >
            {nr.audit}
          </Link>
          <Link
            href={`/${lang}/newsroom/new`}
            className="gv-press rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-300"
          >
            + {nr.newArticle}
          </Link>
          <form action={signOutAction}>
            <input type="hidden" name="lang" value={lang} />
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:text-fg"
            >
              {nr.signOut}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {articles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-10 text-center text-sm text-faint">
            {nr.noArticles}
          </p>
        ) : (
          articles.map((a) => {
            const t = translationFor(a, lang as Locale);
            const live = effectivelyPublished(a);
            return (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${statusColor[a.status]}`}
                    >
                      {nr[statusKey[a.status] as keyof typeof nr]}
                    </span>
                    {a.legacy && (
                      <span className="rounded-full bg-elevated px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-faint">
                        legacy
                      </span>
                    )}
                    <span className="text-xs text-faint">
                      {fmt(a.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-1 truncate font-semibold text-fg">
                    {t?.title ?? "—"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {live && (
                    <Link
                      href={`/${lang}/news/${a.slug}`}
                      className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-accent"
                    >
                      {nr.preview}
                    </Link>
                  )}
                  <Link
                    href={`/${lang}/newsroom/${a.id}`}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-elevated"
                  >
                    {nr.edit}
                  </Link>
                  <form action={deleteArticleAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
                    >
                      {nr.delete}
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
