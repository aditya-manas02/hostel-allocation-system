# AGENTS.md — System Guide & Operating Manual

## 1. Architecture Summary

The **Policy-Driven Hostel Allocation Engine with Roommate Compatibility Matching** is a production-grade university management system built as a pnpm monorepo:
- **`apps/web`**: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui. Provides portals for Student, Warden, Chief Warden, Admin, and Dean of Student Welfare.
- **`apps/api`**: Node.js + Express, TypeScript. REST API with Zod validation, OpenAPI docs at `/api/docs`, JWT auth, RBAC middleware, Mongoose ORM, BullMQ job queue, AES-256-GCM field encryption, and SHA-256 hash-chained audit logging.
- **`packages/shared`**: Shared Zod schemas, derived TypeScript types, enums, and constants used by both frontend and backend.
- **`packages/engine`**: Pure TypeScript library (zero I/O, zero external framework imports) implementing a deterministic multi-pass heuristic for hostel allocation, roommate compatibility matching, tiebreaking via seeded PRNG (`sfc32` via `cyrb128`), and post-validation.

Infrastructure:
- **MongoDB 8.0**: Configured as a single-node replica set (`rs0`) in Docker Compose to support multi-document ACID transactions.
- **Redis 7.4**: Backing store for BullMQ background workers (allocation jobs, notification dispatch, PDF rendering).
- **Docker Compose**: Orchestrates MongoDB replica set, Redis, API, and Web services.

---

## 2. Non-Negotiable Invariants (Enforce in Code & Tests)

- **I1 — Draft/Published separation**: `allocationDrafts.status` follows strict state machine (`GENERATING` → `DRAFT` → `UNDER_REVIEW` → `APPROVED` → `PUBLISHED`, plus `FAILED`, `SUPERSEDED`, `CANCELLED`). Exactly one code path sets `PUBLISHED`: `DraftPublishService.publish()`. Requires matching approval record hash, runs in a transaction, writes audit entry. Enforced with Mongoose middleware and DB-level guard.
- **I2 — Immutability after publish**: Published drafts, assignments, and explanations cannot be modified or deleted. Post-publish changes require audited change records.
- **I3 — Reproducibility**: Same inputs snapshot + seed + parameters + engine version ⇒ byte-identical draft. `seed`, `parameters`, `inputSnapshotHash`, `engineVersion`, and `outputHash` are recorded on every run.
- **I4 — Explainability**: Every assignment stores a structured explanation (preference rank, constraints checked, quota bucket, tiebreak value, compatibility score, human-readable rationale).
- **I5 — Mandatory override reason**: Overrides require min-length reason text and category. Hard constraint overrides require Chief Warden escalation.
- **I6 — Sensitive lifestyle data**: Questionnaire answers encrypted at rest with AES-256-GCM (per-record IV, key rotation). Never returned to students. Wardens/Admins only see aggregate pairwise scores. Deletable on request with tombstone audit.
- **I7 — Audit**: Append-only, SHA-256 hash-chained `auditLog`. No update/delete routes. Tamper detection verification routine.
- **I8 — Hard constraints**: Never violated by engine (no student assigned twice, no bed assigned twice, capacity respected, gender block strictly maintained, accessibility needs matched to accessible beds, quota limits honored).

---

## 3. Coding Conventions

- **Strict TypeScript**: `strict: true` across all packages, `noImplicitAny: true`, no unjustified `any`.
- **Validation**: Every external boundary (API requests, file imports, environment variables) is validated with Zod.
- **Transaction Safety**: All multi-document writes use `session.withTransaction()`. No heavy computing or PDF rendering inside transactions.
- **Error Handling**: Standardized API error responses with correlation IDs (`x-correlation-id`).
- **Deterministic Randomness**: Never use `Math.random()` or unseeded `Date.now()` in engine logic; use `sfc32` seeded PRNG with domain-scoped sub-streams.
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`), one commit per logical task, phase tags (`phase-0` ... `phase-5`).

---

## 4. Commands

```bash
# Setup & Dependencies
pnpm install

# Development
pnpm dev              # Runs all apps via Turborepo
pnpm --filter @hostel/api dev
pnpm --filter @hostel/web dev

# Testing
pnpm test             # Run all unit and integration tests
pnpm --filter @hostel/engine test
pnpm --filter @hostel/api test
pnpm test:coverage    # Test with coverage thresholds (engine >= 90%, services >= 80%)
pnpm e2e              # Run Playwright E2E tests

# Linting & Formatting
pnpm lint
pnpm format:check
pnpm format:write

# Build & Typecheck
pnpm typecheck
pnpm build

# Seeding & Benchmarks
pnpm --filter @hostel/api seed
pnpm --filter @hostel/engine benchmark

# Docker
docker compose up -d
docker compose down
```

---

## 5. Phase Checklist & Gate Status

- [ ] **Phase 0 — Foundation**: Monorepo, Docker Compose (Mongo rs0, Redis), CI, lint/format, schemas, auth/RBAC, audit log, encryption, AGENTS.md, DECISIONS.md.
  * *Gate*: `docker compose up` works, CI green, audit chain + encryption tests pass.
- [ ] **Phase 1 — Inventory + Applications (M1, M2)**: Inventory CRUD + bulk CSV import, cycles, applications, document upload, ~8k deterministic seed.
  * *Gate*: Seed produces ~8k beds and applicants; import dry-run works; screenshots of admin + student application flow.
- [ ] **Phase 2 — Eligibility + Preferences + Questionnaire (M3, M4, M5)**: Declarative rules engine, drag-to-rank preferences, consent + AES-256-GCM questionnaire, compatibility scoring.
  * *Gate*: Eligibility failure-and-correct works in browser; API never returns raw answers; deletion on request works.
- [ ] **Phase 3 — Allocation Engine (M6)**: Pure deterministic heuristic engine, BullMQ job, run history, fast-check property tests, ALGORITHM_SPEC.md.
  * *Gate*: All property tests pass; reproducibility proven; 8,000x8,000 in <10 min with measured time.
- [ ] **Phase 4 — Warden Review + Waitlist + Publication (M7, M8, M9)**: Bed-map with drag-to-reassign, overrides, approvals, DraftPublishService guard, auto-promotion, PDF letters, notifications.
  * *Gate*: All negative tests pass; browser records review -> publish flow.
- [ ] **Phase 5 — Analytics, Hardening, Delivery**: Dashboards, reports, occupancy API, security review, WCAG 2.1 AA pass, E2E green, documentation complete.
  * *Gate*: Full test suite + E2E green, coverage thresholds met, final walkthrough.
