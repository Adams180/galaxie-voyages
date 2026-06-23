"use client";

import { useState } from "react";

type Labels = {
  formNote: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formMessage: string;
  formSubmit: string;
  formSuccess: string;
};

export default function ContactForm({ labels }: { labels: Labels }) {
  const [sent, setSent] = useState(false);

  const field =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";
  const label = "mb-1 block text-xs font-semibold text-slate-400";

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-300">
        ✓ {labels.formSuccess}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-4"
    >
      <p className="text-sm text-slate-400">{labels.formNote}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{labels.formName}</span>
          <input required className={field} type="text" name="name" />
        </label>
        <label className="block">
          <span className={label}>{labels.formPhone}</span>
          <input required className={field} type="tel" name="phone" />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>{labels.formEmail}</span>
          <input className={field} type="email" name="email" />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>{labels.formMessage}</span>
          <textarea required className={field} rows={5} name="message" />
        </label>
      </div>
      <button
        type="submit"
        className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-400"
      >
        {labels.formSubmit}
      </button>
    </form>
  );
}
