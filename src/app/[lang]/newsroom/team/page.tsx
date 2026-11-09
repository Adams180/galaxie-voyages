import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { publisherAllowlist, revokedEmails } from "@/lib/auth";
import { requirePublisher } from "../guard";

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
  const revokedSet = new Set(revokedEmails);

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
      <p className="mt-2 rounded-lg border border-line bg-band px-4 py-3 text-xs text-faint">
        {nr.teamOwnerNote}
      </p>

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
                  {email === actor.email && (
                    <span className="text-xs text-faint">(you)</span>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isRevoked
                      ? "bg-red-500/15 text-red-600 dark:text-red-300"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                  }`}
                >
                  {isRevoked ? nr.statusSuspended : nr.statusActive}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
