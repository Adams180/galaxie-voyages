"use client";

import { useState } from "react";

type Labels = {
  formNote: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formMessage: string;
  formSubmit: string;
  formSending: string;
  formSuccess: string;
  formDisabled: string;
  formError: string;
};

type Status = "idle" | "sending" | "success" | "disabled" | "error";

export default function ContactForm({ labels }: { labels: Labels }) {
  const [status, setStatus] = useState<Status>("idle");

  const field =
    "w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg placeholder:text-faint transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";
  const label = "mb-1 block text-xs font-semibold text-muted";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      const data = await res.json().catch(() => null);
      setStatus(data?.enabled === false ? "disabled" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-sm text-emerald-600 dark:text-emerald-300">
        ✓ {labels.formSuccess}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">{labels.formNote}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{labels.formName} *</span>
          <input required className={field} type="text" name="name" />
        </label>
        <label className="block">
          <span className={label}>{labels.formPhone} *</span>
          <input required className={field} type="tel" name="phone" />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>{labels.formEmail}</span>
          <input className={field} type="email" name="email" />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>{labels.formMessage} *</span>
          <textarea required className={field} rows={5} name="message" />
        </label>
      </div>

      {status === "disabled" && (
        <p className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-highlight">
          {labels.formDisabled}
        </p>
      )}
      {status === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {labels.formError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="gv-press inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:opacity-60"
      >
        {status === "sending" && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-900/30 border-t-navy-900" />
        )}
        {status === "sending" ? labels.formSending : labels.formSubmit}
      </button>
    </form>
  );
}
