import "server-only";
import { redirect } from "next/navigation";
import { currentPublisher } from "@/lib/auth";

/** Gate a newsroom page on an authenticated, non-revoked publisher. */
export async function requirePublisher(lang: string) {
  const actor = await currentPublisher();
  if (!actor) redirect(`/${lang}/newsroom/signin`);
  return actor;
}
