# Horathai Master Astrology Brain Plan

## Scope and invariants

This phase extends the existing calculation and Knowledge V1 foundations. It does not replace the natal engine, create a second knowledge runtime, mutate production data, or change auth, guest, payment, secrets, or P0.1 Mock Lockdown boundaries. Runtime calculation, rule selection, scoring, traces, citations, and Thai narrative templates must work without Gemini, OpenAI, or any network call.

Competitor research is a clean-room feature/output map only. Popularity and observed output are not proof of correctness. No competitor wording, imagery, brand assets, formulas, or proprietary code may enter Horathai.

## Four-layer architecture

1. **Astronomy core** — converts validated civil time, IANA timezone, and coordinates into versioned deterministic positions and neutral events. It never writes interpretation prose.
2. **Tradition profile** — pins zodiac, ayanamsa, node type, house system, aspect policy, calculation version, and implementation status. Profiles cannot be mixed implicitly.
3. **Knowledge rule graph** — evaluates atomic, cited, released rules against typed facts and returns a versioned trace. Only exact `system_id` + version matches are eligible.
4. **Deterministic narrative templates** — render original Horathai Thai summaries from outcomes and traces. AI is an optional later renderer, never a calculator or rule author.

## Calculation profiles

| Profile | Status | Contract |
|---|---|---|
| `sidereal_lahiri@3.0.0` | active | Current versioned deterministic Lahiri model; whole-sign houses; mean node |
| `competitor_compatible_experimental@0.0.0-observation.1` | experimental/unimplemented | Research namespace for observed differences; never a truth fixture |
| `thai_suriyayatra@0.0.0-planned` | planned/unimplemented | Disabled until formulas, edition-level citations, expert review, and benchmarks exist |

The 1988-05-05 00:00 Asia/Bangkok Chaiyaphum observation of Sagittarius from a competitor is retained only as `observed`, with unknown method and `usableAsTruthFixture=false`. Horathai must never special-case this input.

## Phased roadmap

### F0 — Brain contracts (this phase)
- Typed calculation/interpretation profiles and fail-closed compatibility checks.
- Server-side fact sheet with provenance and explicit unknown-time omissions.
- Published+cited exact-profile rule matching and evaluation traces.
- Original Thai deterministic templates and no-network unit tests.
- Observed benchmark manifest with `observed`, `unverified`, and `validated` states.

### F1 — Natal and transit
- Natal planets 0–9 taxonomy, number pairs, natal planets, and 12 houses as separate rule families.
- Neutral ingress, station, exact aspect, house entry, and natal-contact events before interpretation.
- Remedies and feng shui remain separate cited traditions; never derive them from astronomy alone.

### F2 — Daily outputs
- Daily overview plus nine domains: luck, work/money, study/exams, love, family/dependents, health, travel, legal matters, and missing person/property.
- Personal colors and good/bad days from released cited rules.
- Sensitive domains use reflective wording, limitations, and no deterministic medical/legal claims.

### F3 — Long-form tools
- Life graph with published scoring policy and reproducible input window.
- Five-dimensional compatibility with two explicit profiles and unknown-time degradation.
- Phone-number analysis in an isolated numerology system, never presented as astronomical fact.

### F4 — Electional and remedies
- Electional filters over neutral events and user constraints.
- Remedies only from rights-cleared, cited sources with tradition labels and safety review.

## Acceptance gates

Every production capability requires: exact profile/version, deterministic fixtures, no-network execution, cited published rules, named reviewer, rights clearance, conflict handling, limitations, trace completeness, unknown-time tests, and rollback rehearsal. Thai Suriyayatra naming is prohibited until its separate gate passes. Swiss/JPL certification or competitor parity claims are prohibited without independent multi-epoch evidence.

## Benchmark strategy

1. Register benchmark source, capture date, input, output, method visibility, and status.
2. Separate observations from validated references; an empty placeholder is not evidence.
3. Use multi-epoch, multi-location, boundary, timezone, DST, polar, and unknown-time cases.
4. Compare longitude, speed/retrograde, ascendant, house cusp policy, ingress time, and rounding independently.
5. Never alter expected values solely to match a screenshot or competitor result.
6. Promote `unverified` to `validated` only after reproducible independent execution and reviewer sign-off.

## Copyright and licensing

Full text is allowed only for public-domain, openly licensed, officially released, user-owned, or explicitly permitted material. Modern copyrighted works store bibliography and original Horathai rule summaries, not substantial copied text. Every citation records edition/date and page, folio, or section when available. OCR uncertainty remains visible until reviewed.

## Expert review workflow

Researcher registers source → extractor drafts atomic rule → reviewer verifies locator/rights/system → test author adds positive, negative, boundary, and conflict fixtures → expert approves → release manager publishes a pinned version. Contradictory schools become parallel rules; they are never silently merged or overwritten.

## Rollback

Foundation changes are additive and not connected to current UI. Roll back by reverting the profile, fact-sheet, rule-trace, narrative, benchmark, test, and documentation files. No database rollback is required in this phase. Existing calculation and Knowledge V1 consumers remain the fallback.