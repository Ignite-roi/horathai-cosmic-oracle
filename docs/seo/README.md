# Horathai SEO Operating System

Horathai runs SEO with the **SEO Operating System** (full spec: `.claude/skills/seo-operating-system/`, master prompt in `references/FULL_PROMPT.md`).
SEO is a decision system, not a content generator: fix technical defects first, protect ranking URLs, one owner page per keyword intent, never invent facts, and measure toward sign-ups/revenue.

## Files in this folder

| File | Purpose |
|---|---|
| `SITE_CONFIG.yaml` | Site intake: domain, stack, conversions, protected URLs, priority weights |
| `AUDIT_2026-10-08.md` | Baseline audit, what was fixed, prioritised backlog |
| `BUSINESS_FACTS.md` | Fact registry (VERIFIED / NEEDS_CONFIRMATION / UNSAFE_TO_CLAIM). Content and schema may only use VERIFIED facts |
| `KEYWORD_OWNERSHIP.md` | One owner URL per keyword cluster; check before creating any page or article |
| `SEO_CHANGE_LOG.md` | Every SEO change with before/after, reason, commit. Respect the 7–14 day cooldown |

## Where SEO lives in code (single sources of truth)

- `src/lib/seo.ts` — `SITE_URL`, `INDEXABLE_STATIC_PATHS` (feeds the sitemap), `ROUTE_ALIASES`, `pageHead()` (title, description, canonical, OG), `NOINDEX_META`, JSON-LD builders, FAQ parity check.
- `src/routes/sitemap[.]xml.ts` — indexable static pages + published posts only.
- `src/routes/_authenticated.tsx` — every app screen is `noindex`.
- `scripts/seo-gate.mjs` — zero-LLM gates for the blog autopilot: keyword collision (SKIP_CANNIBALIZATION), canonical link rewrite, quality gate (hard failure → saved as draft).
- `src/lib/seo.test.ts` — run `npx vitest run src/lib/seo.test.ts` before shipping SEO changes.

## Rules for anyone (human, Lovable or Claude) editing public pages

1. A new public, indexable page needs: `head: () => pageHead({...})`, exactly one H1, real content in the server HTML, an entry in `INDEXABLE_STATIC_PATHS`, and a row in `KEYWORD_OWNERSHIP.md`.
2. Never add `/chart`, `/transit`, `/ai` (redirect aliases) or app routes to the sitemap or as internal link targets.
3. FAQPage schema only when the identical Q&A is visible on the page (enforced in `getPublishedPost`).
4. No ratings, reviews, prices, user counts, accuracy percentages or guarantees in content or schema unless the fact is VERIFIED in `BUSINESS_FACTS.md`.
5. Log the change in `SEO_CHANGE_LOG.md`.
