# Business Facts registry — Horathai AI

Only `VERIFIED` facts may appear in pages, schema, FAQ, or AI-generated articles. Everything else must stay out of public copy until the owner confirms it.
Sources: current code and public pages (`/service-info`, `/terms`, `/privacy`) as of 2026-10-08.

| Fact | Value | Status | Evidence |
|---|---|---|---|
| Brand name | Horathai AI | VERIFIED | Site title, root meta |
| Domain | https://thaihora.app | VERIFIED | `src/lib/seo.ts`, live sitemap |
| Service type | Digital service: birth chart, Thai astrology for self-reflection, transits, calendar, AI assistant | VERIFIED | `/service-info` |
| Calculation model | Lahiri sidereal model, versioned | VERIFIED | Root meta description, `docs/ASTROLOGY_METHODOLOGY_AND_VALIDATION.md` |
| Input data | Birth date, time, province | VERIFIED | Onboarding, blog CTA |
| Channel | Web + LINE (LIFF / LINE login) | VERIFIED | `useAuth`, homepage |
| Nature of results | Self-reflection/entertainment; not scientific fact or professional advice | VERIFIED | `/terms`, `/service-info` |
| Packages | Day-based digital access; prices shown on `/wallet` | VERIFIED (existence) | `/service-info` |
| Payment | No live payment gateway; no real charges yet | VERIFIED (current state) | `/service-info`, `/terms` |
| Prices / promotions / free-trial length | — | NEEDS_CONFIRMATION | Do not publish until sales open |
| Official contact / support channel | — | NEEDS_CONFIRMATION | `/service-info` says pending |
| Legal business name / address | — | NEEDS_CONFIRMATION | Not published |
| User counts, ratings, reviews, testimonials | — | UNSAFE_TO_CLAIM | No verified data |
| Accuracy percentages / "แม่นยำ 100%" / guarantees | — | UNSAFE_TO_CLAIM | Contradicts `/terms` |
| Health, legal, financial outcome claims | — | UNSAFE_TO_CLAIM | Prohibited by `/terms` |

When a fact changes, update this table first, then the pages that use it, then log it in `SEO_CHANGE_LOG.md`.
