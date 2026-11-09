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
  getArticle,
  logAudit,
  restoreRevision,
  saveArticle,
  setStatus,
  coerceStatus,
  managedImageUrl,
  type Locale,
  type ArticleTranslation,
} from "@/lib/newsroom";
import { sanitizeBodyHtml } from "@/lib/markdown";
import { moderateComment, deleteComment } from "@/lib/comments";

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
  const title = String(fd.get(`${loc}_title`) ?? "").trim().slice(0, 200);
  // Rich-text HTML from the editor — sanitized server-side before storage
  // (defense in depth; the render path sanitizes again).
  const body = sanitizeBodyHtml(String(fd.get(`${loc}_body`) ?? "")).slice(
    0,
    50000,
  );
  if (!title && !body) return undefined;
  const seoTitle = String(fd.get(`${loc}_seoTitle`) ?? "").trim().slice(0, 200);
  const seoDescription = String(fd.get(`${loc}_seoDescription`) ?? "")
    .trim()
    .slice(0, 400);
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

  // Validate article identity: an update must reference an existing article.
  const existing = id ? await getArticle(id) : null;
  if (id && !existing) redirect(`/${lang}/newsroom?error=not-found`);

  const primaryLocale = (String(formData.get("primaryLocale") ?? "fr") === "en"
    ? "en"
    : "fr") as Locale;

  // Validate status (closed set; invalid rejected).
  const status = coerceStatus(String(formData.get("status") ?? ""));
  if (!status) redirect(`/${lang}/newsroom/${id ?? "new"}?error=bad-status`);

  const translations: Partial<Record<Locale, ArticleTranslation>> = {};
  const fr = readTranslation(formData, "fr");
  const en = readTranslation(formData, "en");
  if (fr) translations.fr = fr;
  if (en) translations.en = en;

  // Must have the primary-locale title at minimum.
  if (!translations[primaryLocale]?.title) {
    redirect(`/${lang}/newsroom/${id ?? "new"}?error=title-required`);
  }

  // Validate schedule: a scheduled article needs a finite future timestamp.
  const scheduledForRaw = String(formData.get("scheduledFor") ?? "").trim();
  let scheduledFor: number | undefined;
  if (status === "scheduled") {
    const ts = new Date(scheduledForRaw).getTime();
    if (!Number.isFinite(ts)) {
      redirect(`/${lang}/newsroom/${id ?? "new"}?error=bad-schedule`);
    }
    scheduledFor = ts;
  }

  // Validate image provenance (managed store only; preserve unchanged value).
  const imageUrl = managedImageUrl(
    String(formData.get("imageUrl") ?? "").trim(),
    existing?.image?.url,
  );
  const imageAlt = String(formData.get("imageAlt") ?? "").trim().slice(0, 300);

  const saved = await saveArticle(
    {
      id,
      slug: String(formData.get("slug") ?? "").trim().slice(0, 100) || undefined,
      status,
      primaryLocale,
      translations,
      image: imageUrl ? { url: imageUrl, alt: imageAlt } : undefined,
      scheduledFor,
    },
    actor,
  );

  const ok = await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: id ? "update" : "create",
    articleId: saved?.id,
    detail: status,
  });
  if (!ok) console.error("[audit] failed to record save", saved?.id);

  revalidatePath(`/${lang}/news`);
  revalidatePath(`/${lang}/newsroom`);
  redirect(`/${lang}/newsroom?saved=1`);
}

export async function deleteArticleAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim();
  const lang = String(formData.get("lang") ?? "fr");
  const existing = id ? await getArticle(id) : null;
  if (!existing) redirect(`/${lang}/newsroom?error=not-found`);

  // High-impact: record the audit first and fail closed if it can't be written.
  const ok = await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: "delete",
    articleId: id,
  });
  if (!ok) redirect(`/${lang}/newsroom?error=audit-unavailable`);

  await deleteArticle(id);
  revalidatePath(`/${lang}/news`);
  revalidatePath(`/${lang}/newsroom`);
  redirect(`/${lang}/newsroom?deleted=1`);
}

export async function setStatusAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim();
  const status = coerceStatus(String(formData.get("status") ?? ""));
  const lang = String(formData.get("lang") ?? "fr");
  if (!status) redirect(`/${lang}/newsroom?error=bad-status`);
  const existing = id ? await getArticle(id) : null;
  if (!existing) redirect(`/${lang}/newsroom?error=not-found`);

  // High-impact (publish/unpublish): audit first, fail closed.
  const ok = await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: "status",
    articleId: id,
    detail: status,
  });
  if (!ok) redirect(`/${lang}/newsroom?error=audit-unavailable`);

  await setStatus(id, status, actor);
  revalidatePath(`/${lang}/news`);
  revalidatePath(`/${lang}/newsroom`);
  redirect(`/${lang}/newsroom`);
}

export async function restoreRevisionAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim();
  const rev = Number(formData.get("rev") ?? 0);
  const lang = String(formData.get("lang") ?? "fr");
  const existing = id ? await getArticle(id) : null;
  if (!existing || !Number.isInteger(rev) || rev < 1) {
    redirect(`/${lang}/newsroom?error=bad-request`);
  }
  await restoreRevision(id, rev, actor);
  const ok = await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: "restore",
    articleId: id,
    detail: `rev ${rev}`,
  });
  if (!ok) console.error("[audit] failed to record restore", id);
  revalidatePath(`/${lang}/news`);
  redirect(`/${lang}/newsroom/${id}?restored=1`);
}

export async function moderateCommentAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim();
  const lang = String(formData.get("lang") ?? "fr");
  const decision = String(formData.get("decision") ?? "");
  if (!id || (decision !== "approved" && decision !== "rejected")) {
    redirect(`/${lang}/newsroom/comments?error=bad-request`);
  }
  const status = decision as "approved" | "rejected";
  // High-impact (makes content public / removes it): audit first, fail closed.
  const ok = await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: "moderate-comment",
    detail: `${status}:${id}`,
  });
  if (!ok) redirect(`/${lang}/newsroom/comments?error=audit-unavailable`);
  await moderateComment(id, status);
  revalidatePath(`/${lang}`);
  redirect(`/${lang}/newsroom/comments`);
}

export async function deleteCommentAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim();
  const lang = String(formData.get("lang") ?? "fr");
  if (!id) redirect(`/${lang}/newsroom/comments?error=bad-request`);
  const ok = await logAudit({
    ts: Date.now(),
    actor: actor.email,
    action: "delete-comment",
    detail: id,
  });
  if (!ok) redirect(`/${lang}/newsroom/comments?error=audit-unavailable`);
  await deleteComment(id);
  revalidatePath(`/${lang}`);
  redirect(`/${lang}/newsroom/comments`);
}
