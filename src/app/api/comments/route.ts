import {
  commentsReady,
  ensureCommentsMigrated,
  listApproved,
  submitComment,
  withinRateLimit,
} from "@/lib/comments";

// Public comments API with moderation:
//   GET  → APPROVED comments only (public-safe shape)
//   POST → validated, honeypot- and rate-limited, stored as PENDING
// Only approved comments are ever publicly visible.
export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return (
    xff?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET() {
  if (!commentsReady()) return Response.json({ enabled: false, comments: [] });
  try {
    await ensureCommentsMigrated();
    const approved = await listApproved(50);
    // Public shape only — never expose status, articleId internals, etc.
    return Response.json({
      enabled: true,
      comments: approved.map(({ id, name, text, ts }) => ({ id, name, text, ts })),
    });
  } catch (error) {
    console.error("[comments] read unavailable:", error);
    return Response.json(
      { enabled: false, comments: [] },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!commentsReady()) return Response.json({ enabled: false }, { status: 503 });

  const body = await request.json().catch(() => null);

  // Honeypot: real users never fill this hidden field. Return an accept-looking
  // response so bots don't learn, but store nothing.
  if (String(body?.website ?? "").trim() !== "") {
    return Response.json({ ok: true, status: "pending" }, { status: 201 });
  }

  if (!(await withinRateLimit(clientIp(request)))) {
    return Response.json({ error: "rate" }, { status: 429 });
  }

  const res = await submitComment({ name: body?.name, text: body?.text });
  if (!res.ok) {
    const status = res.reason === "unavailable" ? 503 : 400;
    return Response.json({ error: res.reason }, { status });
  }
  // Pending moderation — NOT yet public.
  return Response.json({ ok: true, status: "pending" }, { status: 201 });
}
