import "server-only";
import { Redis } from "@upstash/redis";

// News storage. Uses Upstash Redis / Vercel KV when its env vars are present
// (link a KV store in the Vercel dashboard → redeploy). Until then the feed is
// empty and the admin publishing form reports that storage isn't configured.
const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "galaxie:news";
const MAX = 100;

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  image?: string;
  author?: string;
  ts: number;
};

/** Whether a KV store is linked (news can be stored/published). */
export const newsStorageReady = () => redis !== null;

const parse = (x: unknown): NewsItem =>
  typeof x === "string" ? (JSON.parse(x) as NewsItem) : (x as NewsItem);

/** Newest-first list of published news. Returns [] when storage is absent. */
export async function listNews(): Promise<NewsItem[]> {
  if (!redis) return [];
  try {
    const raw = await redis.lrange(KEY, 0, MAX - 1);
    return raw.map(parse);
  } catch {
    return [];
  }
}

export async function addNews(input: {
  title: string;
  body: string;
  image?: string;
  author?: string;
}): Promise<NewsItem | null> {
  if (!redis) return null;
  const item: NewsItem = {
    id: crypto.randomUUID(),
    title: input.title,
    body: input.body,
    ...(input.image ? { image: input.image } : {}),
    ...(input.author ? { author: input.author } : {}),
    ts: Date.now(),
  };
  try {
    await redis.lpush(KEY, JSON.stringify(item));
    await redis.ltrim(KEY, 0, MAX - 1);
    return item;
  } catch {
    return null;
  }
}

export async function deleteNews(id: string): Promise<boolean> {
  if (!redis) return false;
  try {
    const raw = await redis.lrange(KEY, 0, MAX - 1);
    const match = raw.find((x) => parse(x).id === id);
    if (match === undefined) return false;
    await redis.lrem(KEY, 1, match);
    return true;
  } catch {
    return false;
  }
}
