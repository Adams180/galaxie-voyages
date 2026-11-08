import "server-only";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

// Newsroom authentication (Auth.js v5 / NextAuth).
//
// Passwordless magic-link login delivered through the existing Resend account,
// with database (revocable) sessions and verification tokens stored in the
// existing Upstash Redis. No new external service is introduced.
//
// Access is invitation-only and capped at two publishers: only e-mail
// addresses listed in NEWS_PUBLISHER_EMAILS may sign in. Until management
// supplies the two authorized identities that variable stays empty, so no
// account can be created or used — nothing is fabricated here.
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

/** The approved publisher allowlist (max 2), lower-cased. Empty until set. */
export const publisherAllowlist = (process.env.NEWS_PUBLISHER_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)
  .slice(0, 2);

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
    // Server-side gate: only invited, approved publishers may sign in.
    signIn({ user }) {
      const email = user.email?.toLowerCase();
      return !!email && publisherAllowlist.includes(email);
    },
  },
});

/** Resolve the signed-in publisher, or null. Use in server code before any
 *  privileged action — never trust the client. Honours runtime revocation. */
export async function currentPublisher() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !publisherAllowlist.includes(email)) return null;
  // Runtime revocation (immediate account disable) overrides the allowlist.
  try {
    const { isRevoked } = await import("./newsroom");
    if (await isRevoked(email)) return null;
  } catch {
    /* if the store is unreachable, fall back to allowlist-only */
  }
  return { email, name: session?.user?.name ?? undefined };
}
