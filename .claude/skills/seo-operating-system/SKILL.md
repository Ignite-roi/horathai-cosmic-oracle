---
name: seo-operating-system
description: Use for comprehensive SEO audits, SEO strategy, keyword ownership, technical SEO, content systems, competitor gap analysis, conversion SEO, image SEO, SEO monitoring, SEO automation, or when the user wants a reusable SEO operating system for any website. Also use when the user asks what to fix first, how to scale SEO safely, how to avoid cannibalization, how to build an SEO autopilot, or how to connect SEO work to leads and revenue.
---

# SEO Operating System

Operate SEO as a decision system, not as a content-generation task. The objective is to choose the highest-value next SEO action using verified evidence, protect existing rankings and conversions, prevent cannibalization, keep factual claims grounded, and measure success through leads and revenue rather than traffic alone.

For full detail, read `references/FULL_PROMPT.md`. For implementation structure, read `references/DATA_MODELS.md`, `references/QUALITY_GATES.md`, and `references/WORKFLOWS.md` as needed.

## Core operating principles

1. Start read-only unless the user explicitly asks to edit, publish, deploy, or change production.
2. Audit before creating content.
3. Prefer deterministic checks over LLM calls.
4. Never invent business facts, prices, discounts, locations, delivery promises, stock, review counts, guarantees, legal claims, search volume, or conversion data.
5. Assign one primary owner page per commercial keyword cluster.
6. A blog supports money pages; it must not steal their primary commercial intent.
7. Preserve URLs with existing GSC clicks, impressions, backlinks, or conversions unless there is a strong migration reason.
8. Initial HTML must communicate the page without requiring JavaScript: title, description, H1, canonical, primary content, crawlable links, and relevant structured data.
9. Dynamic publishing must fail closed: no page becomes indexable/published until its SEO artifact, canonical, sitemap status, and quality gate are ready.
10. After meaningful SEO changes, use a 7–14 day observation/cooldown window unless there is a real technical defect.
11. Do not chase page count. The system is allowed to decide “do not create new content.”
12. Optimize toward qualified leads, purchases, and revenue, not vanity traffic.

## Evidence hierarchy

Use evidence in this order when available: current website/project code and database; Search Console; analytics and conversion data; CRM/order/payment data; site search/support/chat/customer-question data; current SERP and competitor evidence; verified owner facts; and AI inference only for organization, clustering, drafting, or explanation—not for facts.

Label uncertain claims as `NEEDS_CONFIRMATION` rather than guessing.

## Default modes

### AUDIT
Read-only. Inspect technical SEO, indexability, rendering, sitemap, canonicals, metadata, H1, schema, internal links, GSC signals, content duplication, current routes, database-published content, performance, and conversion instrumentation.

### PLAN
Produce Business Facts, Keyword Ownership, Priority Engine outputs, competitor gaps, money-page decisions, content backlog, CRO backlog, image plan, monitoring plan, and release phases.

### IMPLEMENT
Only when explicitly approved. Change the smallest coherent set of files/data. Preserve calculators, tracking, payments, CRM, pricing logic, routes, and working conversions unless the scope explicitly includes them.

### QA
Test built output and raw/no-JS HTML, not only React/source code. Verify crawlability, indexability, schema, sitemap, aliases, canonical ownership, internal links, tracking, calculators, CTAs, admin, and critical conversion flows.

### MONITOR
Use GSC/analytics/revenue after deployment. Detect index problems, CTR opportunities, ranking movement, content decay, cannibalization, and revenue changes. Avoid needless daily churn.

## Required system layers

### Technical SEO foundation
Check raw initial HTML, self canonical, unique title/meta, exactly one H1, substantial content, crawlable links, robots/indexability, sitemap, aliases/duplicates, not-found behavior, schema in initial HTML, favicon/alt hygiene, dynamic content prerender, and build-output tests. If dynamic content is publicly exposed but not SEO-ready, keep it `SEO_PENDING` rather than indexable.

### Business Facts source of truth
Create statuses `VERIFIED`, `NEEDS_CONFIRMATION`, `CONTRADICTORY`, `UNSAFE_TO_CLAIM`. Include identity, products/services, pricing, minimums, VAT/tax, design fees, delivery, turnaround, urgent-service conditions, pickup, materials, sizes, file types, warranty/remake, locations, contacts, invoice/quotation, proof points, durability claims, and legal/compliance-sensitive claims. Pages, schema, FAQ, AI content, and reusable blocks should use verified facts.

### Keyword Ownership
Create one central map with primary keyword/intent, owner URL, page type, secondary/support terms, protected status, conflicts, and evidence. One commercial owner per cluster. Product/model pages own exact product/model intent. Blogs own informational intent and support money pages. Run ownership/collision checks before new URLs or articles.

### Keyword Priority Engine
Use deterministic scoring; never invent volume. Default score before penalties: 22% Ranking Opportunity, 18% Impression Opportunity, 12% CTR Gap, 12% Buyer Intent, 10% Product/Service Coverage, 10% Business Value, 6% Trend, 5% Existing Page Leverage, 5% Content Gap. Penalties: Cannibalization up to −30; no evidence up to −30; cooldown up to −20; weak data up to −15; duplicate intent may hard-skip.

Actions: `OPTIMIZE_EXISTING`, `CREATE_MONEY_PAGE`, `WRITE_SUPPORT_BLOG`, `REFRESH_CONTENT`, `MERGE`, `REDIRECT`, `WAIT_FOR_DATA`, `SKIP_CANNIBALIZATION`. Every recommendation includes score, owner URL, evidence, reason, intent, confidence, and next action.

### Competitor Gap
Research by product/service cluster. Compare ranking page types, intent, offers, calculators/prices, materials/options, examples/images, trust, shipping/turnaround, FAQs, content depth, and commercial gaps. Separate `REAL_OPPORTUNITY` from `COMPETITOR_HAS_IT_BUT_DO_NOT_BUILD`.

### Money Page Architecture
Evaluate demand evidence, buyer intent, product evidence, owner overlap, cannibalization risk, business value, proof/assets, and conversion potential. Decide `BUILD`, `OPTIMIZE_EXISTING`, `WAIT`, or `DO_NOT_BUILD`.

### Conversion SEO / Revenue attribution
Track Organic Query → Landing Page → Calculator/Configurator Start → Completed Calculation → CTA/LINE/Contact → Lead → Quote → Purchase/Verified Payment → Revenue. Recommended parameters include landing_page, page_type, product/service, keyword_cluster, calculator_started/completed, calculated_value, cta_position, contact click, lead/quote/purchase IDs where safe, revenue, source/medium/campaign.

### SEO CRO
For traffic with weak conversion, inspect hero clarity, price visibility, calculator placement, CTA, trust, examples, turnaround/shipping clarity, FAQ, and mobile CTA. Change only with evidence and log outcomes.

### Image SEO / Evidence Library
Prefer real work. Plan clean product/service visual, angle/detail, scale, result, close-up, action/process, use case, size/material comparison, and packing/shipping where relevant. Define filename, alt, caption, format, dimensions, compression, crops, and privacy/permission. Tag real job assets by product, material, size, industry, use case, indoor/outdoor, date, and permission status.

### Trust / E-E-A-T / Entity SEO
Use actual production, machines, materials, company facts, invoices/quotations, file preparation, shipping/turnaround, and policies. Build entity graph Brand → Service → Material → Size → Use Case → Calculator → Guide → FAQ. Never fabricate reviews, awards, ratings, client results, or credentials.

### Local SEO
Only after location/service facts are verified. Maintain business identity consistency and create useful local pages only where there is genuine value. Never mass-generate doorway locations.

### Content lifecycle
Every 30–90 days classify `KEEP`, `UPDATE`, `MERGE`, `REDIRECT`, `NOINDEX` using clicks, impressions, ranking, revenue/conversion, backlinks, overlap, freshness, and internal-link value. Do not delete valuable URLs blindly.

### Monitoring
Operate Index Coverage Monitor, SERP Position Monitor, CTR Opportunity Engine, Content Decay Detector, Cannibalization Monitor, Orphan Page Detector, Intent Collision Detector, Brand SERP Monitor, and Search Appearance monitor. Weekly/periodic monitoring is preferred to daily churn.

### Change management
Maintain SEO Change Log: date, URL, component, before, after, reason, evidence, actor, release/commit. Preserve rollback versions. If a fair post-change period shows meaningful harm, consider rollback rather than continual rewriting.

### Programmatic / seasonal safety
Programmatic pages require distinct intent/value, real evidence/data, meaningful unique content, and business relevance. Block doorway permutations. Prepare seasonal content before demand peaks and avoid stale “current” claims afterward.

### SEO Autopilot v2
Pipeline: GSC Opportunity → Business Evidence Check → Ownership Check → Intent Collision Check → Action Selection → Draft/Change → Quality Gate → Approval → Publish → Index → Cooldown → Measure → Revenue Feedback. The AI SEO Manager must be allowed to output `NO_NEW_CONTENT`.

## LLM cost-control rules

Do not use LLM calls for canonical construction, sitemap generation, price tables from structured facts, schema from deterministic data, exact route ownership checks, duplicate slug checks, counts, required-link checks, FAQ parity, metadata length, robots rules, or build-artifact checks.

Preferred content workflow: deterministic preflight → verified facts/evidence → recipe/template → one full generation → deterministic validation → maximum one targeted repair → quarantine/fail closed rather than repeated rewrites. Soft warnings never trigger whole-article regeneration.

## Quality gate

Hard failures include unsupported/invented facts, contradictions, wrong product/service, duplicate/cannibalizing intent, broken canonical/indexability, missing SEO-ready artifact, schema contradictions, FAQ mismatch, missing required owner/internal destination, unsupported legal/regulatory claims, invented price/stock/discount/review, indexed aliases, 404/homepage-canonical leaks, and critical conversion regressions.

Soft warnings include length outside target, weak summary, minor metadata length, missing optional table/example/image, or minor formatting. Soft warnings allow targeted fixes.

## Release discipline

Before publish: build passes; SEO tests pass; raw/no-JS HTML passes; sitemap matches canonical routes; key conversions smoke-tested; tracking intact; no accidental URL churn; no unresolved hard factual conflicts.

After publish: submit sitemap only when appropriate; inspect priority URLs if needed; freeze major SEO edits 7–14 days unless fixing real defects; measure impressions → position → CTR → conversion → revenue.

## Required deliverables for a full-site job

Return: Executive summary; baseline/data maturity; technical findings; Business Facts matrix; Keyword Ownership map; scored priority queue; competitor gap; Money Page decision matrix; duplicate/cannibalization actions; conversion/revenue plan; image/evidence plan; monitoring plan; QA/release gate; phased backlog; explicit do-not-do list; owner confirmations; deterministic vs AI responsibilities; LLM cost reduction plan; remaining risks.

When the user asks for a reusable implementation specification, use `references/FULL_PROMPT.md` as the canonical full prompt and adapt only site-specific placeholders.
