"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveArticleAction, restoreRevisionAction } from "@/app/[lang]/newsroom/actions";
import type { Article } from "@/lib/newsroom-model";
import RichTextEditor from "./RichTextEditor";

type Labels = Record<string, string>;

const field =
  "w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg placeholder:text-faint transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";
const labelCls = "mb-1 block text-xs font-semibold text-muted";

function SubmitButton({ labels }: { labels: Labels }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="gv-press inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
    >
      {pending ? labels.saving : labels.save}
    </button>
  );
}

export default function ArticleEditor({
  lang,
  labels,
  article,
  uploadEnabled,
}: {
  lang: string;
  labels: Labels;
  article: Article | null;
  uploadEnabled: boolean;
}) {
  const [tab, setTab] = useState<"fr" | "en">("fr");
  const [status, setStatus] = useState(article?.status ?? "draft");
  const [imageUrl, setImageUrl] = useState(article?.image?.url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fr = article?.translations.fr;
  const en = article?.translations.en;

  const schedDefault = article?.scheduledFor
    ? new Date(article.scheduledFor).toISOString().slice(0, 16)
    : "";

  const upload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/newsroom/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) setImageUrl(data.url);
      else setUploadError(data?.enabled === false ? labels.uploadDisabled : "⚠");
    } catch {
      setUploadError("⚠");
    } finally {
      setUploading(false);
    }
  };

  const tabBtn = (id: "fr" | "en", text: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        tab === id
          ? "bg-gold-400 text-navy-900"
          : "border border-line text-muted hover:text-fg"
      }`}
    >
      {text}
    </button>
  );

  return (
    <form action={saveArticleAction} className="space-y-6">
      <input type="hidden" name="lang" value={lang} />
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {/* Language tabs — both stay mounted so both are saved */}
      <div className="flex gap-2">
        {tabBtn("fr", labels.tabFr)}
        {tabBtn("en", labels.tabEn)}
      </div>

      <div className={tab === "fr" ? "space-y-4" : "hidden"}>
        <LocaleFields loc="fr" labels={labels} t={fr} uploadEnabled={uploadEnabled} />
      </div>
      <div className={tab === "en" ? "space-y-4" : "hidden"}>
        <LocaleFields loc="en" labels={labels} t={en} uploadEnabled={uploadEnabled} />
      </div>

      {/* Cover image */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <span className={labelCls}>{labels.imageLabel}</span>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="mt-2 max-h-48 rounded-lg border border-line object-cover"
          />
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted transition hover:text-fg">
            {uploading ? labels.uploading : labels.imageUpload}
            <input
              type="file"
              accept="image/*"
              disabled={!uploadEnabled || uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
              className="hidden"
            />
          </label>
          {!uploadEnabled && (
            <span className="text-xs text-faint">{labels.uploadDisabled}</span>
          )}
          {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
        </div>
        <label className="mt-3 block">
          <span className={labelCls}>{labels.imageAlt}</span>
          <input
            name="imageAlt"
            defaultValue={article?.image?.alt ?? ""}
            className={field}
          />
        </label>
      </div>

      {/* Settings */}
      <div className="grid gap-4 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>{labels.fieldSlug}</span>
          <input name="slug" defaultValue={article?.slug ?? ""} className={field} />
          <span className="mt-1 block text-[0.7rem] text-faint">
            {labels.slugHint}
          </span>
        </label>
        <label className="block">
          <span className={labelCls}>{labels.primaryLocaleLabel}</span>
          <select
            name="primaryLocale"
            defaultValue={article?.primaryLocale ?? "fr"}
            className={field}
          >
            <option value="fr">{labels.tabFr}</option>
            <option value="en">{labels.tabEn}</option>
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>{labels.fieldStatus}</span>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={field}
          >
            <option value="draft">{labels.statusDraft}</option>
            <option value="published">{labels.statusPublished}</option>
            <option value="scheduled">{labels.statusScheduled}</option>
            <option value="unpublished">{labels.statusUnpublished}</option>
          </select>
        </label>
        {status === "scheduled" && (
          <label className="block">
            <span className={labelCls}>{labels.fieldSchedule}</span>
            <input
              type="datetime-local"
              name="scheduledFor"
              defaultValue={schedDefault}
              className={field}
            />
          </label>
        )}
      </div>

      <SubmitButton labels={labels} />

      {/* Revision history */}
      {article && article.revisions.length > 1 && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="text-sm font-bold text-fg">{labels.revisionsTitle}</h3>
          <ul className="mt-3 space-y-2">
            {[...article.revisions].reverse().map((r) => (
              <li
                key={r.rev}
                className="flex items-center justify-between gap-3 text-xs text-muted"
              >
                <span>
                  #{r.rev} · {new Date(r.ts).toLocaleString()} · {labels.revisionBy}{" "}
                  {r.editorEmail}
                </span>
                <form action={restoreRevisionAction}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={article.id} />
                  <input type="hidden" name="rev" value={r.rev} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-3 py-1 font-semibold text-accent transition hover:bg-elevated"
                  >
                    {labels.restore}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

function LocaleFields({
  loc,
  labels,
  t,
  uploadEnabled,
}: {
  loc: "fr" | "en";
  labels: Labels;
  t?: { title: string; body: string; seoTitle?: string; seoDescription?: string };
  uploadEnabled: boolean;
}) {
  return (
    <>
      <label className="block">
        <span className={labelCls}>{labels.fieldTitle}</span>
        <input name={`${loc}_title`} defaultValue={t?.title ?? ""} className={field} />
      </label>
      <div className="block">
        <span className={labelCls}>{labels.fieldBody}</span>
        <RichTextEditor
          name={`${loc}_body`}
          initialHTML={t?.body ?? ""}
          labels={labels}
          uploadEnabled={uploadEnabled}
        />
        <span className="mt-1 block text-[0.7rem] text-faint">{labels.bodyHint}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>{labels.fieldSeoTitle}</span>
          <input
            name={`${loc}_seoTitle`}
            defaultValue={t?.seoTitle ?? ""}
            className={field}
          />
        </label>
        <label className="block">
          <span className={labelCls}>{labels.fieldSeoDescription}</span>
          <input
            name={`${loc}_seoDescription`}
            defaultValue={t?.seoDescription ?? ""}
            className={field}
          />
        </label>
      </div>
    </>
  );
}
