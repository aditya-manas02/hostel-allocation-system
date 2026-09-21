# Security Architecture & Threat Model

This document outlines the security architecture, cryptographic implementations, threat model, and compliance controls for the **Policy-Driven Hostel Allocation Engine with Roommate Compatibility Matching**.

---

## 1. Cryptographic Architecture

### 1.1 Field-Level Encryption for Sensitive Lifestyle Data (Invariant I6)
- **Algorithm**: `AES-256-GCM` (Authenticated Encryption with Associated Data).
- **IV Generation**: Cryptographically secure 12-byte (96-bit) Initialization Vector generated per record via `crypto.randomBytes(12)`.
- **Integrity**: 16-byte (128-bit) GCM authentication tag verifies ciphertext authenticity and detects unauthorized modifications at rest.
- **Key Rotation**: Built-in key versioning (`KEY_V1`, `KEY_V2`). When keys are rotated, existing records can be decrypted using their stored key version and re-encrypted under the active key.
- **Privacy Guarantee**: Questionnaire responses are **write-only**. The API never returns raw lifestyle answers to students, wardens, or administrators. Wardens and admins only see aggregate pairwise compatibility scores (`0–100`).
- **Right-to-be-Forgotten**: Deletion on request permanently destroys the encrypted payload and replaces the document with a tombstone record referencing the user's deletion request ID, logged in the tamper-evident audit trail.

### 1.2 Append-Only Hash-Chained Audit Log (Invariant I7)
- **Algorithm**: `SHA-256` hash chaining.
- **Chain Structure**:
  $$\text{Current Hash} = \text{SHA256}(\text{Index} \parallel \text{Timestamp} \parallel \text{ActorId} \parallel \text{Action} \parallel \text{Resource} \parallel \text{Payload} \parallel \text{Previous Hash})$$
- **Genesis Block**: Seeded with a deterministic genesis hash `0000000000000000000000000000000000000000000000000000000000000000`.
- **Tamper Detection**: An audit verification routine scans the chain sequentially from genesis. If any entry has been modified, deleted, or inserted out of sequence, the routine flags the exact corrupted sequence number.
- **Access Control**: No update or delete endpoints exist for the `auditLog` collection; all writes are strictly append-only.

### 1.3 Deterministic Pseudo-Random Number Generation (Invariant I3)
- **Algorithm**: `sfc32` (Small Fast Chaotic 32-bit PRNG) initialized via `cyrb128` 128-bit hash state.
- **Sub-Stream Derivation**: Domain-scoped sub-streams for tiebreaking, roommate pair shuffling, and fallback assignment prevent cross-stream correlation.
- **Standard Library Ban**: Unseeded `Math.random()` and raw `Date.now()` are strictly prohibited in allocation logic to guarantee byte-for-byte reproducibility.

---

## 2. Invariant Enforcement & State Guarding

| Invariant | Description | Enforcement Mechanism |
| :--- | :--- | :--- |
| **I1** | Draft/Published Separation | Strict state machine (`GENERATING` &rarr; `DRAFT` &rarr; `UNDER_REVIEW` &rarr; `APPROVED` &rarr; `PUBLISHED`). Exactly one code path sets `PUBLISHED`: `DraftPublishService.publish()`. Requires matching approval record hash, runs in a MongoDB transaction, and writes an audit entry. Enforced with Mongoose middleware and DB-level pre-save guard. |
| **I2** | Immutability After Publish | Published drafts, assignments, and explanations cannot be modified or deleted. Enforced at the service layer via `DraftPublishService.assertMutable()`. Post-publish changes require audited change records. |
| **I3** | Reproducibility | Identical inputs snapshot + seed + parameters + engine version &rArr; byte-identical draft. `seed`, `parameters`, `inputSnapshotHash`, `engineVersion`, and `outputHash` are recorded on every run. |
| **I4** | Explainability | Every assignment stores a structured explanation containing preference rank satisfied, constraints checked, quota bucket used, tiebreak value, compatibility score, and human-readable rationale. |
| **I5** | Mandatory Override Reason | Manual overrides require a non-empty reason (&ge;10 characters) and a valid reason category. Hard constraint overrides require explicit escalation and approval by the Chief Warden. |
| **I6** | Sensitive Lifestyle Data | Encrypted at rest via AES-256-GCM. Never returned raw. Aggregate pairwise scores only. Deletable on request with tombstone audit. |
| **I7** | Audit Logging | Append-only SHA-256 hash-chained log. Tamper detection verification routine. |
| **I8** | Zero Hard Constraint Violations | Gender blocks strictly segregated; accessible beds allocated exclusively to students requiring accessibility; room capacity limits never exceeded; zero double-assignments. |

---

## 3. Role-Based Access Control (RBAC) & Scoping

The system implements strict role-based access control with the following hierarchy:
1. **STUDENT**: Access restricted strictly to own application, preferences, eligibility report, allotment result, and room change requests. Cannot inspect other students' applications or questionnaire responses.
2. **WARDEN**: Scoped strictly to their assigned hostel (`assignedHostelId`). Cannot access or reassign beds in hostels outside their jurisdiction. Attempted cross-hostel access returns `403 Forbidden`.
3. **CHIEF_WARDEN**: Cross-hostel governance authority. Can review drafts across all campus hostels, approve hard-constraint escalations, and grant final publication approval.
4. **ADMIN**: Inventory management, bulk CSV imports, allocation cycle creation, and document verification queue.
5. **DEAN**: Read-only institutional analytics, occupancy reports, and compliance oversight.

---

## 4. OWASP Top 10 Mitigations

1. **Broken Access Control**: Enforced at the middleware level with `authenticate`, `requireRole`, and `requireHostelAccess`. Tested via negative test cases.
2. **Cryptographic Failures**: AES-256-GCM with per-record IVs for sensitive data; SHA-256 hash chaining for audit logs; bcrypt/Argon2 password hashing; JWT tokens with separate access and refresh secrets and short lifespans.
3. **Injection**: MongoDB queries use Mongoose parameterized models and strict Zod schema validation on all request bodies, query parameters, and route parameters. No raw string interpolation into database queries.
4. **Insecure Design**: Multi-pass heuristic engine operates in a deterministic sandbox (zero external I/O). Invariant checks are redundant (checked during allocation, re-validated in post-validator, and enforced by database pre-save hooks).
5. **Security Misconfiguration**: Production Docker environment runs unprivileged containers, Helmet security headers enabled, strict CORS whitelist, and environment variable schema validation via Zod on startup.
6. **Vulnerable and Outdated Components**: Automated dependency scanning, strict pnpm lockfile enforcement, and zero unnecessary runtime dependencies in core engine packages.
7. **Identification and Authentication Failures**: Rate-limiting on `/api/auth/login`, HTTP-only secure cookies for tokens, refresh token rotation, and immediate invalidation on logout.
8. **Software and Data Integrity Failures**: Input snapshot hashing (`inputSnapshotHash`) and output hashing (`outputHash`) verify that data has not drifted or been tampered with between engine execution and publication.
9. **Security Logging and Monitoring Failures**: Every mutation, login, override, approval, and publication writes to the SHA-256 hash-chained audit log with actor ID, IP address, timestamp, and before/after diffs.
10. **Server-Side Request Forgery (SSRF)**: File uploads and document storage use strictly validated local file paths or isolated object storage; no arbitrary URL fetching from client-controlled parameters.
