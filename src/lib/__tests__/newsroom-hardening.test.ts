// Security / data-integrity unit tests for the B-hardening findings.
//   node --experimental-strip-types --test src/lib/__tests__/newsroom-hardening.test.ts
import assert from "node:assert/strict";
import {
  mergePublicNews,
  coerceStatus,
  managedImageUrl,
  authorizeEmail,
  legacyToArticle,
  type Article,
} from "../newsroom-model.ts";

let passed = 0;
const ok = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log("  ✓ " + name);
};

const art = (over: Partial<Article>): Article => ({
  id: "x", slug: "x", status: "published", primaryLocale: "fr",
  translations: { fr: { title: "T", body: "B" } },
  author: { email: "a@b" }, createdAt: 1, updatedAt: 1, publishedAt: 1,
  revisions: [], ...over,
});

// --- Finding #3/#1: authorization fails closed + owner revocation ---
ok("empty allowlist denies everyone (accounts unseeded)", () => {
  assert.equal(authorizeEmail("a@b.com", [], []), false);
});
ok("allowlisted address is authorized", () => {
  assert.equal(authorizeEmail("a@b.com", ["a@b.com"], []), true);
});
ok("revocation beats the allowlist (owner-controlled disable)", () => {
  assert.equal(authorizeEmail("a@b.com", ["a@b.com"], ["a@b.com"]), false);
});
ok("null/empty email denied", () => {
  assert.equal(authorizeEmail(null, ["a@b.com"], []), false);
  assert.equal(authorizeEmail("", ["a@b.com"], []), false);
});
ok("authorization is case-insensitive", () => {
  assert.equal(authorizeEmail("A@B.com", ["a@b.com"], []), true);
});

// --- Finding #2: migration tombstones vs legacy fallback ---
const L1 = legacyToArticle({ id: "L1", title: "One", body: "b", ts: 100 });
const L2 = legacyToArticle({ id: "L2", title: "Two", body: "b", ts: 200 });
ok("non-migrated legacy item is shown", () => {
  const out = mergePublicNews([], [L1, L2], new Set());
  assert.deepEqual(out.map((a) => a.id), ["L2", "L1"]);
});
ok("migrated+unpublished item does NOT reappear from legacy", () => {
  // L1 migrated then unpublished -> absent from model, but tombstoned.
  const out = mergePublicNews([], [L1, L2], new Set(["L1"]));
  assert.deepEqual(out.map((a) => a.id), ["L2"]);
});
ok("migrated+deleted item does NOT reappear from legacy", () => {
  const out = mergePublicNews([], [L1], new Set(["L1"]));
  assert.deepEqual(out.map((a) => a.id), []);
});
ok("model item dedupes the legacy copy by id", () => {
  const modelL1 = art({ id: "L1", slug: "one", publishedAt: 150 });
  const out = mergePublicNews([modelL1], [L1, L2], new Set(["L1"]));
  // L1 only once (from model), L2 from legacy
  assert.deepEqual(out.map((a) => a.id).sort(), ["L1", "L2"]);
  assert.equal(out.filter((a) => a.id === "L1").length, 1);
});
ok("repeated migration is stable (idempotent tombstones)", () => {
  const once = mergePublicNews([], [L1, L2], new Set(["L1", "L2"]));
  const twice = mergePublicNews([], [L1, L2], new Set(["L1", "L2"]));
  assert.deepEqual(once, twice);
  assert.deepEqual(once.map((a) => a.id), []); // both migrated -> none from legacy
});
ok("concurrent legacy write (new id) still appears until migrated", () => {
  const L3 = legacyToArticle({ id: "L3", title: "Three", body: "b", ts: 300 });
  const out = mergePublicNews([], [L1, L2, L3], new Set(["L1", "L2"]));
  assert.deepEqual(out.map((a) => a.id), ["L3"]);
});

// --- Finding #4: input validation ---
ok("coerceStatus accepts valid statuses only", () => {
  for (const s of ["draft", "scheduled", "published", "unpublished"])
    assert.equal(coerceStatus(s), s);
  assert.equal(coerceStatus("live"), null);
  assert.equal(coerceStatus(""), null);
  assert.equal(coerceStatus("__proto__"), null);
});
ok("managedImageUrl accepts only Blob URLs, preserves unchanged, rejects external", () => {
  const blob = "https://abc123.public.blob.vercel-storage.com/news/x.jpg";
  assert.equal(managedImageUrl(blob), blob);
  assert.equal(managedImageUrl(""), "");
  assert.equal(managedImageUrl("https://evil.example.com/x.jpg"), "");
  assert.equal(managedImageUrl("javascript:alert(1)"), "");
  // unchanged legacy value preserved
  assert.equal(
    managedImageUrl("https://old.example.com/legacy.jpg", "https://old.example.com/legacy.jpg"),
    "https://old.example.com/legacy.jpg",
  );
  // changed to a non-blob value is rejected
  assert.equal(
    managedImageUrl("https://new.evil.com/x.jpg", "https://old.example.com/legacy.jpg"),
    "",
  );
});

console.log(`\n${passed} hardening tests passed.`);
