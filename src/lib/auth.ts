import "server-only";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import { authorizeEmail } from "./newsroom-model";

// Newsroom authentication (Auth.js v5 / NextAuth).
//
// Passwordless magic-link login delivered through the existing Resend account,
// with database (revocable) sessions and verification tokens stored in the
// existing Upstash Redis. No new external service is introduced.
//
// Access is invitation-only and capped at two publishers: only e-mail
// addresses listed in NEWS_PUBLISHER_EMAILS may sign in. Revocation is
// OWNER-CONTROLLED: an account is disabled by listing its address in
// NEWS_REVOKED_EMAILS (a server/owner-managed variable). Publishers cannot
// revoke or reinstate each other — that authority sits outside the app.
//
// Both the allowlist and the revocation list are evaluated with no Redis
// dependency, so authorization FAILS CLOSED: any infrastructure error in the
// session layer makes auth() return no session, and the pure checks below then
// deny access rather than fall back to an allow.
//
// Required env to activate: AUTH_SECRET, RESEND_API_KEY, KV_REST_API_URL,
// KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* equivalents), and
// NEWS_PUBLISHER_EMAILS. While any are absent the newsroom reports that
// sign-in is not configured instead of pretending to work.

const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const redis = url && token ? new Redis({ url, token }) : null;

const parseList = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** The approved publisher allowlist (max 2), lower-cased. Empty until set. */
export const publisherAllowlist = parseList(
  process.env.NEWS_PUBLISHER_EMAILS,
).slice(0, 2);

/** Owner-controlled revocation list (disabled accounts), lower-cased. */
export const revokedEmails = parseList(process.env.NEWS_REVOKED_EMAILS);

/** Pure, infrastructure-free authorization decision. Fails closed. */
export function isAuthorizedPublisher(email: string | null | undefined): boolean {
  return authorizeEmail(email, publisherAllowlist, revokedEmails);
}

/** True only when every piece needed for real sign-in is present. */
export const authConfigured =
  redis !== null &&
  !!process.env.AUTH_SECRET &&
  !!process.env.RESEND_API_KEY &&
  publisherAllowlist.length > 0;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: redis ? UpstashRedisAdapter(redis) : undefined,
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY ?? "placeholder",
      from:
        process.env.CONTACT_FROM ??
        "Galaxie Voyages <onboarding@resend.dev>",
    }),
  ],
  callbacks: {
    // Server-side gate at magic-link authentication: only invited, approved,
    // non-revoked publishers may complete sign-in. Fails closed.
    signIn({ user }) {
      return isAuthorizedPublisher(user.email);
    },
  },
});

/** Resolve the signed-in publisher, or null. Use in server code before any
 *  privileged action — never trust the client. Fails closed on any error. */
export async function currentPublisher() {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();
    if (!isAuthorizedPublisher(email)) return null;
    return { email: email as string, name: session?.user?.name ?? undefined };
  } catch {
    // Any session/infrastructure error → deny (fail closed).
    return null;
  }
}
