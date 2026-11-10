"use client";

import { useEffect, useState } from "react";

export type Seed = { name: string; text: string };

type Labels = {
  nameLabel: string;
  namePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  moderationPending: string;
  unavailable: string;
  privacyNotice: string;
  validationError: string;
  rateError: string;
};

type Comment = { id: string; name: string; text: string; ts: number };
type State = "loading" | "ready" | "unavailable";

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
  const [state, setState] = useState<State>("loading");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/comments", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (data?.enabled && Array.isArray(data.comments)) {
          setComments(data.comments);
          setState("ready");
        } else {
          // No shared store → be truthful; never present local entries as shared.
          setState("unavailable");
        }
      } catch {
        if (active) setState("unavailable");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), text: text.trim(), website }),
      });
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setText("");
        return;
      }
      if (res.status === 429) setError(labels.rateError);
      else if (res.status === 503) setState("unavailable");
      else setError(labels.validationError);
    } catch {
      setError(labels.validationError);
    } finally {
      setBusy(false);
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
      {/* form / status */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        {state === "unavailable" ? (
          <p className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-highlight">
            {labels.unavailable}
          </p>
        ) : submitted ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-600 dark:text-emerald-300">
            ✓ {labels.moderationPending}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted">
                {labels.nameLabel} *
              </span>
              <input
                required
                maxLength={60}
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
                maxLength={600}
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={labels.messagePlaceholder}
                className={field}
              />
            </label>
            {/* Honeypot — screen-reader/visually hidden; bots fill it, humans don't.
                Uses sr-only (no off-screen positioning) to avoid page overflow. */}
            <div aria-hidden className="sr-only">
              <label>
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="gv-press w-full rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
            >
              {busy ? labels.submitting : labels.submit}
            </button>
            <p className="text-xs text-faint">{labels.privacyNotice}</p>
          </form>
        )}
      </div>

      {/* list: approved shared comments first, then curated testimonials */}
      <div className="space-y-4">
        {comments.map((cm) => (
          <CommentCard
            key={cm.id}
            name={cm.name}
            text={cm.text}
            meta={fmtDate(cm.ts)}
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
