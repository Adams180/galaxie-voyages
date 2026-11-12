# Release Acceptance — Website Modernization 01

**Status: RELEASE CANDIDATE — NOT production-ready until independent review is complete.**
No merge, production deployment, or live publishing-account activation has been performed.

| | |
|---|---|
| Repository | `Adams180/galaxie-voyages` |
| Branch | `claude/website-modernization-01` |
| Base (`main`) | `d942ba818eb1c363751f2e869f62f035baee2d86` |
| Final commit | `e5e588b42657f013ed940c10efc7933e1e69a5be` |
| Final tree | `dd55d7620cb19d3cb202d5d8ec834ed4293e83a9` |
| Draft PR | #3 |
| Diff | 40 files changed, +4677 / −234 |

Production authority is unchanged; the Railway production branch is not `main` or this feature branch.

---

## 1. Scope delivered

| Part | Scope | Status |
|---|---|---|
| A | Yaoundé–Djoum + safe route model | ✅ Done, verified |
| B | Authenticated newsroom (Auth.js v5) | ✅ Done, verified; **activation gated** |
| B-hardening | 6 security/data-integrity review findings | ✅ All addressed |
| C | Moderated public comments | ✅ Done, verified |
| D | Online booking future plan (doc) | ✅ Delivered (not activated) |
| E | Public passenger metrics future plan (doc) | ✅ Delivered (not activated) |
| F | Tests + acceptance evidence | ✅ Unit + browser/a11y green |

## 2. A — Yaoundé–Djoum
- Route model no longer requires duration/departures and no longer assumes bidirectional service (`hours?`, `departures?`, `bidirectional?`, `routeHasTimetable()`, `routeIsBidirectional()`).
- Djoum added with **no invented** duration, departures, return, fares, stops or agency contacts. Destinations (table + mobile) and the home network render an explicit **timetable-unavailable / contact-agency** state and a directional `→`.
- Flows through route search, city chips and metadata. FR/EN parity verified.

## 3. B — authenticated newsroom
- **Auth.js v5** (`next-auth@5.0.0-beta.32`) + Upstash adapter + **Resend magic-link**: passwordless, **revocable DB sessions in existing Redis**, no new external service.
- Invitation-only, **capped at 2** publishers (`NEWS_PUBLISHER_EMAILS`), enforced server-side. **Accounts left unseeded — none fabricated.**
- Article model + **migration preserving existing IDs/content/publication dates**; drafts, scheduling, slugs, SEO, FR/EN content, revision history + restore, author attribution, audit log.
- **Visual rich-text editor (TipTap)** with formatting, link + managed image insertion, live preview; body stored as HTML and sanitized server-side on save AND render.
- **Managed image upload** via Vercel Blob (auth + type/size validated).
- Legacy shared-token `/news/admin` **retained** until a verified, authorized cutover.

### B-hardening (review findings)
1. **Fail-closed revocation** — authorization is a pure, Redis-free decision enforced at magic-link sign-in and session authorization; `currentPublisher()` denies on any error.
2. **Migration tombstones** — a persistent set of imported legacy ids; the public feed excludes them, so unpublished/deleted migrated articles can't be resurrected by the legacy fallback. Idempotent across interrupted/repeated runs and concurrent legacy writes (unit-tested).
3. **No publisher-to-publisher admin** — revocation moved to owner-controlled `NEWS_REVOKED_EMAILS`; team page is read-only.
4. **Validated privileged inputs** — status (closed set), schedule (finite timestamp), article identity (must exist), image provenance (managed Blob only; unchanged legacy preserved; external URLs rejected); race-safe slug reservation (SET NX); length caps.
5. **Observable audit** — `logAudit` returns success and logs failures; high-impact actions (delete, publish/unpublish, comment moderation) audit-first and fail closed.
6. **Genuine rich-text editor** — replaced the Markdown textarea (see above).

## 4. C — moderated public comments
- Redis-backed **pending-moderation** workflow; only **approved** comments are ever public (approved-only GET, public-safe shape).
- Validation, link-spam rejection, **honeypot**, per-IP **rate limiting** (fails closed).
- Authenticated moderation queue for the two publishers (approve/reject/delete; audits first).
- **Removed the misleading browser-local shared fallback** — existing local-only entries can no longer masquerade as shared public records; storage-unavailable shows a truthful state.
- Idempotent migration imports pre-existing public comments as approved (preserved). Privacy/retention notice added.

## 5. D & E — future proposals (docs only, not activated)
- `docs/GALAXIE_ONLINE_BOOKING_FUTURE_PLAN.md`, `docs/GALAXIE_PUBLIC_PASSENGER_METRICS_PLAN.md`.
- Public integration boundary; Operator/Comptable authority stays private; every TMS-X specific marked `[TBC]`; default-OFF flags; existing published statistic preserved; require management + TMS-X release approval.

## 6. F — test & acceptance evidence

**Unit tests** (`pnpm test`, Node `--test` type-stripping) — 3 files, 30 tests, all green:
- `newsroom-model.test.ts` (10): slug, scheduling, i18n fallback, migration mapping.
- `newsroom-hardening.test.ts` (13): authorization fail-closed + owner revocation; migration tombstone merge (unpublished/deleted not resurrected; idempotent; concurrent write); status + image-provenance validation.
- `comments-model.test.ts` (7): validation length/spam, link count, approved-only visibility.

**Browser + accessibility** (`pnpm test:e2e`, Playwright) — 13/13 at 1440/1024/768/393/375, FR/EN, light/dark:
- Document **not horizontally scrollable** at every breakpoint.
- No JS/hydration errors; no non-resource console errors.
- FR/EN `lang`; Djoum + timetable-unavailable state; newsroom auth gate (307→sign-in); all contact form controls labelled.
- Screenshots captured (home light/dark 1440, home 393, destinations 1440).

**Build / lint / typecheck**
- `pnpm build` (Next 16.2.9, TypeScript) — compiles clean.
- `pnpm lint` — only **2 pre-existing** errors remain, in files untouched by this work (`src/components/ThemeToggle.tsx:10`, `src/components/CountUp.tsx:26`, both `react-hooks/set-state-in-effect`, present on `main`). No new lint errors.
- FR/EN dictionary parity: 255/255 keys.

**Measured vs estimated:** all results above are measured in this environment. The Playwright overflow checks are measured against a production `next start`; the harness retries until the stylesheet applies because the sandbox server transiently 500s assets under concurrent load (an environment limitation, not a product defect — confirmed by single-context measurement: `overflow-x: clip` applied, `scrollLeft` immovable, `scrollWidth === clientWidth`).

## 7. Preserved boundaries
- Yaoundé–Djoum published **without invented timetables**.
- Online booking remains a **future owner proposal**, not active.
- TMS-X public passenger metrics remain **disabled**.
- Legacy shared-token admin **retained**; to be retired only after a verified migration and authorized cutover.
- No Hub/HR/attendance/schema/production changes (out of scope for this campaign).

## 8. Remaining blockers / deployment implications
1. **Two authorized publisher e-mails** → `NEWS_PUBLISHER_EMAILS` (none fabricated). Newsroom stays inert until provided.
2. **Production env** (Vercel), none set by this work: `AUTH_SECRET`, `RESEND_API_KEY`, Upstash `KV_REST_API_URL`/`KV_REST_API_TOKEN`, `BLOB_READ_WRITE_TOKEN`, optional `NEWS_REVOKED_EMAILS` — see `.env.example`.
3. **Cutover**: verify migration on staging data, then retire the shared-token admin + remove `NEWS_ADMIN_TOKEN` in an authorized step.
4. **Independent review** of source + evidence is required before this is classified production-ready, and before any push/merge/deploy.

## 9. Verdict
`SIGMACLOCK`-style classification per instruction: **PARTIAL_WITH_BLOCKERS** is not applicable here (that token belongs to a different campaign). For this campaign: the source is **ready for review** with the blockers in §8 outstanding. **Not classified production-ready** pending independent review.
