// Contact form → email, via Resend's REST API (no SDK dependency).
// Configure in Vercel: RESEND_API_KEY, and optionally CONTACT_TO / CONTACT_FROM.
// Without RESEND_API_KEY the route reports { enabled: false } and the client
// shows a "call/WhatsApp us" fallback instead of pretending to send.
export const dynamic = "force-dynamic";

const API_KEY = process.env.RESEND_API_KEY ?? "";
const TO = process.env.CONTACT_TO ?? "ghfsarl@yahoo.com";
const FROM =
  process.env.CONTACT_FROM ?? "Galaxie Voyages <onboarding@resend.dev>";

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (ch) =>
    ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : "&quot;",
  );

export async function POST(request: Request) {
  if (!API_KEY) return Response.json({ enabled: false }, { status: 503 });

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 120);
  const phone = String(body?.phone ?? "").trim().slice(0, 40);
  const email = String(body?.email ?? "").trim().slice(0, 160);
  const message = String(body?.message ?? "").trim().slice(0, 4000);
  if (!name || !phone || !message)
    return Response.json({ error: "missing fields" }, { status: 400 });

  const html = `
    <h2>Nouveau message — Galaxie Voyages</h2>
    <p><strong>Nom:</strong> ${esc(name)}</p>
    <p><strong>Téléphone:</strong> ${esc(phone)}</p>
    ${email ? `<p><strong>E-mail:</strong> ${esc(email)}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${esc(message)}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `Contact site — ${name}`,
        html,
        ...(email ? { reply_to: email } : {}),
      }),
    });
    if (!res.ok) {
      return Response.json({ error: "send failed" }, { status: 502 });
    }
    return Response.json({ enabled: true, sent: true });
  } catch {
    return Response.json({ error: "send failed" }, { status: 502 });
  }
}
