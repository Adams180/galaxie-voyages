// Public-comments model + pure validation (no I/O, no server-only).
// Importable from server storage code and from plain-Node unit tests.

export type CommentStatus = "pending" | "approved" | "rejected";

export type Comment = {
  id: string;
  name: string;
  text: string;
  ts: number;
  status: CommentStatus;
  articleId?: string;
};

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const TEXT_MIN = 2;
export const TEXT_MAX = 600;
export const MAX_LINKS = 2;

/** Count http(s) URLs in a string — a crude but effective spam signal. */
export function countLinks(text: string): number {
  const m = text.match(/https?:\/\//gi);
  return m ? m.length : 0;
}

export type Validation =
  | { ok: true; name: string; text: string }
  | { ok: false; reason: "length" | "spam" };

/**
 * Validate and normalize a public comment submission. Length-bounded, and
 * rejected as spam when it carries too many links. (The honeypot and rate
 * limit are enforced separately at the request layer.)
 */
export function validateComment(
  rawName: unknown,
  rawText: unknown,
): Validation {
  const name = String(rawName ?? "").trim();
  const text = String(rawText ?? "").trim();
  if (
    name.length < NAME_MIN ||
    name.length > NAME_MAX ||
    text.length < TEXT_MIN ||
    text.length > TEXT_MAX
  ) {
    return { ok: false, reason: "length" };
  }
  if (countLinks(text) > MAX_LINKS) {
    return { ok: false, reason: "spam" };
  }
  return { ok: true, name, text };
}

/** Public visibility rule: only approved comments are ever shown publicly. */
export function isPublic(c: Comment): boolean {
  return c.status === "approved";
}
