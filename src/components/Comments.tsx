"use client";

import { useEffect, useState } from "react";

export type Seed = { name: string; text: string };

type Labels = {
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  localNote: string;
  you: string;
};

type StoredComment = { id: string; name: string; text: string; ts: number };

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
  const [mine, setMine] = useState<StoredComment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setMine(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const entry: StoredComment = {
      id: crypto.randomUUID(),
      name: name.trim(),
      text: text.trim(),
      ts: Date.now(),
    };
    const next = [entry, ...mine];
    setMine(next);
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
            className="w-full rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300"
          >
            {labels.submit}
          </button>
          <p className="text-xs text-faint">{labels.localNote}</p>
        </div>
      </form>

      {/* list */}
      <div className="space-y-4">
        {mine.map((c) => (
          <CommentCard
            key={c.id}
            name={c.name}
            text={c.text}
            meta={`${labels.you} · ${fmtDate(c.ts)}`}
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
      className={`flex gap-4 rounded-2xl border bg-surface p-5 ${
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
