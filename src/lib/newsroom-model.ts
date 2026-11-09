// Newsroom article model + pure helpers (no I/O, no server-only).
// Importable from both server storage code and plain-Node unit tests.

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];
export type ArticleStatus = "draft" | "scheduled" | "published" | "unpublished";
export const ARTICLE_STATUSES: ArticleStatus[] = [
  "draft",
  "scheduled",
  "published",
  "unpublished",
];

/** Coerce arbitrary input to a valid status, or null if not one. */
export function coerceStatus(s: string): ArticleStatus | null {
  return (ARTICLE_STATUSES as string[]).includes(s)
    ? (s as ArticleStatus)
    : null;
}

/**
 * Pure authorization decision for a publisher e-mail. Fails closed: an empty
 * address, an address on the owner-controlled revoked list, or one absent from
 * the allowlist all return false. Revocation always beats the allowlist.
 */
export function authorizeEmail(
  email: string | null | undefined,
  allowlist: string[],
  revoked: string[],
): boolean {
  const e = email?.toLowerCase();
  if (!e) return false;
  if (revoked.includes(e)) return false;
  return allowlist.includes(e);
}
export function managedImageUrl(url: string, existingUrl?: string): string {
  if (!url) return "";
  if (existingUrl && url === existingUrl) return url;
  try {
    const u = new URL(url);
    if (
      u.protocol === "https:" &&
      u.hostname.endsWith(".blob.vercel-storage.com")
    )
      return url;
  } catch {
    /* fall through to reject */
  }
  return "";
}

export type ArticleTranslation = {
  title: string;
  body: string; // Markdown
  seoTitle?: string;
  seoDescription?: string;
};

export type ArticleImage = { url: string; alt: string };

export type ArticleRevision = {
  rev: number;
  ts: number;
  editorEmail: string;
  status: ArticleStatus;
  translations: Partial<Record<Locale, ArticleTranslation>>;
  image?: ArticleImage;
};

export type Article = {
  id: string;
  slug: string;
  status: ArticleStatus;
  primaryLocale: Locale;
  translations: Partial<Record<Locale, ArticleTranslation>>;
  image?: ArticleImage;
  author: { email: string; name?: string };
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  scheduledFor?: number;
  revisions: ArticleRevision[];
  legacy?: boolean;
};

export type ArticleInput = {
  id?: string;
  slug?: string;
  status: ArticleStatus;
  primaryLocale: Locale;
  translations: Partial<Record<Locale, ArticleTranslation>>;
  image?: ArticleImage;
  scheduledFor?: number;
};

/** URL-safe slug from a title; falls back to a short id when empty. */
export function slugify(title: string, fallback = ""): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `article-${fallback.slice(0, 8)}`;
}

/** Whether an article is public right now (handles scheduled auto go-live). */
export function effectivelyPublished(a: Article, now = Date.now()): boolean {
  if (a.status === "published") return true;
  if (a.status === "scheduled" && a.scheduledFor != null)
    return a.scheduledFor <= now;
  return false;
}

/** The translation to show for a locale, falling back to the primary locale. */
export function translationFor(
  a: Article,
  locale: Locale,
): ArticleTranslation | undefined {
  return a.translations[locale] ?? a.translations[a.primaryLocale];
}

/** Map a legacy shared-token news item to an Article, preserving id + date. */
export function legacyToArticle(raw: {
  id: string;
  title: string;
  body: string;
  image?: string;
  author?: string;
  ts: number;
}): Article {
  const tr: ArticleTranslation = { title: raw.title, body: raw.body };
  const image = raw.image ? { url: raw.image, alt: "" } : undefined;
  return {
    id: raw.id,
    slug: slugify(raw.title, raw.id),
    status: "published",
    primaryLocale: "fr",
    translations: { fr: tr },
    image,
    author: { email: "legacy@galaxievoyages", name: raw.author || undefined },
    createdAt: raw.ts,
    updatedAt: raw.ts,
    publishedAt: raw.ts,
    revisions: [
      {
        rev: 1,
        ts: raw.ts,
        editorEmail: "legacy@galaxievoyages",
        status: "published",
        translations: { fr: tr },
        image,
      },
    ],
    legacy: true,
  };
}

/**
 * Merge the model's published articles with legacy shared-token items for the
 * public feed. A legacy item is shown ONLY when it is neither present in the
 * model (deduped by id) NOR already migrated (`migratedIds`). This guarantees
 * that once an article has been migrated, its visibility is governed solely by
 * the model — unpublishing or deleting it can never be undone by the legacy
 * fallback resurrecting the old copy.
 */
export function mergePublicNews(
  model: Article[],
  legacy: Article[],
  migratedIds: Set<string>,
): Article[] {
  const inModel = new Set(model.map((a) => a.id));
  const extra = legacy.filter(
    (a) => !inModel.has(a.id) && !migratedIds.has(a.id),
  );
  return [...model, ...extra].sort(
    (x, y) => (y.publishedAt ?? y.createdAt) - (x.publishedAt ?? x.createdAt),
  );
}
