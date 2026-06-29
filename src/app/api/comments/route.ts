import { Redis } from "@upstash/redis";

// Shared review storage. Uses Upstash Redis / Vercel KV when its env vars are
// present (link a KV store in the Vercel dashboard → redeploy). Until then the
// API reports `enabled: false` and the client falls back to localStorage.
export const dynamic = "force-dynamic";

const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "galaxie:comments";
const MAX = 200;

type Comment = { id: string; name: string; text: string; ts: number };

const parse = (x: unknown): Comment =>
  typeof x === "string" ? (JSON.parse(x) as Comment) : (x as Comment);

export async function GET() {
  if (!redis) return Response.json({ enabled: false, comments: [] });
  try {
    const raw = await redis.lrange(KEY, 0, 49);
    return Response.json({ enabled: true, comments: raw.map(parse) });
  } catch {
    return Response.json({ enabled: false, comments: [] });
  }
}

export async function POST(request: Request) {
  if (!redis)
    return Response.json({ enabled: false }, { status: 503 });

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 60);
  const text = String(body?.text ?? "").trim().slice(0, 600);
  if (!name || !text)
    return Response.json({ error: "name and text are required" }, { status: 400 });

  const comment: Comment = { id: crypto.randomUUID(), name, text, ts: Date.now() };
  try {
    await redis.lpush(KEY, JSON.stringify(comment));
    await redis.ltrim(KEY, 0, MAX - 1);
    return Response.json({ enabled: true, comment }, { status: 201 });
  } catch {
    return Response.json({ error: "storage unavailable" }, { status: 503 });
  }
}
