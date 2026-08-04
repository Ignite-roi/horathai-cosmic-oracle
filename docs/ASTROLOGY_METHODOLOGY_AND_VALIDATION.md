# Astrology Methodology and Validation

## Declared methodology

Horathai currently implements **sidereal Lahiri astrology using whole-sign houses**. It does **not** claim Thai Suriyayatra compatibility. The calculation ID is `sidereal_lahiri_astronomy_engine`, version `3.0.0`.

## Calculation pipeline

1. Validate local Gregorian date, wall-clock time, IANA timezone and coordinates.
2. Convert the wall clock to UTC using the runtime timezone database, including historical DST.
3. Calculate geocentric apparent tropical longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter and Saturn with Astronomy Engine 2.1.19. Astronomy Engine documents validation against JPL Horizons and uses VSOP/JPL-derived numerical models.
4. Calculate mean lunar node; Ketu is the antipode.
5. Subtract the versioned Lahiri polynomial approximation from tropical longitude.
6. Calculate local sidereal time and tropical ascendant with the standard horizon/ecliptic intersection, then subtract the same ayanamsa.
7. Assign whole-sign houses from the sidereal ascendant sign. If birth time is unknown, ascendant and houses are `null`/empty.

All facts carry engine, calculation version, ephemeris source, ayanamsa name, house system and UTC instants. Interpretation is a separate KB/rule stage.

## Independent reference case

Input: **5 May 1988, 00:00, Chaiyaphum, Thailand**, `Asia/Bangkok`, 15.8068 N, 102.0315 E. UTC is 4 May 1988 17:00.

An independently recorded Swiss Ephemeris 2.10.03 calculation (`SIDM_LAHIRI`, whole-sign) gives sidereal ascendant **278.047959° = Capricorn 8°02′**. Horathai must remain within 0.25°. The attached reference image's Sagittarius label is therefore not adopted: its methodology, coordinates or time convention are not documented. Hard-coding Sagittarius would violate calculation provenance.

The distinct civil input `5 May 1988 24:00` normalizes to `6 May 1988 00:00`; it must never be conflated with the midnight at the start of 5 May.

## Tolerances and limits

- Ascendant golden tolerance: 0.25° against the recorded Swiss Ephemeris fixture.
- Planet output is deterministic and suitable for sign/degree presentation, but a complete independent multi-epoch Swiss/JPL fixture set is still required before a “certified” label.
- Lahiri is approximated by a documented polynomial; a future release should replace it with an IAU precession-based, independently benchmarked ayanamsa implementation.
- Mean node is used, not true node.
- Whole-sign houses do not provide quadrant cusps.
- Astrology is presented as reflective interpretation, not scientifically proven causation.

## Open references

- Astronomy Engine documentation/source: https://github.com/cosinekitty/astronomy
- JPL approximate planetary positions background: https://ssd.jpl.nasa.gov/planets/approx_pos.html
- Meeus, _Astronomical Algorithms_, for time/sidereal/coordinate transformations.

## Validation suite

`golden-case.test.ts` preserves the independent Chaiyaphum fixture. `astrology-engine-v2.test.ts` covers UTC/DST conversion, unknown birth time, retrograde state, sign-boundary invariants and canonical provenance consistency.
