import { addNews, deleteNews, listNews, newsStorageReady } from "@/lib/news";

// News feed API.
//  GET                      → public list of published items
//  POST { action:"verify" } → check the admin password (x-news-token header)
//  POST { title, body, … }  → publish an item   (requires admin token)
//  DELETE ?id=…             → remove an item     (requires admin token)
//
// The admin password is the NEWS_ADMIN_TOKEN env var. Whoever holds it can
// publish — share it with select staff, or keep it to a single administrator.
export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.NEWS_ADMIN_TOKEN ?? "";

const authorized = (request: Request) =>
  ADMIN_TOKEN !== "" && request.headers.get("x-news-token") === ADMIN_TOKEN;

export async function GET() {
  const items = await listNews();
  return Response.json({ enabled: newsStorageReady(), items });
}

export async function POST(request: Request) {
  // Publishing needs both a linked KV store and a configured password.
  if (!newsStorageReady() || ADMIN_TOKEN === "")
    return Response.json({ enabled: false }, { status: 503 });

  const body = await request.json().catch(() => null);

  if (body?.action === "verify") {
    return authorized(request)
      ? Response.json({ ok: true })
      : Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!authorized(request))
    return Response.json({ error: "unauthorized" }, { status: 401 });

  const title = String(body?.title ?? "").trim().slice(0, 160);
  const text = String(body?.body ?? "").trim().slice(0, 6000);
  const image = String(body?.image ?? "").trim().slice(0, 500);
  const author = String(body?.author ?? "").trim().slice(0, 80);
  if (!title || !text)
    return Response.json({ error: "title and body are required" }, { status: 400 });

  const item = await addNews({
    title,
    body: text,
    image: image || undefined,
    author: author || undefined,
  });
  if (!item)
    return Response.json({ error: "storage unavailable" }, { status: 503 });

  return Response.json({ item }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!newsStorageReady() || ADMIN_TOKEN === "")
    return Response.json({ enabled: false }, { status: 503 });
  if (!authorized(request))
    return Response.json({ error: "unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return Response.json({ error: "missing id" }, { status: 400 });

  const ok = await deleteNews(id);
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
}
