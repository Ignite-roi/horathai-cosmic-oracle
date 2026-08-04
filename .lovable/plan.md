# ดวงกำเนิด — Flagship Birth Chart Redesign

Rebuild `/birth-chart` into the app's benchmark screen: cinematic Obsidian Orrery chart, real saved natal data, and a full Thai reading layout — without touching LINE auth, Supabase security, entitlements, Transit, or the calculation engine.

## Data truth (most important change)

Today the page reads a client-side recomputation (`useReading` from the Zustand store). The redesign makes the **saved natal chart authoritative**:

- New `useNatalChart()` hook reads `getMyBirthContext()` (saved `birth_profiles` + `natal_charts`) via TanStack Query.
- Planets, houses, ascendant, ayanamsa, house system, UTC instant, lat/lon, timezone and engine label all come from the saved row.
- If a profile exists but no chart row does, show the calculating state and call the existing `calculateAndSaveChart` (no new engine logic, no new migration).
- Transit overlay for the ดาวจร / ซ้อนกัน tabs uses the existing `getMyTransit`.
- Guest / no-profile users get the clearly labelled demo path already used elsewhere; demo data is never written.

## Page structure

1. `BirthChartHero` — BIRTH CHART micro-label, ดวงกำเนิด title, ascendant badge, one-line summary, safe-area aware back nav.
2. `BirthChartTabs` — gold segmented control (ดวงกำเนิด / ดาวจร / ซ้อนกัน), 44px targets, animated gold pill.
3. `CosmicNatalOrrery` — flagship chart (see below).
4. Chart controls — เส้นมุมสัมพันธ์, ชื่อเต็ม/ชื่อย่อ, มุมมองวงโคจร/ผังราศี, รีเซ็ตมุมมอง.
5. `AscendantRevealCard` — sign, glyph, degree°minute′, element, house system, keywords, one grounded interpretation; facts and interpretation visually separated.
6. `PlanetPositionGrid` + `PlanetPositionCard` — all 9 planets: Thai numeral, name, sphere, sign, degree/minute, house, พักร์/เดินหน้า. 2 columns ≤430px, 3 columns above.
7. `BirthDataCertificate` — name, local date/time, accuracy, UTC instant, place, province, country, lat/lon, IANA tz, engine label + version, ayanamsa, house system, calculated_at, plus แก้ไขข้อมูลเกิด → onboarding.
8. `NatalInterpretationSections` — collapsible ภาพรวมตัวตน, จุดเด่น, สิ่งที่ควรระวัง, พลังของลัคนา, ดาวเด่นในดวง, ภพสำคัญ, สมดุลธาตุ, all derived from the saved chart by deterministic rules in a new `src/lib/interpretation.ts` (no AI, no invented positions).
9. `BirthChartActions` — primary ดูดาวจร; secondary แก้ไขข้อมูลเกิด, ดูคำทำนายเชิงลึก, แชร์ดวง. No paywall.
10. States: `BirthChartEmptyState` (ผูกดวง invitation), `BirthChartLoadingState` (celestial loader), `BirthTimeUnknownState` (ยังคำนวณลัคนาไม่ได้ + planet-only chart + set-time CTA), and an error state with Thai copy and retry.

## Chart rendering

`CosmicNatalOrrery` renders **SVG-first** (deterministic layout, crisp Thai labels, no WebGL cost), with an optional single R3F depth layer only on the `full` quality tier:

- Layers: outer zodiac ring with 12 sectors and Thai names/symbols, house references, 2–3 orbital rings, radiant core, planet spheres (radial gradients + rim light), ascendant ray and marker, aspect lines toggled on.
- Planet angles come from real longitudes; only label offsets are adjusted.
- Collision-aware labels: sort by angle, push overlapping labels along a leader line; abbreviate automatically on narrow widths.
- Motion: slow drift + core breathing via CSS/`framer-motion`, paused by `IntersectionObserver`, `document.hidden`, `prefers-reduced-motion`, and the existing `useQuality` battery tier. Chart is fully readable with zero animation.

## Files

- New: `src/components/chart/BirthChartHero.tsx`, `BirthChartTabs.tsx`, `CosmicNatalOrrery.tsx`, `ChartControls.tsx`, `AscendantRevealCard.tsx`, `PlanetPositionGrid.tsx`, `PlanetPositionCard.tsx`, `BirthDataCertificate.tsx`, `NatalInterpretationSections.tsx`, `BirthChartActions.tsx`, `BirthChartStates.tsx`.
- New: `src/hooks/useNatalChart.ts`, `src/lib/interpretation.ts`, `src/lib/chart-geometry.ts`.
- Rewritten: `src/routes/_authenticated/birth-chart.tsx` (composition + head metadata).
- Possibly small additions to `src/styles.css` for gold/obsidian chart tokens.
- Unchanged: auth, `src/lib/birth.functions.ts`, engine files, Supabase schema/RLS, transit components.

## QA before deploy

Typecheck, lint, production build; Playwright screenshots at 320/375/390/430/768/1440 checking zero horizontal overflow and label collisions; guest/demo, saved-chart, unknown-birth-time, loading and error states; reduced-motion and hidden-tab pause. Deploy to the existing production URL after all pass.

## Known limits

Interpretations stay rule-based and conservative; the ephemeris remains the current analytic `sidereal_lahiri_dev` engine (arc-minute level), and place data remains the Thai province table.
