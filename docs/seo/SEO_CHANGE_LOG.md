# SEO change log — Horathai

Log every SEO change. After a release, freeze major SEO edits for 7–14 days unless fixing a real defect. If a change hurts performance after a fair observation window, roll back before rewriting again.

| Date | URL / scope | Component | Before | After | Reason / evidence | Actor | Commit |
|---|---|---|---|---|---|---|---|
| 2026-10-08 | `/` | Server HTML | Loading text only, no H1/links | H1, factual intro, latest posts, footer links | Raw HTML audit (AUDIT #1) | Claude (SEO OS) | see git log "SEO OS" |
| 2026-10-08 | `/`, `/service-info`, `/terms`, `/privacy`, `/blog`, `/blog/*` | canonical, og:url, robots | Missing canonical/og:url on 4 pages | Self canonical via `pageHead()` | AUDIT #2 | Claude (SEO OS) | ↑ |
| 2026-10-08 | `/sitemap.xml` | URL set | Included `/chart`, `/transit`, `/ai` | Only indexable canonical pages + posts | AUDIT #3 | Claude (SEO OS) | ↑ |
| 2026-10-08 | App routes, `/r/*`, `/transfer/*`, 404 | robots | Indexable, homepage metadata | `noindex, nofollow` | AUDIT #4–5 | Claude (SEO OS) | ↑ |
| 2026-10-08 | `/blog/*` | FAQ + schema | Answers hidden from HTML; FAQPage always emitted | Answers in HTML; FAQPage only when it matches; BreadcrumbList added | AUDIT #6, #9 | Claude (SEO OS) | ↑ |
| 2026-10-08 | `/blog/*` | Internal links | `/chart`, `/transit`, `/ai` aliases | Rendered as `/birth-chart`, `/transits`, `/ai-astrologer` | AUDIT #7 | Claude (SEO OS) | ↑ |
| 2026-10-08 | Site-wide | Entity meta | `twitter:site=@Lovable` | Removed; `og:site_name`, `og:locale`, Organization/WebSite JSON-LD | AUDIT #8–9 | Claude (SEO OS) | ↑ |
| 2026-10-08 | Blog autopilot | Publishing pipeline | LLM output published directly | Collision preflight + quality gate; failures saved as draft | AUDIT #10 | Claude (SEO OS) | ↑ |
