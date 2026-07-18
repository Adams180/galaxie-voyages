"use client";

import { useState } from "react";

export type ServiceFormLabels = {
  note: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  departureDate: string;
  returnDate: string;
  pickup: string;
  destination: string;
  passengers: string;
  busType: string;
  busTypeVip: string;
  busTypeClassic: string;
  busModel: string;
  seats: string;
  plate: string;
  availability: string;
  message: string;
  submit: string;
  sending: string;
  success: string;
  disabled: string;
  error: string;
};

type Variant = "rental" | "deposit";
type Status = "idle" | "sending" | "success" | "disabled" | "error";

const field =
  "w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg placeholder:text-faint transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";
const labelCls = "mb-1 block text-xs font-semibold text-muted";

export default function ServiceRequestForm({
  variant,
  labels,
}: {
  variant: Variant;
  labels: ServiceFormLabels;
}) {
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const fields: Record<string, string> = {};
    fd.forEach((value, key) => {
      fields[key] = String(value);
    });
    setStatus("sending");
    try {
      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant, fields }),
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
        ✓ {labels.success}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">{labels.note}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>
            {variant === "deposit" ? labels.ownerName : labels.name} *
          </span>
          <input required className={field} type="text" name="name" />
        </label>
        <label className="block">
          <span className={labelCls}>{labels.phone} *</span>
          <input required className={field} type="tel" name="phone" />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelCls}>{labels.email}</span>
          <input className={field} type="email" name="email" />
        </label>

        {variant === "rental" ? (
          <>
            <label className="block">
              <span className={labelCls}>{labels.departureDate}</span>
              <input className={field} type="date" name="departureDate" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.returnDate}</span>
              <input className={field} type="date" name="returnDate" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.pickup}</span>
              <input className={field} type="text" name="pickup" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.destination}</span>
              <input className={field} type="text" name="destination" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.passengers}</span>
              <input className={field} type="number" min="1" name="passengers" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.busType}</span>
              <select className={field} name="busType" defaultValue="">
                <option value="" disabled>
                  —
                </option>
                <option value={labels.busTypeVip}>{labels.busTypeVip}</option>
                <option value={labels.busTypeClassic}>
                  {labels.busTypeClassic}
                </option>
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className={labelCls}>{labels.busModel}</span>
              <input className={field} type="text" name="busModel" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.seats}</span>
              <input className={field} type="number" min="1" name="seats" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.plate}</span>
              <input className={field} type="text" name="plate" />
            </label>
            <label className="block">
              <span className={labelCls}>{labels.availability}</span>
              <input className={field} type="text" name="availability" />
            </label>
          </>
        )}

        <label className="block sm:col-span-2">
          <span className={labelCls}>{labels.message}</span>
          <textarea className={field} rows={4} name="message" />
        </label>
      </div>

      {status === "disabled" && (
        <p className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-highlight">
          {labels.disabled}
        </p>
      )}
      {status === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {labels.error}
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
        {status === "sending" ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
