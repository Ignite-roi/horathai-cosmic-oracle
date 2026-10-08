# SEO OS quality gates

## Hard gates — block publish

- Unsupported or invented business fact
- Contradiction with verified Business Facts
- Wrong product/service/category
- Primary keyword owner conflict
- Semantic cannibalization with stronger existing owner
- Broken canonical
- Wrong robots/indexability
- Missing raw/prerender SEO artifact
- Published item missing required sitemap artifact
- FAQ schema differs from visible FAQ
- Schema claim not visible/factual
- Required owner/support link missing
- Unsafe unsupported legal/regulatory claim
- Invented price, discount, stock, review, rating, testimonial, delivery time, or guarantee
- Duplicate public URL alias indexed as separate page
- 404/unknown route inheriting homepage canonical/indexable state
- Critical conversion regression

## Soft warnings — targeted repair only

- Length outside target range
- Missing optional summary/table/example
- Minor title/meta length issue
- Weak image coverage
- Minor formatting inconsistency
- Low number of supporting internal links when intent is narrow
- Opportunity for clearer CTA or trust block

Soft warnings must not trigger full regeneration loops.

## Recommended page checks

- status 200 where intended
- title present and unique
- description present
- exactly one H1
- self canonical
- index/follow where intended
- primary content available in raw HTML
- meaningful crawlable links
- correct language
- no accidental homepage metadata inheritance
- relevant schema
- image alt hygiene
- no duplicate GTM bootstrap

## Factual confidence

Every claim should resolve to:
- VERIFIED
- ATTRIBUTED_EXTERNAL_EVIDENCE
- NEEDS_CONFIRMATION
- DO_NOT_PUBLISH

Never convert NEEDS_CONFIRMATION into a confident marketing claim.
