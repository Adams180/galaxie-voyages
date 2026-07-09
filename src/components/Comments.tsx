"use client";

import { useEffect, useState } from "react";

export type Seed = { name: string; text: string };

type Labels = {
  nameLabel: string;
  namePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  sharedNote: string;
  you: string;
};

type Comment = { id: string; name: string; text: string; ts: number };

const KEY = "galaxie_comments_v1";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Comments({
  labels,
  seeds,
}: {
  labels: Labels;
  seeds: Seed[];
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [shared, setShared] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/comments", { cache: "no-store" });
        const data = await res.json();
        if (active && data?.enabled && Array.isArray(data.comments)) {
          setShared(true);
          setComments(data.comments);
          return;
        }
      } catch {
        /* fall through to local */
      }
      // local fallback
      try {
        const raw = localStorage.getItem(KEY);
        if (active && raw) setComments(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || busy) return;
    const entry: Comment = {
      id: crypto.randomUUID(),
      name: name.trim(),
      text: text.trim(),
      ts: Date.now(),
    };

    if (shared) {
      setBusy(true);
      try {
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: entry.name, text: entry.text }),
        });
        const data = await res.json();
        if (res.ok && data?.comment) {
          setComments((cur) => [data.comment, ...cur]);
          setName("");
          setText("");
        }
      } catch {
        /* ignore */
      } finally {
        setBusy(false);
      }
      return;
    }

    // local mode
    const next = [entry, ...comments];
    setComments(next);
    setName("");
    setText("");
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const field =
    "w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg placeholder:text-faint focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
      {/* form */}
      <form
        onSubmit={submit}
        className="rounded-2xl border border-line bg-surface p-6"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              {labels.nameLabel} *
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.namePlaceholder}
              className={field}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              {labels.messageLabel} *
            </span>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={labels.messagePlaceholder}
              className={field}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="gv-press w-full rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
          >
            {labels.submit}
          </button>
          {shared && (
            <p className="text-xs text-faint">{labels.sharedNote}</p>
          )}
        </div>
      </form>

      {/* list */}
      <div className="space-y-4">
        {comments.map((cm) => (
          <CommentCard
            key={cm.id}
            name={cm.name}
            text={cm.text}
            meta={`${shared ? "" : labels.you + " · "}${fmtDate(cm.ts)}`}
            highlight
          />
        ))}
        {seeds.map((s, i) => (
          <CommentCard key={`seed-${i}`} name={s.name} text={s.text} />
        ))}
      </div>
    </div>
  );
}

function CommentCard({
  name,
  text,
  meta,
  highlight,
}: {
  name: string;
  text: string;
  meta?: string;
  highlight?: boolean;
}) {
  return (
    <figure
      className={`flex gap-4 rounded-2xl border bg-surface p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy-900/5 ${
        highlight ? "border-gold-400/40" : "border-line"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-gold-300">
        {initials(name)}
      </div>
      <div>
        <figcaption className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-fg">{name}</span>
          {meta && <span className="text-xs text-faint">{meta}</span>}
        </figcaption>
        <blockquote className="mt-1 text-sm leading-relaxed text-muted">
          {text}
        </blockquote>
      </div>
    </figure>
  );
}
