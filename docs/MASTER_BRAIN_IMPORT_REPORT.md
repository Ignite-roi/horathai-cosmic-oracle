# Horathai Master Brain Pack v0.1.0-draft — Dry-run Import Report

## Scope and execution mode

- Target: existing Horathai preview project; no new project and no publish.
- Base requested by the pack: `cd7b33ab857d57baf0f0d6e048bdd0d399975902`.
- Mode: schema validation and read-only reconciliation only (`dry_run_only`).
- No production database insert, update, delete, migration, secret, auth, LINE, payment, guest-access, or P0.1 change was performed.
- The calculation → rule → deterministic narrative path contains no AI or network call.

## Archive safety and reuse audit

The uploaded archive contained four ordinary files and no `.git` metadata or secret material. Its README and import prompt were treated as a specification. The project already contained the calculation profiles, deterministic fact sheet, rule matcher, Thai narrative renderer, source/citation layer, and Knowledge V1 schema. Those foundations were extended rather than recreated.

## Baseline snapshot and abort gate

The live backend was read before implementation. The required snapshot matched:

| Gate | Expected | Observed | Result |
|---|---:|---:|---|
| Canonical concepts | 49 | 49 | pass |
| Published editorial rules | 5 | 5 | pass |
| Immutable knowledge releases | 0 | 0 | pass |

The exact existing concept and rule IDs/codes, versions, and aggregate hashes are preserved in `docs/fixtures/live-knowledge-baseline-cd7b33ab.json`. The importer references those records and throws `MASTER_BRAIN_BASELINE_MISMATCH` before producing a report when counts or referenced arrays do not match. It also aborts on duplicate pack codes, collisions with live rule codes, invalid ASTs, and dangling system/outcome references.

No existing live entity was duplicated or rewritten.

## Dry-run result

- Pack schema: valid (`horathai.master-knowledge-pack/v1`, `0.1.0-draft`).
- Existing entities: referenced by live IDs/codes; not inserted.
- Three candidate rules: simulated only; all remain `draft`, `editorial`, and `runtimeEligible=false`.
- Three outcomes and pack sources: simulated only; no backend write.
- Candidate release: **blocked**; no immutable release created and no candidate rule is runtime eligible.
- Active runtime remains `sidereal_lahiri@3.0.0` (versioned deterministic Lahiri model).
- Thai Suriyayatra and competitor-compatible profiles remain research-only and runtime-ineligible.
- Competitor/MyHora observations remain benchmark-only and `usableAsTruthFixture=false`; no observed ascendant was hardcoded into calculation or truth fixtures.

## Implemented extensions

- Strict Zod schema for the attached pack.
- Typed canonical fact-key registry with unknown-birth-time sensitivity.
- Safe recursive condition AST (`all`, `any`, `not`, equality, membership, numeric comparisons/ranges, angular wrap-around, existence); no `eval` or `Function` construction.
- Canonical JSON and deterministic SHA-256 hashes.
- Dry-run importer with baseline, duplicate, collision, AST, and dangling-reference abort gates.
- Production rule fail-closed checks for publication, immutable release membership, runtime eligibility, citations, rights, reviewer approval, tests, and blocking conflicts.
- Deterministic Thai rendering from one resolved conclusion with rule/citation lineage and a resolution trace hash.
- Deterministic Single Answer Resolver with one public answer per question/domain/period, supporting-rule merge, ranked conflict resolution, insufficient-evidence fallback, combined citation lineage, and server-only rejected-candidate trace.
- Candidate release report with deterministic replay hash and explicit blockers.
- Regression coverage for pack validation, mismatch/duplicate/dangling aborts, draft exclusion, profile isolation, unknown birth time, competitor observations, AST boundaries, narrative safety, candidate release blocking, Single Answer cardinality/ranking/conflicts/order invariance, and 100-repeat determinism with zero fetch calls.

## Verification

- Focused Single Answer Resolver and Master Brain tests: **30/30 pass**.
- Full test suite: **75/75 pass**, including all 9 P0.1 mock-checkout lockdown tests.
- P0.1 production-deny/no-mutation and review/development allowlist behavior remains unchanged.
- Offline boundary scan: no `fetch`, Gemini/Lovable AI key access, `eval`, or `new Function` in the imported calculation/rule/narrative path.
- Functional ESLint for all modified TypeScript files: pass. The repository's formatting-only debt remains outside this resolver scope.
- TypeScript (`tsgo --noEmit`): pass. Production build verification is delegated to the project harness; no publish was performed.

## Changed files

### Pack and audit fixtures

- `docs/fixtures/master-brain-pack-v0.1.0-draft.json`
- `docs/fixtures/master-brain-logic-contracts-v0.1.0-draft.md`
- `docs/fixtures/live-knowledge-baseline-cd7b33ab.json`
- `docs/MASTER_BRAIN_IMPORT_REPORT.md`
- `docs/MASTER_KNOWLEDGE_SPEC.md`

### Knowledge implementation

- `src/lib/knowledge/canonical-json.server.ts`
- `src/lib/knowledge/condition-ast.ts`
- `src/lib/knowledge/fact-registry.ts`
- `src/lib/knowledge/master-brain-pack.schema.ts`
- `src/lib/knowledge/master-brain-import.server.ts`
- `src/lib/knowledge/release-report.server.ts`
- `src/lib/knowledge/fact-sheet.server.ts`
- `src/lib/knowledge/rule-engine.server.ts`
- `src/lib/knowledge/interpretation-context.server.ts`
- `src/lib/knowledge/narrative.server.ts`
- `src/lib/knowledge/single-answer-resolver.server.ts`
- `src/lib/knowledge/types.ts`

### Tests

- `src/lib/knowledge/master-brain-import.test.ts`
- `src/lib/knowledge/master-brain.test.ts`
- `src/lib/knowledge/knowledge-v1.test.ts`
- `src/lib/knowledge/single-answer-resolver.test.ts`

## Remaining gaps before any production activation

1. There is no immutable knowledge release yet.
2. Candidate rules require reviewed source locators/citations, rights clearance, named reviewers, positive/negative rule tests, conflict review, and explicit approval.
3. Thai Suriyayatra formulas and competitor methodology remain unimplemented/research-only.
4. Existing production insight consumers that query rule codes directly should be migrated to the version/release-pinned engine before a future release.
5. Unrelated project-wide formatting debt prevents a clean global lint run.

## Rollback

This change created no database state, migration, release, secret, or deployment. Rollback is therefore application-only: remove the added pack fixtures/report and knowledge modules, and revert the listed knowledge-file edits. Do not change the 49 concepts, five existing published editorial rules, P0.1 database grants/RPC revocations, auth, payments, LINE, or guest access. Because no production write occurred, no backend rollback is required.

### Single Answer Resolver rollback

Remove `single-answer-resolver.server.ts` and its test, restore the prior narrative renderer call sites, and revert the additive resolver fields in `knowledge/types.ts` plus this specification section. This resolver phase made no database, migration, secret, payment, auth, guest, or P0.1 change, so rollback requires no backend action. No publish was performed.