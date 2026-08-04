# Horathai AI — Visual Design Audit & Redesign Master Plan

Note on references: only two of the six images arrived in this thread — the master visual (key art) and the AI astrologer character. The logo, target-UI board, current-home capture and competitor board were not attached. I captured the current app myself with a mobile browser pass, so the audit of the current state is based on the real running screens. The logo and competitor flow board still need to be re-uploaded before those parts can be honored exactly.

---

## 1. Visual audit of the current project

Captured at 420px mobile: `/`, `/chart`, `/ai`, `/transit`, `/premium`.

**Atmosphere — the biggest gap.** The master visual is near-black obsidian with deep violet nebula and a single warm gold light source. The running app renders a mid-tone, evenly-lit purple field (the aurora layer sits at 0.35–0.75 opacity over a light `--void`), so the whole screen reads as flat lavender. There is no darkness for gold to glow against, no light direction, no vignette. Result: a pretty gradient wallpaper, not a cinematic sky.

**No focal object.** The key art is built around one hero: the golden orrery and deity figure at the optical center. Home has no hero object at all — the "ท้องฟ้าวันนี้" card renders as two grey skeleton bars, and the 3D solar system never appears above the fold. The eye has nothing to land on.

**Massive dead space.** Home and Chart both end their content around 30% of scroll height and leave roughly 2000px of empty starfield above the nav. This alone destroys the premium read — luxury products are dense and deliberate, never sparse by accident.

**Empty state as first impression.** Because no birth data is set, the first screen a user sees is a skeleton card plus two "กรอกวันเกิด" prompts. The best-looking parts of the app (score rings, planets, transit engine) are invisible at first run.

**Gold is used as plastic, not metal.** The CTA is a flat linear gradient with no bevel, no specular sweep, no rim light, no inner shadow. In the reference, gold is a material: dark edges, hot highlight, warm bounce onto surrounding surfaces.

**Cards are generic glass.** Same radius, same border, same elevation for hero, stat and utility cards — no hierarchy. They read as shadcn defaults tinted purple, i.e. exactly the SaaS dashboard the brief rejects.

**Zero Thai cultural signal.** No lai-thai linework, no kanok fretwork, no temple-gold motif, no Thai numeral treatment beyond the streak count, no deity or orrery iconography. Nothing on screen says Thai astrology rather than generic Western horoscope.

**Typography is undersold.** Cinzel is declared but barely visible; Thai headings are plain Noto Sans Thai at default weight with no tracking discipline, no display scale, and only one eyebrow label.

**Nav is a UI-kit bar.** Five identical lucide outline icons in a pill, with no custom astrology iconography and no gold-lit active state beyond a background fill.

**The astrologer character is absent.** The official character exists as an asset but appears nowhere — the AI screen is a plain chat with no presence, no face, no authority.

---

## 2. Sections to redesign (complete list)

Global: background system, color tokens, gold material, glass/card system, typography scale, iconography, bottom nav, page headers, empty states, loading states, motion language.

Home: hero sky object, greeting/identity block, daily score ring cluster, highlight ("ดาวเด่นวันนี้") card, check-in, transit teaser, premium CTA.

Chart: 3D solar system stage, chart-mode switcher, planet detail sheet, aspect legend, 2D fallback list.

Transit: time-travel slider, before/after comparison, planet transition animation, event list.

AI: astrologer presence header, message bubbles, suggestion chips, composer, voice affordance.

Premium: trial hero, feature grid, plan card, trust band.

Onboarding: LINE login screen, birth-data form, province picker, calculating sequence.

Settings: account card, quality controls, preference groups.

New: splash/boot sequence, logo lockup, life-timeline 3D view, astrology calendar view.

---

## 3. Proposed design system — "Obsidian Orrery"

**Palette (OKLCH tokens).** Deepen the base hard: `--void` to near-black (L≈0.045), `--background` L≈0.075 with a violet cast. Nebula becomes an accent that appears in pools, never a full-screen wash — aurora opacity drops to 0.12–0.28 and gains a strong bottom vignette. Gold gets a four-stop ramp: `--gold-shadow` (dark bronze edge), `--gold-deep`, `--gold`, `--gold-hot` (near-white specular). Add `--ember` (warm orange bounce) for the candle-lit rim light seen in the key art.

**Gold as material.** One `.gold-metal` treatment: multi-stop gradient with a hot band at 38%, a 1px dark bronze edge, inner top highlight, warm outer glow, and a slow specular sweep on press. Applied to CTAs, ring progress, active nav, and premium marks.

**Surfaces, three tiers.** `surface-hero` (deep, heavy shadow, gold hairline, grain, inner top light), `surface-card` (mid, subtler), `surface-inset` (recessed, for list rows and inputs). Different radii per tier so hierarchy is legible without color.

**Light direction.** A single global warm key light from top-right, expressed consistently: card top edges catch light, bottom edges fall to black, glows bloom downward-left.

**Typography.** Display = Cinzel for numerals and Latin eyebrows only; Thai display = Noto Serif Thai 600 for headings (the printed-almanac authority Noto Sans Thai lacks); body = Noto Sans Thai. Fixed scale: eyebrow 11/0.28em uppercase gold, H1 28/1.2, H2 20, body 15/1.7, caption 12. Score numerals in Cinzel with tabular figures.

**Thai identity layer.** A reusable kanok/lai-thai corner ornament and a thin fretwork divider, both inline SVG at low-opacity gold, used on hero cards, section breaks and the premium panel. Zodiac glyphs in Thai astrological convention, with an optional ๑–๑๒ house-numeral mode in settings.

**Motion.** Cinematic easing `cubic-bezier(0.16,1,0.3,1)` throughout; entrances stagger 60ms; planets move on arcs, never linear; page transitions are a slow parallax of the sky rather than a slide.

---

## 4. Page-by-page redesign plan

**Boot / splash.** Logo lockup ignites from dark, orrery rings spin up and dissolve into the app. Around 900ms, skipped on repeat visits.

**Home.** Above the fold: identity strip (avatar, name, lagna, premium chip) → hero "ดวงวันนี้" panel with the large gold score ring in Cinzel numerals over an orrery ring → four-metric row (การงาน / การเงิน / ความรัก / สุขภาพ) as compact gold arcs. Below: "ดาวเด่นวันนี้" highlight card with the moving planet as a lit sphere, check-in streak strip, transit teaser with countdown, premium band. The empty state is replaced by a demo chart so a first-run user sees the fully designed screen behind a "นี่คือตัวอย่าง — ตั้งค่าดวงของคุณ" ribbon.

**Chart.** Full-bleed 3D stage across the top 55vh with the interpretation sheet as a draggable glass panel over it. The mode switcher becomes a segmented gold-rail control. Planet selection triggers a camera dolly and focus bloom, not a jump cut.

**Transit.** The time-travel slider becomes a horizontal gold rail with tick marks and a draggable orb; scrubbing drives the 3D planets in real time. Before/after becomes two stacked panels with animated delta arcs. The event list gets planet-colored dots and Thai date formatting.

**AI.** The header carries the official astrologer portrait in a gold-ringed frame with a subtle breathing glow and a speaking state; his identity stays fixed to the supplied character — no regeneration of the face. Bubbles: user on inset surface, astrologer on hero surface with a gold hairline and a small kanok corner. Suggestion chips as gold-outline pills. Docked composer with a voice button that opens a waveform sheet.

**Premium.** Cinematic key-art hero, gold "30 วันเต็ม" numeral, feature checklist with gold ticks, comparison table, trust band.

**Onboarding.** Full-screen cinematic steps, one question per screen, LINE button in official green, calculating sequence with the orrery assembling.

**Settings.** Grouped inset rows, quality selector with live preview thumbnails.

---

## 5. Mobile performance strategy

Three tiers resolved by `useQuality` (Auto / Full 3D / Battery), with Auto detecting deviceMemory, hardwareConcurrency, `prefers-reduced-motion` and connection type.

- Full: WebGL sky plus WebGL orrery, dpr capped at 1.75, bloom limited to one pass.
- Auto / mid: WebGL orrery only; the sky becomes CSS gradients plus a pre-rendered star PNG.
- Battery: no WebGL anywhere; all cosmic surfaces are static images and CSS.

Rules: at most one Canvas per route, never two at once; pause `frameloop` when the tab is hidden or the canvas scrolls out of view (IntersectionObserver); instanced geometry for stars and planets; textures ≤512px in KTX2/WebP; all 3D lazy-loaded behind `ClientOnly` so nothing enters the SSR bundle. Target ≤2.5s LCP on mid-range Android inside the LINE webview, with the first paint always non-WebGL.

---

## 6. Missing visual assets

Needed and not currently in the project:

- App logo lockup (SVG preferred), LINE Mini App icon, favicon — the logo image was not received.
- The official astrologer portrait in three crops: circular avatar, chat-header bust, premium hero.
- Key-art derived hero backdrop for the premium page and splash, mobile-optimized.
- Pre-rendered starfield/nebula PNGs for the battery tier.
- Kanok / lai-thai ornament SVG set (corner, divider, frame).
- Nine Thai planet glyphs (อาทิตย์ … เกตุ) as one consistent gold icon set.
- Twelve Thai zodiac symbols in the app's own style.
- Planet sphere textures — small and stylized, not photoreal maps.
- Empty/error state illustration.
- The target-UI board and competitor flow board, for exact hierarchy matching.

---

## 7. 3D vs animated vs static vs lightweight

- **3D (R3F):** birth-chart orrery, transit planet motion driven by the slider, life timeline. These are the product signature and justify the WebGL cost.
- **Animated (CSS/Motion, no WebGL):** score rings, card entrances, gold specular sweep, slider orb, check-in flame, chat typing, page parallax.
- **Static images:** key-art hero, astrologer portraits, logo, battery-tier sky, ornaments.
- **Lightweight / text-only:** settings, event lists, chat bubbles, interpretation copy — deliberately calm so the cosmic surfaces carry the drama.

---

## 8. Component implementation sequence

1. Tokens and materials: `styles.css` — palette deepening, gold ramp, three surface tiers, typography scale, ornament utilities.
2. Atmosphere: rebuild `LiveUniverse` / `LiveUniverseGL` for true obsidian depth, vignette, directional key light, tiered fallbacks.
3. Primitives: `GoldButton`, `Surface`, `SectionHeader`, `GoldRing`, `KanokOrnament`, `PlanetGlyph`, `StatPill`.
4. Shell: bottom nav with custom gold icons, page header pattern, page transition.
5. Home: hero sky panel, score cluster, highlight card, check-in, teasers, demo-chart empty state.
6. Chart: 3D stage restyle, segmented control, draggable interpretation sheet, camera focus motion.
7. Transit: gold slider rail, live 3D scrubbing, before/after panels.
8. AI: astrologer presence header, bubble system, chips, voice sheet.
9. Premium and Onboarding: cinematic heroes, forms, calculating sequence.
10. Settings, splash, then a performance pass and a mobile QA sweep across all three tiers.

---

## Technical notes

Work stays in `src/styles.css`, `src/components/**` and the route files; the Suriyayart engine, server functions, LINE auth and Supabase schema are untouched. New 3D stays behind the existing `useQuality` and `useHydrated` gates with lazy imports so SSR and the worker bundle are unaffected. Asset delivery uses `lovable-assets` pointers rather than committing binaries.