# Keyword Ownership map — Horathai

One owner URL per keyword cluster. Before creating any page or article, check this table (the blog autopilot also runs `findKeywordCollision` in `scripts/seo-gate.mjs`).
Search volumes are not listed on purpose: none are verified yet. Add Search Console evidence when it is connected.

| Cluster | Primary keyword | Intent | Owner URL | Page type | Protected | Evidence / notes |
|---|---|---|---|---|---|---|
| brand | Horathai, Horathai AI | NAVIGATIONAL | `/` | Homepage | Yes | Brand entity (Organization + WebSite schema) |
| blog-hub | บทความโหราศาสตร์ไทย | INFORMATIONAL | `/blog` | Hub | Yes | Lists all published posts |
| yearly-forecast-2570 | ดูดวงปี 2570 | INFORMATIONAL | `/blog/horoscope-forecast-2570-thai-astrology` | Article | Yes | Only published article; in sitemap |
| yearly-love-2570 | ดวงความรักปี 2570 | INFORMATIONAL | (autopilot queue) | Article | — | Must link to the 2570 forecast owner, not compete with it |
| yearly-money-2570 | ดวงการเงินปี 2570 | INFORMATIONAL | (autopilot queue) | Article | — | Same as above |
| yearly-career-2570 | ดวงการงานปี 2570 | INFORMATIONAL | (autopilot queue) | Article | — | Same as above |
| ascendant-basics | ลัคนาราศีคืออะไร | INFORMATIONAL | (autopilot queue) | Article | — | Definition intent |
| ascendant-howto | วิธีหาลัคนาราศีของตัวเอง | INFORMATIONAL | (autopilot queue) | Article | — | How-to intent; must link to ascendant-basics and the /onboarding CTA |
| ascendant-by-sign | ดวงชะตาคนเกิดลัคนาราศี{ราศี} ×12 | INFORMATIONAL | (autopilot queue) | Article series | — | Distinct per sign; each links to ascendant-basics |
| transits | ดาวจรคืออะไร, ดาว{X}ย้ายราศี | INFORMATIONAL | (autopilot queue) | Article | — | Supports the app transit feature |
| service-info | ข้อมูลบริการ Horathai | NAVIGATIONAL | `/service-info` | Info | — | Facts page |

## Not indexable (never target keywords here)

App screens (`/dashboard`, `/birth-chart`, `/transits`, `/ai-astrologer`, `/onboarding`, etc.), share/transfer links (`/r/*`, `/transfer/*`), and the redirect aliases `/chart`, `/transit`, `/ai`. These carry `noindex` and are not in the sitemap. Commercial "ดูดวงกำเนิดฟรี" intent has no indexable owner page yet — see backlog item P2-1 in `AUDIT_2026-10-08.md`.
