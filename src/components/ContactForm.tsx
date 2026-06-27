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
    "w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg placeholder:text-faint focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";
  const label = "mb-1 block text-xs font-semibold text-muted";

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-sm text-emerald-600 dark:text-emerald-300">
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
      <p className="text-sm text-muted">{labels.formNote}</p>
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
        className="rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300"
      >
        {labels.formSubmit}
      </button>
    </form>
  );
}
