import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { ensureCommentsMigrated, listApproved, listPending } from "@/lib/comments";
import { requirePublisher } from "../guard";
import { moderateCommentAction, deleteCommentAction } from "../actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CommentsModerationPage({
  params,
}: PageProps<"/[lang]/newsroom/comments">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requirePublisher(lang);
  const dict = await getDictionary(lang);
  const nr = dict.newsroom;
  await ensureCommentsMigrated();
  const [pending, approved] = await Promise.all([
    listPending(200),
    listApproved(200),
  ]);

  const fmt = (ts: number) => new Date(ts).toLocaleString();

  const Row = ({
    id,
    name,
    text,
    ts,
    showApprove,
  }: {
    id: string;
    name: string;
    text: string;
    ts: number;
    showApprove: boolean;
  }) => (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-fg">{name}</span>
        <span className="text-xs text-faint">{fmt(ts)}</span>
      </div>
      <p className="mt-2 text-sm text-muted">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {showApprove && (
          <form action={moderateCommentAction}>
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="decision" value="approved" />
            <button className="rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-300">
              {nr.approve}
            </button>
          </form>
        )}
        <form action={moderateCommentAction}>
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="rejected" />
          <button className="rounded-full border border-gold-400/40 px-3 py-1.5 text-xs font-semibold text-highlight transition hover:bg-gold-400/10">
            {nr.reject}
          </button>
        </form>
        <form action={deleteCommentAction}>
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={id} />
          <button className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-300">
            {nr.deleteComment}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <Link
        href={`/${lang}/newsroom`}
        className="text-sm font-semibold text-muted hover:text-accent"
      >
        {nr.backToDashboard}
      </Link>
      <h1 className="mt-4 text-2xl font-black tracking-tight text-fg">
        {nr.commentsTitle}
      </h1>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-accent">
        {nr.pendingTitle} ({pending.length})
      </h2>
      <div className="mt-3 space-y-3">
        {pending.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-faint">
            {nr.noPending}
          </p>
        ) : (
          pending.map((c) => <Row key={c.id} {...c} showApprove />)
        )}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-accent">
        {nr.approvedTitle} ({approved.length})
      </h2>
      <div className="mt-3 space-y-3">
        {approved.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-faint">
            {nr.noApproved}
          </p>
        ) : (
          approved.map((c) => <Row key={c.id} {...c} showApprove={false} />)
        )}
      </div>
    </section>
  );
}
