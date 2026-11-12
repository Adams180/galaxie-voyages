# Galaxie Voyages — Public Passenger Metrics: Future Engineering Plan

> **STATUS: FUTURE ARCHITECTURE ONLY — PREPARED, NOT ACTIVATED.**
> This specifies a read-only, privacy-safe public passenger metric sourced
> from TMS‑X. It ships behind a **default-OFF feature flag** with **no live
> TMS‑X connection** in this campaign. The existing management-backed
> published figure is **preserved** until an approved replacement exists.
>
> TMS‑X specifics are marked **`[TBC]`** and must come from the official
> TMS‑X API documentation + a management-approved data-release decision.

---

## 1. Purpose
Replace the static homepage "passengers per year" figure with a trustworthy,
**aggregate-only** metric fed from TMS‑X — without exposing any individual
passenger data and without repurposing private operational/accounting APIs
as public endpoints.

## 2. What exists today (preserve it)
- `src/lib/data.ts` → `company.stats.passengersPerYear = "150 000+"`, rendered
  on the homepage ("Voyageurs par an" / "Passengers per year").
- This is a **management-backed published statistic**. It **stays unchanged**
  until an approved, sourced replacement metric is ready and signed off.
  The feature flag below defaults to showing exactly this existing value.

## 3. Hard privacy rules (non-negotiable)
The public contract may contain **only** approved aggregate values plus
non-sensitive update metadata. It must **never** return — directly or
derivably — passenger identity, gender, age, telephone, personal records,
tickets, or individual journey history.

- **No** private passenger-list, operator dashboard, or accounting API may be
  exposed as an anonymous public endpoint.
- Aggregates must be coarse enough to prevent re-identification (no
  small-cell counts that single out individuals).

## 4. Architecture

```
 TMS-X core (private)
      │  a NEW, dedicated, permission-scoped AGGREGATE endpoint  [TBC]
      │  returns approved totals only — no rows, no PII
      ▼
 Website metrics consumer   ← server-side, scoped read credential (Vercel env)
      │  caches in Redis with bounded freshness + provenance
      ▼
 Public metrics projection  ← /api/metrics/passengers (aggregate + metadata)
      ▼
 Homepage stat (behind default-OFF feature flag)
```

### 4.1 Dedicated TMS‑X aggregate endpoint `[TBC]`
A purpose-built endpoint that returns **pre-aggregated, release-approved**
figures only. It is **not** the passenger list or dashboard API with a filter
applied. It is permission-scoped to a read-only metrics role distinct from
Operator/Comptable.

### 4.2 Server-side website consumer
A small module (e.g. `src/lib/metrics.ts`) that calls the TMS‑X aggregate
endpoint server-side using a scoped credential from Vercel env, validates the
response shape, and caches it.

### 4.3 Caching, bounded freshness & provenance
- Cache the aggregate in Redis with a bounded TTL (e.g. 6–24h — a public
  headline number need not be real-time).
- Attach explicit **provenance**: `source` (e.g. `tmsx-aggregate`), `asOf`
  timestamp, and `coverage` window, so the site can show "as of <date>".
- On fetch failure, serve the last good cached value or fall back to the
  preserved management figure — never a fabricated or zero value.

## 5. Public contract (ILLUSTRATIVE — `[TBC]`)
```jsonc
// GET /api/metrics/passengers  (public projection)
{
  "value": 150000,            // approved aggregate only
  "display": "150 000+",      // preserves current presentation
  "period": "rolling-12m",    // coverage window [TBC]
  "source": "tmsx-aggregate", // or "company-published" when flag is OFF
  "asOf": "2026-01-31",       // non-sensitive update metadata
  "provisional": false
}
```
No field here identifies or describes any individual. `source` makes the
origin explicit to the site and to reviewers.

## 6. Historical vs digitized counts (must be distinguished)
TMS‑X digitized records cover only the period since TMS‑X adoption. Historical
company passenger counts predate that. The contract must **not** silently
merge the two. Options to agree with management `[TBC]`:
- Publish the **TMS‑X digitized** figure with an explicit coverage window, or
- Publish an **approved combined** figure clearly labelled as such.
Whichever is chosen, the `period`/`coverage` metadata states exactly what the
number represents. Provenance is mandatory, not optional.

## 7. Feature flag (default OFF)
- Flag: `NEXT_PUBLIC_PASSENGER_METRIC_LIVE` (default `false`) — or a
  server-config equivalent so the value isn't client-trusted.
- OFF (default, and the state shipped in this campaign): homepage shows the
  existing preserved `"150 000+"` management figure. No TMS‑X call is made.
- ON (future, post-approval): homepage shows the TMS‑X aggregate projection
  with its `asOf` provenance.
- Flipping the flag requires management approval and a verified live contract.

## 8. Testing (mock contract tests — no live connection)
- Mock the TMS‑X aggregate endpoint and assert the public projection contains
  **only** allowed fields (schema allow-list test).
- Assert **no** PII-shaped fields can pass through (deny-list + shape test).
- Assert flag-OFF path performs **no** network call and shows the preserved
  value.
- Assert fetch-failure falls back to last-good/preserved value, never a
  fabricated one.
- Assert provenance (`source`, `asOf`) is always present when flag is ON.

## 9. Risks
- **Re-identification via fine-grained aggregates** — mitigate with coarse
  buckets and a minimum-cell-size rule agreed with management `[TBC]`.
- **Scope creep toward private APIs** — mitigate by requiring the dedicated
  aggregate endpoint; explicitly forbid pointing the consumer at list/
  dashboard/accounting APIs.
- **Misleading provenance** — mitigate with mandatory `source`/`asOf` and the
  historical-vs-digitized distinction (§6).
- **Stale/zero display** — mitigate with last-good cache + preserved fallback.

## 10. Acceptance gates (all required before enabling the flag)
- [ ] Dedicated, permission-scoped TMS‑X aggregate endpoint available `[TBC]`.
- [ ] Management sign-off on the exact published figure and its coverage.
- [ ] Schema allow-list + PII deny-list tests passing against mocks.
- [ ] Provenance (`source`, `asOf`) present and correct.
- [ ] Historical vs digitized basis documented and approved.
- [ ] Fallback-to-preserved-value verified.
- [ ] Feature flag confirmed default-OFF in production until approval.

---
*Prepared, not activated. The current management-backed statistic remains
published until an approved, sourced replacement is signed off. This campaign
delivers the plan and (optionally) mock contract tests only — no live TMS‑X
connection.*
