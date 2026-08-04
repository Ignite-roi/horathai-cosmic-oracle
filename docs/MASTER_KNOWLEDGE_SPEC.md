# Horathai Master Knowledge Specification

## Canonical entities

- **Source**: `source_id`, code, title, author/editor, edition/date, publisher, language, rights status, license, checksum, review status.
- **Citation locator**: `citation_id`, `source_id`, page/folio/section, locator text, support type, transcription/OCR confidence, reviewer.
- **Concept**: stable concept code, Thai label, definition, parent/relations, owning system/version.
- **Atomic rule**: `rule_id`, immutable rule code/version, one rule family, one system/version, condition AST, outcome reference, confidence, limitations, reviewer, status.
- **Condition AST**: typed operators (`all`, `any`, `not`, `eq`, `in`, numeric comparison, angular range) over canonical fact keys. No executable code or prose parsing.
- **Outcome**: stable `outcome_id`, structured effects/scores/template keys; explanatory wording is separate.
- **Conflict**: links incompatible or disagreeing rules with scope, evidence, reviewer notes, and resolution state. Conflicts coexist.
- **Release**: immutable release ID/version containing exact rule IDs and versions for one interpretation profile.

## Production evaluation contract

Input pins calculation profile, interpretation profile, facts, release, locale, and optional neutral transit event. Output contains deterministic summaries and a trace per match:

```text
rule_id, rule_code, facts_used, outcome_id,
citations, confidence, limitations,
system_id, system_version, release_id
```

Production fails closed. A rule is excluded unless it is `published`, cited, reviewer-approved, tested, present in the release, and an exact system/version match. Competitor observations alone can never support a published rule.

## Lifecycle

`draft → review → approved → published → deprecated`

- **draft**: editable research object; may be incomplete.
- **review**: source locator, rights, system, AST, outcome, and conflicts checked.
- **approved**: reviewer and required tests complete; not runtime-visible.
- **published**: pinned to a release and runtime-eligible.
- **deprecated**: retained for audit/replay but excluded from new releases.

Every production rule requires at least one complete citation, automated positive/negative tests, a named reviewer, confidence, and limitations. Publication must not be inferred from popularity, copied output, or a matching example.

## System isolation

Every fact, rule, event, outcome, trace, and release carries `system_id` and version. Current Lahiri, experimental competitor compatibility, Thai Suriyayatra, Western tropical, Vedic, Burmese/Mon, Chinese, numerology, feng shui, and folk-remedy traditions remain isolated. Cross-system synthesis requires an explicit future composite profile and must expose every constituent source.

## Unknown birth time

When time is unknown, no ascendant, houses, house placements, angular contacts, or house-entry events may be emitted. Date-stable planetary facts may remain, tagged `birth.time_known=false`; rules requiring omitted facts cannot match. Confidence and limitations must state the reduced basis.

## Rights and disagreement

Substantial copyrighted text is not stored without permission. Original Horathai summaries reference locators but do not reproduce premium wording. Contradictory traditions are represented as separate versioned rules and conflict links; newer or more popular material never overwrites another school.

## Review and audit

Publication audit records actor, timestamp, previous/new status, release, test manifest, citation snapshot, and content hash. Replaying a historical release must yield the same rule set and template version. AI output, when enabled, is stored separately and cannot change the deterministic trace.
