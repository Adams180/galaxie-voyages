import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { requirePublisher } from "../guard";
import ArticleEditor from "@/components/ArticleEditor";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewArticlePage({
  params,
}: PageProps<"/[lang]/newsroom/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requirePublisher(lang);
  const dict = await getDictionary(lang);
  const nr = dict.newsroom;

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <Link
        href={`/${lang}/newsroom`}
        className="text-sm font-semibold text-muted hover:text-accent"
      >
        {nr.backToDashboard}
      </Link>
      <h1 className="mt-4 text-2xl font-black tracking-tight text-fg">
        {nr.editorNew}
      </h1>
      <div className="mt-6">
        <ArticleEditor
          lang={lang}
          labels={nr}
          article={null}
          uploadEnabled={!!process.env.BLOB_READ_WRITE_TOKEN}
        />
      </div>
    </section>
  );
}
