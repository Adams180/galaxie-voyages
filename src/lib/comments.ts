import "server-only";
import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import {
  type Comment,
  type CommentStatus,
  validateComment,
} from "./comments-model";

export * from "./comments-model";

// Redis-backed public comments with a pending-moderation workflow. Only
// approved comments are ever shown publicly. Browser-local storage is NOT used
// as a shared-publishing fallback — when the store is unavailable the UI shows a
// truthful "temporarily unavailable" state instead.
//
// Keys:
//   comments:item:<id>   JSON Comment
//   comments:index       sorted set of ids by ts (all statuses)
//   rl:comment:<ip>      rate-limit counter (TTL)
//   comments:migrated    "1" once legacy approved comments are imported

const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const redis = url && token ? new Redis({ url, token }) : null;

export const commentsReady = () => redis !== null;

const ITEM = (id: string) => `comments:item:${id}`;
const INDEX = "comments:index";
const parse = (x: unknown): Comment =>
  typeof x === "string" ? (JSON.parse(x) as Comment) : (x as Comment);

const RATE_MAX = 5; // submissions
const RATE_WINDOW = 600; // seconds (10 min)

/** Returns true if this ip is within the rate limit (and counts the hit). */
export async function withinRateLimit(ip: string): Promise<boolean> {
  if (!redis) return true;
  try {
    const key = `rl:comment:${ip}`;
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, RATE_WINDOW);
    return n <= RATE_MAX;
  } catch {
    // Fail closed on rate limiting: if we can't count, don't accept.
    return false;
  }
}

async function listByStatus(
  status: CommentStatus | "all",
  limit: number,
): Promise<Comment[]> {
  if (!redis) return [];
  try {
    const ids = await redis.zrange<string[]>(INDEX, 0, limit - 1, { rev: true });
    if (!ids.length) return [];
    const raw = await redis.mget<unknown[]>(...ids.map(ITEM));
    const all = raw.filter(Boolean).map(parse);
    return status === "all" ? all : all.filter((c) => c.status === status);
  } catch {
    return [];
  }
}

/** Public: approved comments only. */
export async function listApproved(limit = 100): Promise<Comment[]> {
  return listByStatus("approved", limit);
}

/** Moderation: pending queue. */
export async function listPending(limit = 200): Promise<Comment[]> {
  return listByStatus("pending", limit);
}

export async function listAllComments(limit = 300): Promise<Comment[]> {
  return listByStatus("all", limit);
}

/** Create a PENDING comment (never immediately public). */
export async function submitComment(input: {
  name: unknown;
  text: unknown;
  articleId?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!redis) return { ok: false, reason: "unavailable" };
  const v = validateComment(input.name, input.text);
  if (!v.ok) return { ok: false, reason: v.reason };
  const comment: Comment = {
    id: randomUUID(),
    name: v.name,
    text: v.text,
    ts: Date.now(),
    status: "pending",
    ...(input.articleId ? { articleId: input.articleId } : {}),
  };
  try {
    await redis.set(ITEM(comment.id), JSON.stringify(comment));
    await redis.zadd(INDEX, { score: comment.ts, member: comment.id });
    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export async function moderateComment(
  id: string,
  status: "approved" | "rejected",
): Promise<boolean> {
  if (!redis) return false;
  try {
    const raw = await redis.get<unknown>(ITEM(id));
    if (!raw) return false;
    const c = parse(raw);
    c.status = status;
    await redis.set(ITEM(id), JSON.stringify(c));
    return true;
  } catch {
    return false;
  }
}

export async function deleteComment(id: string): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.del(ITEM(id));
    await redis.zrem(INDEX, id);
    return true;
  } catch {
    return false;
  }
}

export async function pendingCount(): Promise<number> {
  return (await listPending(500)).length;
}

/**
 * Import pre-existing legacy comments (galaxie:comments) as APPROVED — they were
 * already public, so preserving them as approved is honest. Idempotent.
 */
export async function migrateLegacyComments(): Promise<{ migrated: number }> {
  if (!redis) return { migrated: 0 };
  let migrated = 0;
  try {
    const raw = await redis.lrange<unknown>("galaxie:comments", 0, -1);
    for (const item of raw) {
      const legacy = parse(item) as {
        id: string;
        name: string;
        text: string;
        ts: number;
      };
      if (!legacy?.id) continue;
      if (await redis.get(ITEM(legacy.id))) continue; // already imported
      const comment: Comment = {
        id: legacy.id,
        name: legacy.name,
        text: legacy.text,
        ts: legacy.ts,
        status: "approved",
      };
      await redis.set(ITEM(comment.id), JSON.stringify(comment));
      await redis.zadd(INDEX, { score: comment.ts, member: comment.id });
      migrated++;
    }
    await redis.set("comments:migrated", "1");
  } catch {
    /* best-effort + idempotent */
  }
  return { migrated };
}

export async function ensureCommentsMigrated(): Promise<void> {
  if (!redis) return;
  try {
    const done = await redis.get("comments:migrated");
    if (!done) await migrateLegacyComments();
  } catch {
    /* ignore */
  }
}
