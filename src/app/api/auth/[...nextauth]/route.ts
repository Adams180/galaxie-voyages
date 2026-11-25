import { handlers } from "@/lib/auth";

// Auth.js route handler (magic-link request, callback, session, sign-out).
// Lives under /api so the i18n proxy leaves it alone.
export const { GET, POST } = handlers;
