// Service-offer forms (bus rental / bus deposit) → email, via Resend's REST API.
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

// Field labels per form variant, in the order they appear in the email.
const VARIANTS: Record<string, { subject: string; fields: [string, string][] }> = {
  rental: {
    subject: "Location de bus",
    fields: [
      ["name", "Nom complet"],
      ["phone", "Téléphone"],
      ["email", "E-mail"],
      ["departureDate", "Date de départ"],
      ["returnDate", "Date de retour"],
      ["pickup", "Lieu de prise en charge"],
      ["destination", "Destination"],
      ["passengers", "Nombre de passagers"],
      ["busType", "Type de bus"],
      ["message", "Message"],
    ],
  },
  deposit: {
    subject: "Dépôt de bus",
    fields: [
      ["name", "Nom du propriétaire"],
      ["phone", "Téléphone"],
      ["email", "E-mail"],
      ["busModel", "Marque / modèle du bus"],
      ["seats", "Nombre de places"],
      ["plate", "Immatriculation"],
      ["availability", "Disponibilité"],
      ["message", "Message"],
    ],
  },
};

export async function POST(request: Request) {
  if (!API_KEY) return Response.json({ enabled: false }, { status: 503 });

  const body = await request.json().catch(() => null);
  const variant = String(body?.variant ?? "");
  const spec = VARIANTS[variant];
  if (!spec) return Response.json({ error: "unknown variant" }, { status: 400 });

  const values = (body?.fields ?? {}) as Record<string, unknown>;
  const get = (k: string) => String(values[k] ?? "").trim().slice(0, 2000);

  // Name and phone are always required; the rest are optional.
  const name = get("name");
  const phone = get("phone");
  if (!name || !phone)
    return Response.json({ error: "missing fields" }, { status: 400 });

  const rows = spec.fields
    .map(([key, label]) => {
      const v = get(key);
      return v
        ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top">${esc(label)}</td><td style="padding:4px 0;white-space:pre-wrap">${esc(v)}</td></tr>`
        : "";
    })
    .join("");

  const html = `
    <h2>Nouvelle demande — ${esc(spec.subject)}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows}</table>
  `;

  const email = get("email");
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
        subject: `${spec.subject} — ${name}`,
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
