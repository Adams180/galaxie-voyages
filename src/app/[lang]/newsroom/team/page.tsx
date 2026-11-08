import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { publisherAllowlist } from "@/lib/auth";
import { listRevoked } from "@/lib/newsroom";
import { requirePublisher } from "../guard";
import { revokeAction } from "../actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: PageProps<"/[lang]/newsroom/team">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const actor = await requirePublisher(lang);
  const dict = await getDictionary(lang);
  const nr = dict.newsroom;
  const revoked = await listRevoked();
  const revokedSet = new Set(revoked.map((e) => e.toLowerCase()));

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <Link
        href={`/${lang}/newsroom`}
        className="text-sm font-semibold text-muted hover:text-accent"
      >
        {nr.backToDashboard}
      </Link>
      <h1 className="mt-4 text-2xl font-black tracking-tight text-fg">
        {nr.teamTitle}
      </h1>
      <p className="mt-2 text-sm text-muted">{nr.teamNote}</p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-accent">
        {nr.allowlistTitle}
      </h2>
      <div className="mt-3 space-y-2">
        {publisherAllowlist.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-faint">
            {nr.noPublishers}
          </p>
        ) : (
          publisherAllowlist.map((email) => {
            const isRevoked = revokedSet.has(email);
            return (
              <div
                key={email}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-fg">{email}</div>
                  {isRevoked && (
                    <span className="text-xs font-semibold text-red-500">
                      {nr.revokedTitle}
                    </span>
                  )}
                  {email === actor.email && (
                    <span className="ml-1 text-xs text-faint">(you)</span>
                  )}
                </div>
                <form action={revokeAction}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="email" value={email} />
                  <input
                    type="hidden"
                    name="reinstate"
                    value={isRevoked ? "1" : "0"}
                  />
                  <button
                    type="submit"
                    disabled={email === actor.email && !isRevoked}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                      isRevoked
                        ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300"
                        : "border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-300"
                    }`}
                  >
                    {isRevoked ? nr.reinstate : nr.revoke}
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
