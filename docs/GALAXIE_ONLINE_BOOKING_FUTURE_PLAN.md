# Galaxie Voyages — Online Booking Portal: Future Engineering Plan

> **STATUS: FUTURE ARCHITECTURE ONLY — NOT ACTIVATED.**
> This document is an **owner initiative**. It specifies a proposed online
> booking portal. **No** code in this campaign creates paid transactions,
> reserves real seats, or activates any booking endpoint. Implementation
> **requires separate management approval and an approved TMS‑X integration
> release.** Nothing here may be deployed to production without that approval.
>
> Every reference to a TMS‑X API shape below is marked **`[TBC]`**
> (to be confirmed). The real request/response contracts, authentication
> model, and financial-authority rules **must be supplied from the official
> TMS‑X API documentation** before any build begins. Do not treat the
> illustrative shapes here as authoritative.

---

## 1. Purpose & scope

Provide a dedicated, bilingual (FR/EN) online booking portal that lets the
public search availability, reserve a seat, pay through an approved provider,
and receive an official TMS‑X ticket — **without ever exposing TMS‑X operator
or accounting authority to the public internet.**

In scope (future): public search → seat hold → payment → ticket issuance →
cancellation/refund, plus audit and observability.

Explicitly **out of scope** for the current campaign: any live TMS‑X
connection, real seat holds, real payments, or enabling public booking
endpoints. The portal ships behind a **default‑OFF feature flag**.

## 2. Current platform baseline (what we build on)

| Concern | Current state |
|---|---|
| Framework | Next.js 16 (App Router, `[lang]` i18n, server components) |
| Hosting | Vercel (serverless functions / edge proxy) |
| Shared storage | Upstash Redis (used by reviews/news) |
| Email | Resend REST API (contact + service forms) |
| Secrets | Vercel environment variables |

The booking portal is a **new server-side bounded context** inside this app
(e.g. `src/app/[lang]/booking/*` + `src/app/api/booking/*` + `src/lib/booking/*`),
not a modification of TMS‑X.

## 3. Trust boundary (the central rule)

```
 Public browser
      │  (public-safe projections only)
      ▼
 Website Booking Gateway   ← this app, server-side only
      │  (server-to-server, privileged credential held in Vercel env)
      ▼
 TMS-X public-integration surface  ← a NEW, minimal, scoped API [TBC]
      │
      ▼
 TMS-X core (Operator / Comptable authority)   ← NEVER reachable from the public
```

**Non-negotiable:** the public never holds a TMS‑X credential, never calls
TMS‑X directly, and never receives Operator/Comptable fields. All privileged
calls happen server-side in the gateway with a secret stored in Vercel.
A dedicated, least-privilege TMS‑X integration role is required **`[TBC]`** —
the existing Operator/Comptable roles must **not** be reused for this.

## 4. Required capabilities (the 10 elements)

### 4.1 Server-side website gateway
A set of Next.js Route Handlers under `/api/booking/*`. Responsibilities:
authenticate to TMS‑X, enforce rate limits, validate and minimize inputs,
translate TMS‑X responses into public-safe projections, and never leak
privileged data or errors. Stateless where possible; state (holds,
idempotency keys) in Redis.

### 4.2 Public-safe route & availability projections
A read model exposing only: corridor (A⇄B), service class, date, seats-
remaining **bucketed** (e.g. `available` / `limited` / `full` rather than an
exact live count if the business prefers), price **if and only if** an
official published fare exists, and departure time **if official**. Reuses the
Part‑A principle: when official data is absent, show a contact-agency state,
never an invented value. Source: TMS‑X availability endpoint **`[TBC]`**,
cached with short TTL (see §6).

### 4.3 Authoritative seat reservation & expiry
Seat holds are **authoritative in TMS‑X**, not in the website. Flow:
1. Gateway requests a hold from TMS‑X **`[TBC]`** → receives a `holdId` + TTL.
2. Gateway mirrors `{holdId, expiresAt}` in Redis for UX only.
3. On expiry, TMS‑X releases the seat; the website treats the hold as void.
The website must **never** consider a seat booked until TMS‑X confirms
issuance (§4.8). Double-booking is prevented by TMS‑X as the source of truth.

### 4.4 Idempotent booking requests
Every mutating booking call carries a client-generated `Idempotency-Key`.
The gateway stores key → result in Redis with a TTL covering the payment
window. Replays (retries, double submits, network stalls) return the original
result instead of creating a second hold/charge. Payment capture and ticket
issuance are each idempotent on this key.

### 4.5 Passenger information minimization
Collect the minimum required to issue a ticket **`[TBC]`** (likely: name,
phone, maybe email for the receipt). No ID numbers, address, gender, or DOB
unless TMS‑X ticketing legally requires them — and if so, collect at the last
step, transmit server-side only, store nothing beyond what regulation demands,
and document retention (§8). The user's own email (from the browser session)
is never silently attached.

### 4.6 Approved payment-provider integration
Payment goes through a **management-approved** provider **`[TBC]`** (e.g. a
Cameroon mobile-money/card aggregator). The provider's secret keys live in
Vercel env and are used server-side only. The browser interacts with the
provider's hosted/SDK flow; the website never handles raw card/mobile-money
credentials (keeps PCI/ível scope minimal). Provider choice, fees, and
settlement account are a management + Comptable decision.

### 4.7 Verified payment confirmation & callbacks
Never trust a client "payment succeeded" redirect. Confirmation is accepted
only from:
- a **signed provider webhook** to `/api/booking/payment/callback` (verify
  signature, then treat as authoritative), and/or
- a **server-side verify** call to the provider using the payment reference.
Only after verified success does the gateway ask TMS‑X to issue the ticket.
Callbacks are idempotent and replay-safe.

### 4.8 Official TMS‑X ticket issuance
On verified payment, the gateway calls TMS‑X ticket issuance **`[TBC]`** with
the `holdId` + idempotency key. TMS‑X returns the official ticket record
(PNR/number). The website stores only a public-safe reference and shows/【emails
(via Resend) the ticket to the passenger. The ticket is **issued by TMS‑X**,
never minted by the website.

### 4.9 Cancellation, failure, expiry & refund handling
Explicit state machine (see §5) covering: hold expiry, payment failure,
payment success but issuance failure (→ auto-refund/retry per policy),
user cancellation, and operator cancellation. Refunds are initiated
server-side through the provider and reconciled with TMS‑X/Comptable per an
agreed policy **`[TBC]`**. Every terminal state is auditable.

### 4.10 Audit, rate limiting, authentication & observability
- **Audit**: append-only log of every booking/payment/issuance/refund event
  (ids, timestamps, outcome — no PII in logs) for reconciliation.
- **Rate limiting**: per-IP and per-session limits on search, hold, and pay.
- **Authentication**: gateway↔TMS‑X via least-privilege integration
  credential; webhooks via signature verification.
- **Observability**: structured logs, metrics (hold/convert/fail rates),
  alerting on payment-vs-issuance mismatches.

## 5. Booking state machine

```
SEARCHING → HOLD_CREATED → PAYMENT_PENDING → PAID → TICKET_ISSUED → COMPLETE
                 │               │             │           │
                 ▼               ▼             ▼           ▼
             HOLD_EXPIRED   PAYMENT_FAILED  ISSUANCE_FAILED → REFUND_PENDING → REFUNDED
                                                          (auto)
 User/operator cancel: any pre-COMPLETE state → CANCELLED (+ REFUND if PAID)
```
`PAID` without `TICKET_ISSUED` is the critical alert state and must never be
left unresolved: resolve by retrying issuance or refunding.

## 6. Caching & freshness
- Availability projections: short TTL (e.g. 15–60s) in Redis, with
  explicit `source` + `fetchedAt` provenance shown/returned.
- Never cache holds, payments, or tickets as authoritative — those are always
  read back from TMS‑X / the provider.

## 7. Proposed integration contracts (ILLUSTRATIVE — `[TBC]`)

> These shapes exist to frame the gateway design. Replace every one with the
> real TMS‑X / provider contract before building. Do not implement against
> these literally.

```http
GET  /tmsx/availability?corridor=YDE-DJOUM&date=2026-02-01&class=vip   [TBC]
POST /tmsx/holds            { corridor, date, class, seats }           [TBC]
POST /tmsx/tickets          { holdId, passenger, idempotencyKey }      [TBC]
POST /tmsx/refunds          { ticketRef, reason, idempotencyKey }      [TBC]
```
```http
# Website public surface (what the browser sees — no TMS-X fields)
GET  /api/booking/availability?corridor&date&class   → bucketed projection
POST /api/booking/hold                                → { holdId, expiresAt }
POST /api/booking/pay                                 → provider session
POST /api/booking/payment/callback                    (signed webhook)
GET  /api/booking/ticket/:ref                         → public-safe ticket
```

## 8. Privacy & retention (future commitment)
- Collect the minimum passenger data; justify each field against ticketing law.
- No passenger PII in application logs or audit trail (use opaque ids).
- Document retention periods and deletion for passenger contact data.
- A public privacy notice for the booking flow must be prepared and approved
  before launch.

## 9. Implementation sequence (phased, each gated)
1. **Phase 0 — Contracts & approvals**: obtain official TMS‑X integration
   contracts, least-privilege role, approved payment provider, fare/refund
   policy. *(Blocking; nothing starts without this.)*
2. **Phase 1 — Read-only availability** behind the OFF flag, against a TMS‑X
   sandbox; projections + caching + provenance; contract tests with mocks.
3. **Phase 2 — Holds** (authoritative in sandbox) + idempotency + expiry UX.
4. **Phase 3 — Payments** in sandbox: provider session, signed callback,
   server-side verify, full state machine, refunds.
5. **Phase 4 — Ticket issuance** in sandbox end-to-end; reconciliation + audit.
6. **Phase 5 — Hardening**: rate limits, observability, load/abuse tests,
   accessibility, bilingual QA, security review.
7. **Phase 6 — Controlled launch**: management sign-off, limited corridors,
   flag on for a pilot, monitored rollout.

## 10. Risks
- **Financial-authority leakage** — mitigated by the §3 boundary and a
  dedicated least-privilege role; the highest-severity risk.
- **Payment/issuance divergence** (paid, not ticketed) — mitigated by the
  state machine, idempotency, and the `PAID`-without-`TICKET_ISSUED` alert.
- **Overselling** — mitigated by TMS‑X being the single source of truth for
  seats; the website never authoritative.
- **Provider/TMS‑X contract drift** — mitigated by contract tests and the
  `[TBC]` discipline (no building against guessed shapes).
- **PII over-collection** — mitigated by §4.5 / §8 minimization.
- **Next.js 16 runtime specifics** — validate serverless timeouts/streaming
  for webhook handling before Phase 3.

## 11. Acceptance gates (must all pass before any production enablement)
- [ ] Official TMS‑X contracts + least-privilege integration role in hand.
- [ ] Approved payment provider + fare/refund policy signed off (Comptable).
- [ ] No public endpoint returns any Operator/Comptable field (verified).
- [ ] Idempotency, hold-expiry, and refund paths covered by tests.
- [ ] `PAID`→`TICKET_ISSUED` reconciliation + alerting demonstrated in sandbox.
- [ ] Security review + privacy notice approved.
- [ ] Feature flag default-OFF confirmed in production config.
- [ ] Management release approval recorded.

---
*Owner initiative. Requires management and TMS‑X release approval before any
implementation or deployment. This campaign delivers the plan only.*
