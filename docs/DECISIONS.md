# Architecture Decision Records (ADR)

This document records the key architectural and design decisions for the Policy-Driven Hostel Allocation Engine with Roommate Compatibility Matching.

---

## ADR-001: Backend Framework Selection (Express.js vs Fastify)

- **Status:** Accepted
- **Context:** The system requires a robust REST API with Zod validation, OpenAPI specification, JWT/RBAC security, Mongoose ORM, BullMQ background job orchestration, and PDF letter generation.
- **Decision:** Use **Express.js** with TypeScript, structured routers, and modular controllers/services.
- **Consequences:** 
  - Express has a vast, mature ecosystem and battle-tested compatibility with BullMQ, Mongoose middleware, and middleware libraries (`helmet`, `cors`, `rate-limit`).
  - High familiarity and predictable async error handling via Express 5/custom async handlers.
  - While Fastify offers micro-optimizations in raw throughput, an internal university allocation and review engine is constrained by DB and memory operations, not HTTP serialization overhead.

---

## ADR-002: Hierarchy & Entity Modeling for Floors (Embedded vs Separate Collection)

- **Status:** Accepted
- **Context:** The visual bed-map requires floor-level filtering and status visualization across multiple blocks and hostels (~8,000 beds).
- **Decision:** Model `floors` as a **separate collection** rather than embedding them inside `blocks` or `hostels`.
- **Consequences:**
  - Avoids MongoDB's 16MB document size limitation when storing detailed room and bed metadata.
  - Allows direct, indexed queries for `Floor.find({ blockId })` and individual floor bed-maps without loading entire hostel hierarchies.
  - Clean foreign key relationships: `Hostel` 1:N `Block` 1:N `Floor` 1:N `Room` 1:N `Bed`.

---

## ADR-003: Deterministic Pseudorandom Number Generator (PRNG)

- **Status:** Accepted
- **Context:** Invariant I3 requires strict reproducibility: identical inputs and seed must produce a byte-identical draft. The engine must tiebreak equal priorities and shuffle candidate allocations deterministically.
- **Decision:** Implement **sfc32** (Small Fast Counting, 128-bit state) combined with **cyrb128** for domain-scoped sub-stream derivation.
- **Consequences:**
  - Passes PractRand and BigCrush statistical randomness tests.
  - Vastly superior to 32-bit linear/mulberry PRNGs which suffer from low periodicity ($2^{32}$) and bias.
  - Sub-stream scoping (`cyrb128("${masterSeed}::${domain}")`) guarantees that localized tiebreaks do not ripple unpredictably across independent allocations.

---

## ADR-004: Server-Side PDF Generation Strategy

- **Status:** Accepted
- **Context:** Allocation letters must be generated and downloadable by students post-publication, containing official institutional formatting, QR/barcode verification, and personalized allotment metadata.
- **Decision:** Use **Playwright** / Headless Chromium HTML-to-PDF rendering with styled HTML/CSS templates.
- **Consequences:**
  - Enables modern CSS grid/flexbox layouts and print media styling (`@page`).
  - Leverages Playwright which is already integrated for End-to-End testing.
  - Replaces cumbersome programmatic canvas drawing required by low-level libraries like PDFKit.

---

## ADR-005: Deterministic Multi-Pass Heuristic vs External Constraint Solvers (OR-Tools)

- **Status:** Accepted
- **Context:** The university allocation problem involves hard constraints (gender, capacity, accessibility, quotas) and soft objectives (ranked preference satisfaction, roommate compatibility).
- **Decision:** Implement a pure TypeScript multi-pass deterministic heuristic in `packages/engine` rather than invoking an external Python/OR-Tools service.
- **Consequences:**
  - **Zero external runtime dependencies:** Eliminates inter-process/network communication, Python runtime overhead, and complex sidecar management in container environments.
  - **Explainability (I4):** Every assignment step directly records its exact decision rationale (preference rank, feasibility check, tiebreak value).
  - **Auditability & Reproducibility (I3):** Guaranteed deterministic execution on any Node.js environment without floating-point solver variances across CPU architectures.
  - **Performance:** Bounded local improvement and bucketed indexing easily allocate 8,000 applicants in under 10 minutes.

---

## ADR-006: Lifestyle Questionnaire & Compatibility Score In-Memory vs Pre-computation

- **Status:** Accepted
- **Context:** Invariant I6 mandates that raw student questionnaire answers must never be leaked, must be encrypted at rest, and must never be exposed via API. The engine requires pairwise compatibility scores in [0, 100].
- **Decision:** Compute pairwise compatibility scores server-side from decrypted records within a restricted service, and persist only the aggregate pairwise scores into the allocation input snapshot.
- **Consequences:**
  - The allocation engine (`packages/engine`) receives only pre-computed numerical compatibility matrices, ensuring it remains zero-I/O and free of cryptographic logic.
  - Raw answers remain isolated in `compatibilityResponses` with field-level AES-256-GCM encryption.
  - Deletion requests allow immediate erasure of raw answers and recalculation or purging of compatibility scores.

---

## ADR-007: Monorepo Orchestration with Turborepo & pnpm

- **Status:** Accepted
- **Context:** Need coordinated builds, linting, testing, and dependency sharing between `apps/web`, `apps/api`, `packages/shared`, and `packages/engine`.
- **Decision:** Use **pnpm workspaces** with **Turborepo**.
- **Consequences:**
  - Fast, deduplicated package installations with strict workspace protocol (`workspace:*`).
  - Pipeline caching for builds, linting, and tests.
  - Clear architectural boundaries between UI, API, shared types, and pure allocation logic.

---

## ADR-008: Cryptographic Hash Chaining for Append-Only Audit Logs

- **Status:** Accepted
- **Context:** Invariant I7 requires an append-only audit trail that detects any retroactive tampering or deletion.
- **Decision:** Implement a SHA-256 hash chain where each audit entry contains `previousHash = hash(entry_{n-1})` and `hash = SHA-256(canonicalJson(entry_n))`.
- **Consequences:**
  - Tamper detection is verifiable by recomputing hashes sequentially from the genesis block (`000...000`).
  - Strict monotonic sequencing (`sequence: number`) with unique index prevents interleaving or race conditions.
  - API provides no update or delete endpoints for audit records.

---

## ADR-009: Field-Level Encryption & Key Rotation Interface

- **Status:** Accepted
- **Context:** Invariant I6 requires sensitive lifestyle data to be encrypted at rest with AES-256-GCM, per-record IV, and key rotation support.
- **Decision:** Implement `EncryptionService` with AES-256-GCM (12-byte IV, 16-byte auth tag) storing ciphertext in format `enc:<version>:<ivHex>:<tagHex>:<cipherHex>`.
- **Consequences:**
  - Authenticated encryption (AEAD) prevents tampering with encrypted ciphertext.
  - Per-record IV ensures identical inputs produce distinct ciphertexts.
  - Key versioning (`v1`, `v2`) enables zero-downtime key rotation by decrypting with the specified version and re-encrypting with the active version.

---

## ADR-010: Background Worker & Queue Architecture

- **Status:** Accepted
- **Context:** Allocation runs for 8,000+ applicants and bulk PDF generation are long-running operations that cannot block the HTTP request-response cycle.
- **Decision:** Use **BullMQ** with Redis for asynchronous job processing, separated into dedicated queues (`allocation-queue`, `notification-queue`, `pdf-queue`).
- **Consequences:**
  - Background jobs support real-time progress reporting, cancellation via `AbortSignal`, and persistent failure/retry tracking.
  - API endpoints return immediately with run/job IDs for client polling.
  - Isolation of queue workloads prevents heavy PDF rendering from delaying critical allocation execution.
