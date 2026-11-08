import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { listAudit } from "@/lib/newsroom";
import { requirePublisher } from "../guard";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AuditPage({
  params,
}: PageProps<"/[lang]/newsroom/audit">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requirePublisher(lang);
  const dict = await getDictionary(lang);
  const nr = dict.newsroom;
  const entries = await listAudit(150);

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <Link
        href={`/${lang}/newsroom`}
        className="text-sm font-semibold text-muted hover:text-accent"
      >
        {nr.backToDashboard}
      </Link>
      <h1 className="mt-4 text-2xl font-black tracking-tight text-fg">
        {nr.auditTitle}
      </h1>

      <div className="mt-6 space-y-2">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-faint">
            {nr.auditEmpty}
          </p>
        ) : (
          entries.map((e, i) => (
            <div
              key={`${e.ts}-${i}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs"
            >
              <span className="font-mono text-faint">
                {new Date(e.ts).toLocaleString()}
              </span>
              <span className="font-semibold text-fg">{e.action}</span>
              <span className="text-muted">{e.actor}</span>
              {e.detail && <span className="text-faint">{e.detail}</span>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
