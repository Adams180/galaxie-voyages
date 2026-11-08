// Unit tests for the newsroom pure model — run with Node type-stripping:
//   node --experimental-strip-types src/lib/__tests__/newsroom-model.test.ts
import assert from "node:assert/strict";
import {
  slugify,
  effectivelyPublished,
  translationFor,
  legacyToArticle,
  type Article,
} from "../newsroom-model.ts";

let passed = 0;
const ok = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log("  ✓ " + name);
};

// --- slugify ---
ok("slugify strips accents, lowercases, hyphenates", () => {
  assert.equal(slugify("Galaxie Voyages à Djoum !"), "galaxie-voyages-a-djoum");
  assert.equal(slugify("  Hello---World  "), "hello-world");
});
ok("slugify falls back to id when empty", () => {
  assert.ok(slugify("", "abcdef1234").startsWith("article-"));
  assert.equal(slugify("™©€ ✦"), "article-"); // no fallback id -> 'article-'
});

// --- effectivelyPublished (scheduling) ---
const base: Article = {
  id: "1", slug: "s", status: "draft", primaryLocale: "fr",
  translations: { fr: { title: "T", body: "B" } },
  author: { email: "a@b" }, createdAt: 0, updatedAt: 0, revisions: [],
};
ok("draft is not public", () => assert.equal(effectivelyPublished(base, 100), false));
ok("published is public", () =>
  assert.equal(effectivelyPublished({ ...base, status: "published" }, 100), true));
ok("unpublished is not public", () =>
  assert.equal(effectivelyPublished({ ...base, status: "unpublished" }, 100), false));
ok("scheduled in the future is not public yet", () =>
  assert.equal(
    effectivelyPublished({ ...base, status: "scheduled", scheduledFor: 200 }, 100),
    false,
  ));
ok("scheduled in the past has gone live", () =>
  assert.equal(
    effectivelyPublished({ ...base, status: "scheduled", scheduledFor: 50 }, 100),
    true,
  ));

// --- translationFor (i18n fallback) ---
ok("returns requested locale when present", () => {
  const a: Article = { ...base, translations: { fr: { title: "FR", body: "x" }, en: { title: "EN", body: "y" } } };
  assert.equal(translationFor(a, "en")?.title, "EN");
});
ok("falls back to primary locale when requested missing", () => {
  const a: Article = { ...base, primaryLocale: "fr", translations: { fr: { title: "FR", body: "x" } } };
  assert.equal(translationFor(a, "en")?.title, "FR");
});

// --- legacyToArticle (migration preserves id/content/date) ---
ok("migration preserves id, content and publication date", () => {
  const legacy = { id: "legacy-9", title: "Ancienne actu", body: "Corps", image: "https://x/y.jpg", author: "Adams", ts: 1700000000000 };
  const a = legacyToArticle(legacy);
  assert.equal(a.id, "legacy-9");
  assert.equal(a.publishedAt, 1700000000000);
  assert.equal(a.createdAt, 1700000000000);
  assert.equal(a.status, "published");
  assert.equal(a.primaryLocale, "fr");
  assert.equal(a.translations.fr?.title, "Ancienne actu");
  assert.equal(a.translations.fr?.body, "Corps");
  assert.equal(a.image?.url, "https://x/y.jpg");
  assert.equal(a.author.name, "Adams");
  assert.equal(a.legacy, true);
  assert.equal(a.revisions.length, 1);
  assert.equal(a.slug, "ancienne-actu");
});

console.log(`\n${passed} newsroom-model tests passed.`);
