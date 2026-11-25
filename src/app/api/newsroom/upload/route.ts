import { put } from "@vercel/blob";
import { currentPublisher } from "@/lib/auth";
import { logAudit } from "@/lib/newsroom";

// Managed image upload for the newsroom (Part B). Stores to Vercel Blob instead
// of accepting unrestricted external URLs. Auth-enforced; validates type/size.
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(request: Request) {
  const actor = await currentPublisher();
  if (!actor) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return Response.json({ enabled: false }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File))
    return Response.json({ error: "no file" }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return Response.json({ error: "unsupported type" }, { status: 415 });
  if (file.size > MAX_BYTES)
    return Response.json({ error: "too large" }, { status: 413 });

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const key = `news/${crypto.randomUUID()}.${ext}`;
  try {
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type,
    });
    await logAudit({
      ts: Date.now(),
      actor: actor.email,
      action: "upload",
      detail: blob.pathname,
    });
    return Response.json({ url: blob.url });
  } catch {
    return Response.json({ error: "upload failed" }, { status: 502 });
  }
}
