# Horathai Knowledge Database V1

## Status and scope

V1 is a production-safe foundation for incremental, reviewed research. It does **not** mean that every astrology book has been ingested. The initial corpus contains taxonomy, three isolated system records, and bibliographic metadata for one user-provided scan. It contains no seeded predictive rules.

The current calculation layer is the versioned deterministic Lahiri model. The record `thai_traditional_unimplemented` is a research namespace only and does not claim Thai Suriyayatra compatibility; independent Swiss/JPL multi-epoch benchmarking remains pending.

## Separation of responsibilities

1. Astronomy/calculation produces authoritative chart facts and neutral transit events.
2. The knowledge rule engine matches only published rules from the requested system and version.
3. Citations connect rules to reviewed source locations.
4. AI receives a read-only interpretation context. It cannot calculate positions or create rules/citations.

## Source ingestion and rights review

1. Register bibliographic metadata and a checksum where available.
2. Set rights status before storing any transcription. Full text is allowed only for public-domain, openly licensed, user-owned, or explicitly permitted sources.
3. Build section/page manifests. Record OCR/transcription uncertainty as ingestion issues.
4. A reviewer approves sections and citations. Restricted raw text is server-only and never selected by client-facing source metadata.
5. Duplicate checksums are rejected by the database.

`TH-PROMMACHAT-TEP-001` registers the available 145-page “พรหมชาติ” scan by เทพ สาริกบุตร as `review_required` / `registered`. Its placeholder manifest is not a transcription and its copyright/edition status still needs review.

## Rule review and publishing

Draft rules must select exactly one astrology system and version. Conditions and outcomes are structured JSON; prose summaries do not replace calculated facts. Admin review attaches one or more citations, marks conflicts without merging traditions, and moves a rule through draft → review → approved → published. The database rejects publication without a citation.

Production matching accepts only published, cited rules in the selected release and exact system/version. Releases pin rule IDs and versions for auditability.

## Security model

- Authenticated users can read active system taxonomy, concepts, published source metadata, published rules/releases, and their own personal results.
- Raw source sections, ingestion queues/issues, conflicts, event generation, and audit logs are server-only.
- Clients cannot write rules, citations, source text, neutral events, releases, or audit records.
- Admin server functions validate the signed-in user and an `admin` role before loading the privileged backend client.

## AI grounding

The AI context contains validated calculated facts, published matched rules, citation snapshots, and approved safety constraints. It explicitly prohibits creating planetary positions, ascendants, houses, dates, rules, or citations. Generated wording is stored separately from facts and rule provenance.

## Known gaps

- No book transcription or OCR corpus has been approved.
- No predictive rule has been seeded.
- Thai traditional calculation compatibility remains unimplemented.
- Admin V1 supports metadata overview, draft creation, citation attachment, conflict visibility, and status workflow; richer section/OCR review tools remain future work.
- Database-level RLS behavior should also be exercised in a dedicated staging identity suite when test identities are available.
