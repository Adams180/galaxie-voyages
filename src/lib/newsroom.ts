import "server-only";
import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import {
  type Article,
  type ArticleInput,
  type ArticleRevision,
  type ArticleStatus,
  type Locale,
  effectivelyPublished,
  legacyToArticle,
  slugify,
  translationFor,
} from "./newsroom-model";

export * from "./newsroom-model";

// Newsroom article store (Part B). Source of truth for news, backed by the
// existing Upstash Redis — no new service. Existing shared-token articles are
// migrated in without losing their IDs, content or publication date.
//
// Keys:
//   news:article:<id>   JSON Article
//   news:index          sorted set of ids, scored by createdAt (newest first)
//   news:slug:<slug>    id   (slug uniqueness + lookup)
//   news:migrated       "1"  once legacy import has run
//
// Legacy list "galaxie:news" (shared-token admin) is left intact for rollback.

const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const redis = url && token ? new Redis({ url, token }) : null;

export const newsroomReady = () => redis !== null;

const KEY = (id: string) => `news:article:${id}`;
const SLUG = (slug: string) => `news:slug:${slug}`;
const INDEX = "news:index";
const parse = <T>(x: unknown): T =>
  typeof x === "string" ? (JSON.parse(x) as T) : (x as T);

async function uniqueSlug(desired: string, selfId?: string): Promise<string> {
  if (!redis) return desired;
  let slug = desired;
  for (let i = 0; i < 50; i++) {
    const owner = await redis.get<string>(SLUG(slug));
    if (!owner || owner === selfId) return slug;
    slug = `${desired}-${i + 2}`;
  }
  return `${desired}-${randomUUID().slice(0, 6)}`;
}

export async function listArticles(): Promise<Article[]> {
  if (!redis) return [];
  try {
    const ids = await redis.zrange<string[]>(INDEX, 0, -1, { rev: true });
    if (!ids.length) return [];
    const raw = await redis.mget<unknown[]>(...ids.map(KEY));
    return raw.filter(Boolean).map((x) => parse<Article>(x));
  } catch {
    return [];
  }
}

export async function listPublishedArticles(
  locale: Locale,
  now = Date.now(),
): Promise<Article[]> {
  const all = await listArticles();
  return all
    .filter((a) => effectivelyPublished(a, now) && translationFor(a, locale))
    .sort((x, y) => (y.publishedAt ?? y.createdAt) - (x.publishedAt ?? x.createdAt));
}

export async function getArticle(id: string): Promise<Article | null> {
  if (!redis) return null;
  const raw = await redis.get<unknown>(KEY(id));
  return raw ? parse<Article>(raw) : null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!redis) return null;
  const id = await redis.get<string>(SLUG(slug));
  return id ? getArticle(id) : null;
}

/** Create or update an article, recording a revision. Returns the saved one. */
export async function saveArticle(
  input: ArticleInput,
  editor: { email: string; name?: string },
): Promise<Article | null> {
  if (!redis) return null;
  const now = Date.now();
  const existing = input.id ? await getArticle(input.id) : null;
  const id = existing?.id ?? input.id ?? randomUUID();

  const primaryTitle =
    input.translations[input.primaryLocale]?.title ??
    Object.values(input.translations)[0]?.title ??
    "";
  const desiredSlug = slugify(input.slug || primaryTitle, id);
  const slug = await uniqueSlug(desiredSlug, id);

  const publishedAt =
    input.status === "published"
      ? existing?.publishedAt ?? now
      : input.status === "scheduled"
        ? input.scheduledFor
        : existing?.publishedAt;

  const revisions = existing?.revisions ?? [];
  const nextRev: ArticleRevision = {
    rev: revisions.length + 1,
    ts: now,
    editorEmail: editor.email,
    status: input.status,
    translations: input.translations,
    image: input.image,
  };

  const article: Article = {
    id,
    slug,
    status: input.status,
    primaryLocale: input.primaryLocale,
    translations: input.translations,
    image: input.image,
    author: existing?.author ?? { email: editor.email, name: editor.name },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt,
    scheduledFor: input.status === "scheduled" ? input.scheduledFor : undefined,
    revisions: [...revisions, nextRev].slice(-50),
    legacy: existing?.legacy,
  };

  // Maintain slug index (free an old slug if it changed).
  if (existing && existing.slug !== slug) await redis.del(SLUG(existing.slug));
  await redis.set(KEY(id), JSON.stringify(article));
  await redis.set(SLUG(slug), id);
  await redis.zadd(INDEX, { score: article.createdAt, member: id });
  return article;
}

/** Restore a prior revision as a new current revision. */
export async function restoreRevision(
  id: string,
  rev: number,
  editor: { email: string; name?: string },
): Promise<Article | null> {
  const a = await getArticle(id);
  if (!a) return null;
  const target = a.revisions.find((r) => r.rev === rev);
  if (!target) return null;
  return saveArticle(
    {
      id,
      slug: a.slug,
      status: target.status,
      primaryLocale: a.primaryLocale,
      translations: target.translations,
      image: target.image,
      scheduledFor: a.scheduledFor,
    },
    editor,
  );
}

export async function setStatus(
  id: string,
  status: ArticleStatus,
  editor: { email: string; name?: string },
): Promise<Article | null> {
  const a = await getArticle(id);
  if (!a) return null;
  return saveArticle(
    {
      id,
      slug: a.slug,
      status,
      primaryLocale: a.primaryLocale,
      translations: a.translations,
      image: a.image,
      scheduledFor: a.scheduledFor,
    },
    editor,
  );
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!redis) return false;
  const a = await getArticle(id);
  if (!a) return false;
  await redis.del(KEY(id));
  await redis.del(SLUG(a.slug));
  await redis.zrem(INDEX, id);
  return true;
}

/** Idempotently import legacy shared-token items into the article store. */
export async function migrateLegacyNews(): Promise<{ migrated: number }> {
  if (!redis) return { migrated: 0 };
  let migrated = 0;
  try {
    const raw = await redis.lrange<unknown>("galaxie:news", 0, -1);
    for (const item of raw) {
      const legacy = parse<{
        id: string;
        title: string;
        body: string;
        image?: string;
        author?: string;
        ts: number;
      }>(item);
      if (!legacy?.id) continue;
      if (await redis.get(KEY(legacy.id))) continue; // already imported
      const article = legacyToArticle(legacy);
      await redis.set(KEY(article.id), JSON.stringify(article));
      await redis.set(SLUG(article.slug), article.id);
      await redis.zadd(INDEX, { score: article.createdAt, member: article.id });
      migrated++;
    }
    await redis.set("news:migrated", "1");
  } catch {
    /* ignore — migration is best-effort and idempotent */
  }
  return { migrated };
}

/** Run the legacy import once (guarded by a flag). */
export async function ensureMigrated(): Promise<void> {
  if (!redis) return;
  try {
    const done = await redis.get("news:migrated");
    if (!done) await migrateLegacyNews();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Audit log (per-publisher activity)
// ---------------------------------------------------------------------------

export type AuditEntry = {
  ts: number;
  actor: string;
  action: string;
  articleId?: string;
  detail?: string;
};

export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!redis) return;
  try {
    await redis.lpush("news:audit", JSON.stringify(entry));
    await redis.ltrim("news:audit", 0, 499);
  } catch {
    /* ignore */
  }
}

export async function listAudit(limit = 100): Promise<AuditEntry[]> {
  if (!redis) return [];
  try {
    const raw = await redis.lrange<unknown>("news:audit", 0, limit - 1);
    return raw.map((x) => parse<AuditEntry>(x));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Runtime publisher revocation (immediate account disable, beyond the env
// allowlist) — checked on every privileged request.
// ---------------------------------------------------------------------------

export async function revokePublisher(email: string): Promise<void> {
  if (!redis) return;
  await redis.sadd("news:revoked", email.toLowerCase());
}

export async function reinstatePublisher(email: string): Promise<void> {
  if (!redis) return;
  await redis.srem("news:revoked", email.toLowerCase());
}

export async function isRevoked(email: string): Promise<boolean> {
  if (!redis) return false;
  try {
    return (await redis.sismember("news:revoked", email.toLowerCase())) === 1;
  } catch {
    return false;
  }
}

export async function listRevoked(): Promise<string[]> {
  if (!redis) return [];
  try {
    return await redis.smembers("news:revoked");
  } catch {
    return [];
  }
}

/**
 * Public news feed: published articles from the model, unioned with any legacy
 * shared-token items not yet migrated (deduped by id, model wins). Guarantees
 * the public feed never drops an item during the transition period.
 */
export async function listPublicNews(
  locale: Locale,
  now = Date.now(),
): Promise<Article[]> {
  const model = await listPublishedArticles(locale, now);
  const seen = new Set(model.map((a) => a.id));
  let legacyExtra: Article[] = [];
  try {
    const { listNews } = await import("./news");
    legacyExtra = (await listNews())
      .filter((n) => !seen.has(n.id))
      .map(legacyToArticle);
  } catch {
    /* ignore */
  }
  return [...model, ...legacyExtra].sort(
    (x, y) => (y.publishedAt ?? y.createdAt) - (x.publishedAt ?? x.createdAt),
  );
}
