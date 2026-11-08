// Newsroom article model + pure helpers (no I/O, no server-only).
// Importable from both server storage code and plain-Node unit tests.

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];
export type ArticleStatus = "draft" | "scheduled" | "published" | "unpublished";

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
