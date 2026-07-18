"use client";

import { useState } from "react";

export type NewsAdminLabels = {
  passwordLabel: string;
  unlock: string;
  unlocking: string;
  wrongPassword: string;
  notConfigured: string;
  lock: string;
  formTitle: string;
  fieldTitle: string;
  fieldBody: string;
  fieldImage: string;
  fieldAuthor: string;
  publish: string;
  publishing: string;
  publishError: string;
  publishedTitle: string;
  empty: string;
  delete: string;
  confirmDelete: string;
};

type NewsItem = {
  id: string;
  title: string;
  body: string;
  image?: string;
  author?: string;
  ts: number;
};

const field =
  "w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg placeholder:text-faint transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";
const labelCls = "mb-1 block text-xs font-semibold text-muted";

export default function NewsAdmin({
  labels,
  lang,
}: {
  labels: NewsAdminLabels;
  lang: string;
}) {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateBusy, setGateBusy] = useState(false);
  const [gateError, setGateError] = useState("");

  const [items, setItems] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("");
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishError, setPublishError] = useState("");

  const auth = (extra?: HeadersInit): HeadersInit => ({
    "x-news-token": token,
    ...extra,
  });

  const loadItems = async () => {
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data?.items)) setItems(data.items);
    } catch {
      /* ignore */
    }
  };

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || gateBusy) return;
    setGateBusy(true);
    setGateError("");
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: auth({ "Content-Type": "application/json" }),
        body: JSON.stringify({ action: "verify" }),
      });
      if (res.ok) {
        setUnlocked(true);
        await loadItems();
        return;
      }
      setGateError(res.status === 401 ? labels.wrongPassword : labels.notConfigured);
    } catch {
      setGateError(labels.notConfigured);
    } finally {
      setGateBusy(false);
    }
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || publishBusy) return;
    setPublishBusy(true);
    setPublishError("");
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: auth({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          image: image.trim(),
          author: author.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.item) {
        setItems((cur) => [data.item, ...cur]);
        setTitle("");
        setBody("");
        setImage("");
        setAuthor("");
      } else {
        setPublishError(labels.publishError);
      }
    } catch {
      setPublishError(labels.publishError);
    } finally {
      setPublishBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(labels.confirmDelete)) return;
    try {
      const res = await fetch(`/api/news?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: auth(),
      });
      if (res.ok) setItems((cur) => cur.filter((it) => it.id !== id));
    } catch {
      /* ignore */
    }
  };

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (!unlocked) {
    return (
      <form
        onSubmit={unlock}
        className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8"
      >
        <label className="block">
          <span className={labelCls}>{labels.passwordLabel}</span>
          <input
            type="password"
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className={field}
          />
        </label>
        {gateError && (
          <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {gateError}
          </p>
        )}
        <button
          type="submit"
          disabled={gateBusy}
          className="gv-press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
        >
          {gateBusy ? labels.unlocking : labels.unlock}
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
      {/* Publish form */}
      <form
        onSubmit={publish}
        className="rounded-2xl border border-line bg-surface p-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-fg">{labels.formTitle}</h2>
          <button
            type="button"
            onClick={() => {
              setUnlocked(false);
              setToken("");
            }}
            className="text-xs font-semibold text-faint hover:text-accent"
          >
            {labels.lock}
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className={labelCls}>{labels.fieldTitle} *</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className={labelCls}>{labels.fieldBody} *</span>
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className={labelCls}>{labels.fieldImage}</span>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              className={field}
            />
          </label>
          <label className="block">
            <span className={labelCls}>{labels.fieldAuthor}</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={field}
            />
          </label>
          {publishError && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {publishError}
            </p>
          )}
          <button
            type="submit"
            disabled={publishBusy}
            className="gv-press inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
          >
            {publishBusy && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-900/30 border-t-navy-900" />
            )}
            {publishBusy ? labels.publishing : labels.publish}
          </button>
        </div>
      </form>

      {/* Published list */}
      <div>
        <h2 className="text-lg font-bold text-fg">{labels.publishedTitle}</h2>
        <div className="mt-5 space-y-3">
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-faint">
              {labels.empty}
            </p>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface p-4"
              >
                <div className="min-w-0">
                  <div className="text-xs text-faint">{fmtDate(it.ts)}</div>
                  <div className="truncate font-semibold text-fg">
                    {it.title}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {it.body}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="shrink-0 rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
                >
                  {labels.delete}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
