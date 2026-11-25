import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { authConfigured } from "@/lib/auth";
import { requestSignInAction } from "../actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[lang]/newsroom/signin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const nr = dict.newsroom;
  const error = typeof sp.error === "string" ? sp.error : "";
  const sent = sp.sent === "1";

  const field =
    "w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg placeholder:text-faint transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-black tracking-tight text-fg">
        {nr.signinTitle}
      </h1>
      <p className="mt-2 text-sm text-muted">{nr.signinSubtitle}</p>

      {!authConfigured ? (
        <p className="mt-6 rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-highlight">
          {nr.notConfigured}
        </p>
      ) : sent ? (
        <p className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
          ✓ {nr.emailLabel}
        </p>
      ) : (
        <form action={requestSignInAction} className="mt-6 space-y-4">
          <input type="hidden" name="lang" value={lang} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">
              {nr.emailLabel}
            </span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              className={field}
            />
          </label>
          {error === "unauthorized" && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {nr.unauthorized}
            </p>
          )}
          <button
            type="submit"
            className="gv-press w-full rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-300"
          >
            {nr.sendLink}
          </button>
        </form>
      )}
    </section>
  );
}
