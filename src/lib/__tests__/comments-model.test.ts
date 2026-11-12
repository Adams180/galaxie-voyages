// Unit tests for the public-comments validation model (Part C).
//   node --experimental-strip-types --test src/lib/__tests__/comments-model.test.ts
import assert from "node:assert/strict";
import {
  validateComment,
  countLinks,
  isPublic,
  collectCommentsByStatus,
  type Comment,
} from "../comments-model.ts";

let passed = 0;
const ok = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log("  ✓ " + name);
};

ok("accepts a normal comment and trims", () => {
  const v = validateComment("  Aline  ", "  Great trip!  ");
  assert.equal(v.ok, true);
  if (v.ok) {
    assert.equal(v.name, "Aline");
    assert.equal(v.text, "Great trip!");
  }
});
ok("rejects too-short name/text (length)", () => {
  assert.deepEqual(validateComment("A", "hello"), { ok: false, reason: "length" });
  assert.deepEqual(validateComment("Aline", "x"), { ok: false, reason: "length" });
});
ok("rejects over-long text (length)", () => {
  assert.deepEqual(validateComment("Aline", "x".repeat(601)), {
    ok: false,
    reason: "length",
  });
});
ok("rejects link spam (> 2 urls)", () => {
  const spam = "buy http://a.com http://b.com http://c.com";
  assert.deepEqual(validateComment("Aline", spam), { ok: false, reason: "spam" });
});
ok("allows up to 2 links", () => {
  const v = validateComment("Aline", "see http://a.com and http://b.com");
  assert.equal(v.ok, true);
});
ok("countLinks counts http and https", () => {
  assert.equal(countLinks("http://a HTTPS://b nope"), 2);
  assert.equal(countLinks("no links here"), 0);
});
ok("only approved comments are public", () => {
  const base: Comment = { id: "1", name: "A", text: "b", ts: 0, status: "pending" };
  assert.equal(isPublic(base), false);
  assert.equal(isPublic({ ...base, status: "approved" }), true);
  assert.equal(isPublic({ ...base, status: "rejected" }), false);
});


// Status filtering must scan past newer comments of other statuses.
const rows: Comment[] = Array.from({ length: 250 }, (_, i) => ({
  id: `c-${i}`, name: "Tester", text: "Message", ts: 1000 - i,
  status: (i === 170 || i === 235 ? "approved" :
    i === 11 || i === 230 ? "pending" : "rejected"),
}));
const page = async (offset: number, size: number) =>
  rows.slice(offset, offset + size);

const approvedOlder = await collectCommentsByStatus("approved", 2, page, 25);
assert.deepEqual(approvedOlder.map((c) => c.id), ["c-170", "c-235"]);
passed++;
console.log("  ✓ status scan finds approved comments beyond newest all-status limit");

const pendingOlder = await collectCommentsByStatus("pending", 2, page, 25);
assert.deepEqual(pendingOlder.map((c) => c.id), ["c-11", "c-230"]);
passed++;
console.log("  ✓ status scan finds pending comments beyond newest all-status limit");

const sparse = async (offset: number, size: number) =>
  rows.slice(offset, offset + size).map((c) => c.id === "c-5" ? null : c);
const sparseResult = await collectCommentsByStatus("approved", 2, sparse, 25);
assert.deepEqual(sparseResult.map((c) => c.id), ["c-170", "c-235"]);
passed++;
console.log("  ✓ missing indexed records do not shift pagination");

await assert.rejects(
  collectCommentsByStatus("approved", 1, async () => {
    throw new Error("Redis connection failed");
  }, 25),
  /Redis connection failed/,
);
passed++;
console.log("  ✓ Redis read failure propagates rather than presenting an empty list");

console.log(`\n${passed} comments-model tests passed.`);
