# P1.1 Astrology Accuracy Readiness Audit

Date: 2026-08-04  
Baseline commit: `3031d4e1bd073d2f28884bb1f26224938ce72a1f`  
Environment: Preview only; no publish

## Scope and claim boundary

P1.1 adds a deterministic benchmark manifest, runner, discrepancy model and readiness report. It does not alter astronomical formulas and does not claim accuracy certification, parity with another product, Swiss Ephemeris equivalence, JPL equivalence, or Thai Suriyayatra compatibility.

Current engine output is recorded only as `actual`. It is never copied into an independent `expected` field. Swiss/JPL/expert fields remain null until independently produced evidence is captured, licensed where necessary, reviewed, and attached with provenance.

## Calculation pipeline audit

| Stage | Current implementation | Audit result |
| --- | --- | --- |
| Thai civil time | `civil-time.ts`, strict `HH:mm` (`00:00`–`23:59`) | Enforced; AM/PM and `24:00` rejected |
| Timezone → UTC | `timezone.ts`, IANA timezone with historical offset iteration | UTC instant emitted per case |
| Coordinates | validated latitude/longitude passed to engine | Manifest covers Thai and foreign coordinates |
| Tropical positions | Astronomy Engine geocentric apparent longitude for seven bodies; mean node formula | Actual tropical longitude retained by runner |
| Ayanamsa | versioned Lahiri polynomial in `ephemeris.server.ts` | Value subtracted consistently; independently unverified |
| Sidereal positions | normalized tropical minus ayanamsa | Longitude/sign/degree/minute emitted |
| Ascendant | horizon/ecliptic formula then same ayanamsa | Omitted when birth time is unknown |
| Houses | whole-sign from sidereal ascendant sign | Omitted when birth time is unknown |
| Transit | same `computeChart` provenance at explicit UTC instant | Covered separately from natal |

## Manifest coverage

The manifest contains 44+ unverified inputs (currently generated as a stable immutable list) and covers:

- `00:00`, `00:01`, `11:59`, `12:00`, `23:59`;
- month/year edges and leap day;
- Bangkok, Chiang Mai, Ubon Ratchathani, Phuket;
- London, New York, Tokyo, including DST/non-DST cases;
- epochs 1950, 1988, 2000 and 2026;
- one-minute ascendant sensitivity and zodiac-boundary candidate pairs;
- unknown birth time;
- natal and transit calculations.

“Boundary candidate” is a coverage/search label only. It is not an assertion that an independently established exact ingress or ascendant boundary occurs at that instant.

## Discrepancy report contract

Each result reports actual UTC instant, tropical/sidereal longitude, sign, rounded degree/minute, retrograde state, ascendant and whole-sign house. For every comparable field it returns `expected`, `delta`, and `outcome`.

Without external evidence, outcome is `not_evaluated`, never pass. A fixture marked `validated` is blocked unless it has complete independent provenance and approved acceptance thresholds.

## Threshold governance

The code contains **proposed** thresholds only:

- longitude: 0.02°;
- ascendant: 0.1°;
- UTC instant: 1 second;
- exact sign, rounded degree/minute, retrograde and whole-sign house.

`APPROVED_ACCEPTANCE_THRESHOLDS` remains null. Proposed values do not establish readiness and cannot be used to pass a validated fixture. Approval requires expert review plus independent fixture evidence.

## Current readiness and gaps

- Independent expected fixtures: 0
- Validated fixtures: 0
- Swiss comparisons: 0
- JPL/Horizons comparisons: 0
- Expert-reviewed ascendant/house fixtures: 0
- Competitor observations remain `observed` and `usableAsTruthFixture=false`.

Therefore the current state is an **accuracy-audit foundation**, not certified and not parity-tested.

## Next evidence needed

1. Capture independently computed UTC, tropical and sidereal longitudes with exact software/version/settings.
2. Record ayanamsa, node type, observer coordinates, refraction policy, house system and delta-T/time-scale assumptions.
3. Obtain expert review for ascendant and house fixtures across low/high latitude and boundary cases.
4. Attach source reference, reviewer and review timestamp to each fixture.
5. Review and explicitly approve thresholds separately from fixture data.
6. Only then promote individual fixtures from `unverified` to `validated` and evaluate discrepancies.

## Rollback

Remove `accuracy-benchmark-manifest.ts`, `accuracy-benchmark-runner.server.ts`, `accuracy-benchmark.test.ts`, and this report. No calculation, database, auth, payment, LINE, P0.1, production data, secret, AI, or runtime network behavior needs rollback because none was changed.