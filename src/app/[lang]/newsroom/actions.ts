"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  currentPublisher,
  publisherAllowlist,
  signIn,
  signOut,
  authConfigured,
} from "@/lib/auth";
import {
  deleteArticle,
  logAudit,
  reinstatePublisher,
  restoreRevision,
  revokePublisher,
  saveArticle,
  setStatus,
  type ArticleStatus,
  type Locale,
  type ArticleTranslation,
} from "@/lib/newsroom";

async function requireActor() {
  const actor = await currentPublisher();
  if (!actor) throw new Error("unauthorized");
  return actor;
}

/** Request a passwordless magic link (only for approved, non-revoked emails). */
export async function requestSignInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const lang = String(formData.get("lang") ?? "fr");
  if (!authConfigured || !email || !publisherAllowlist.includes(email)) {
    redirect(`/${lang}/newsroom/signin?error=unauthorized`);
  }
  await signIn("resend", {
    email,
    redirectTo: `/${lang}/newsroom`,
  });
}

export async function signOutAction(formData: FormData) {
  const lang = String(formData.get("lang") ?? "fr");
  await signOut({ redirectTo: `/${lang}/newsroom/signin` });
}

function readTranslation(
  fd: FormData,
  loc: Locale,
): ArticleTranslation | undefined {
  const title = String(fd.get(`${loc}_title`) ?? "").trim();
  const body = String(fd.get(`${loc}_body`) ?? "").trim();
  if (!title && !body) return undefined;
  const seoTitle = String(fd.get(`${loc}_seoTitle`) ?? "").trim();
  const seoDescription = String(fd.get(`${loc}_seoDescription`) ?? "").trim();
  return {
    title,
    body,
    ...(seoTitle ? { seoTitle } : {}),
    ...(seoDescription ? { seoDescription } : {}),
  };
}

export async function saveArticleAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim() || undefined;
  const lang = String(formData.get("lang") ?? "fr");
  const primaryLocale = (String(formData.get("primaryLocale") ?? "fr") === "en"
    ? "en"
    : "fr") as Locale;
  const status = String(formData.get("status") ?? "draft") as ArticleStatus;

  const translations: Partial<Record<Locale, ArticleTranslation>> = {};
  const fr = readTranslation(formData, "fr");
  const en = readTranslation(formData, "en");
  if (fr) translations.fr = fr;
  if (en) translations.en = en;

  // Must have the primary-locale content at minimum.
  if (!translations[primaryLocale]?.title) {
    redirect(`/${lang}/newsroom/${id ?? "new"}?error=title-required`);
  }

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageAlt = String(formData.get("imageAlt") ?? "").trim();
  const scheduledForRaw = String(formData.get("scheduledFor") ?? "").trim();
  const scheduledFor =
    status === "scheduled" && scheduledForRaw
      ? new Date(scheduledForRaw).getTime()
      : undefined;

  const saved = await saveArticle(
    {
      id,
      slug: String(formData.get("slug") ?? "").trim() || undefined,
      status,
      primaryLocale,
      translations,
      image: imageUrl ? { url: imageUrl, alt: imageAlt } : undefined,
      scheduledFor,
    },
    actor,
  );

  await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: id ? "update" : "create",
    articleId: saved?.id,
    detail: status,
  });

  revalidatePath(`/${lang}/news`);
  revalidatePath(`/${lang}/newsroom`);
  redirect(`/${lang}/newsroom?saved=1`);
}

export async function deleteArticleAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  const lang = String(formData.get("lang") ?? "fr");
  await deleteArticle(id);
  await logAudit({ ts: Date.now(), actor: actor.email, action: "delete", articleId: id });
  revalidatePath(`/${lang}/news`);
  revalidatePath(`/${lang}/newsroom`);
  redirect(`/${lang}/newsroom?deleted=1`);
}

export async function setStatusAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "draft") as ArticleStatus;
  const lang = String(formData.get("lang") ?? "fr");
  await setStatus(id, status, actor);
  await logAudit({ ts: Date.now(), actor: actor.email, action: "status", articleId: id, detail: status });
  revalidatePath(`/${lang}/news`);
  revalidatePath(`/${lang}/newsroom`);
  redirect(`/${lang}/newsroom`);
}

export async function restoreRevisionAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  const rev = Number(formData.get("rev") ?? 0);
  const lang = String(formData.get("lang") ?? "fr");
  await restoreRevision(id, rev, actor);
  await logAudit({ ts: Date.now(), actor: actor.email, action: "restore", articleId: id, detail: `rev ${rev}` });
  revalidatePath(`/${lang}/news`);
  redirect(`/${lang}/newsroom/${id}?restored=1`);
}

export async function revokeAction(formData: FormData) {
  const actor = await requireActor();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const lang = String(formData.get("lang") ?? "fr");
  const reinstate = String(formData.get("reinstate") ?? "") === "1";
  if (reinstate) {
    await reinstatePublisher(email);
  } else {
    await revokePublisher(email);
  }
  await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: reinstate ? "reinstate" : "revoke",
    detail: email,
  });
  redirect(`/${lang}/newsroom/team`);
}
