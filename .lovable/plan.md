# Clean-room Functional Parity — Horathai

## เป้าหมายและขอบเขต

ยกระดับโปรเจกต์ Horathai เดิมให้ครอบคลุม journey ของแพลตฟอร์มโหราศาสตร์สมาชิกระดับ Premium ด้วยสถาปัตยกรรมและเนื้อหาต้นฉบับของ Horathai โดยไม่คัดลอกแบรนด์ ข้อความ ภาพ หน้าตา สูตร proprietary ตำรา หรือคำทำนายของบุคคลอื่น

หลักบังคับ:
- คำนวณข้อเท็จจริงทางดาราศาสตร์บน server แบบ deterministic และมี provenance/version
- ใช้เฉพาะกฎ `published` ที่มี citation; AI มีหน้าที่เรียบเรียง ไม่สร้าง facts/rules/citations
- แยก `review`, `development`, `production` แบบ fail-closed ฝั่ง server
- client ห้ามเพิ่มวัน แต้ม เครดิต สิทธิ์ หรือยืนยันการชำระเงิน
- ledger ทุกชนิดต้อง append-only, atomic และ idempotent
- รักษา Obsidian & Gold แต่ให้ mobile-first อ่านง่ายที่ 320/375/430px
- ยังไม่เริ่ม entertainment, wallpaper หรือ decorative expansion ก่อน P0/P1 ผ่านทั้งหมด

## A. Current-state inventory

### Complete foundation
- LINE/LIFF auth, server-side token verification, shared auth provider, protected route layout และ public review pass-through มีอยู่แล้ว
- Birth profile และ natal chart บันทึกจริง มี IANA timezone, coordinates, SHA-256 input fingerprint, calculation snapshot และ provenance
- Transit/Time Travel คำนวณอดีต–ปัจจุบัน–อนาคตจริง พร้อม planet/house/score comparison
- Day wallet UI, package catalog, points, referral code, transaction history, paywall sheet และ Buddhist expiry date มีอยู่แล้ว
- Knowledge governance มี system/source/rule/citation/release/transit schema, admin routes, reviewer/admin roles และ publication checks
- Public Review guest chart คำนวณชั่วคราวโดยไม่เขียนข้อมูลผู้ใช้; guest AI/write actions ถูกปิด
- Privacy/terms มี baseline disclaimer ว่าเป็น cultural/reflective guidance ไม่ใช่หลักฐานทางวิทยาศาสตร์หรือคำแนะนำวิชาชีพ

### Partial — ต้อง harden ก่อนต่อยอด
- Daily Hub มีคะแนนหลายด้าน, transit highlight, timeline และ check-in แต่ยังไม่มี daily snapshot contract, calendar/saved dates, สี/เลข/วันมงคลที่มาจาก published rules หรือกราฟชีวิตที่อ้างที่มาได้
- Natal Report มีผัง 9 ดาว/12 ภพและ dignity แบบ deterministic แต่ยังไม่ใช่ report ที่ consume published cited rules ครบทุกหมวด
- AI มี server auth, day gate และ safety prompt แต่ client ส่ง fact sheet เอง; ยังไม่สร้าง grounded context จาก authoritative saved chart + published release ฝั่ง server, ไม่มี citation display/feedback/report
- Wallet functions ทำงานแบบ transaction ใน RPC แต่ schema ปัจจุบันเก็บ balance เป็น mutable row และ transaction table ยังไม่มี idempotency key/reversal relationship/immutability trigger
- Referral มี schema/code UI แต่ qualification/award state machine ยังไม่ครบ
- Notification tables/preferences มีแล้ว แต่ LINE delivery consent, deep-link contract, retry/idempotency และ operations UI ยังไม่ครบ
- มี knowledge schema สองชุด (`kb_*` และ `astrology_*`) ซึ่งซ้อนหน้าที่กัน ต้องกำหนด canonical model และทำ compatibility migration โดยไม่ลบของเดิมทันที
- Calculation engine ระบุอย่างซื่อสัตย์ว่า `sidereal_lahiri_dev`, Lahiri + whole-sign; ยังไม่ใช่ Thai Suriyayatra ที่ validate แล้ว และ scoring rules ใน engine ยังเป็น hardcoded editorial logic ไม่มี citation

### Missing
- Compatibility, saved dates, daily topic credit/idempotent unlock, topic-credit ledger
- Production payments: orders, transactions, signed webhooks, manual slip review, refunds/reversals, reconciliation
- Missions/tutorial/member tiers/miles/Hall of Fame privacy controls
- Single-use day-transfer QR พร้อม expiry/threshold/double-spend protection
- Original card/lucky-number tools, wallpaper generator และ digital entitlements
- Content commerce/CMS/progress สำหรับ e-book/audio/video/course
- Social-impact receipts, moderation/reporting, generalized operations/audit/incident console
- Product analytics funnels/retention/revenue และ payment review dashboard
- Self-service privacy export/delete, consent history, minor/sensitive-claim policy UI

### ความเสี่ยงเร่งด่วนที่ยืนยันจากระบบปัจจุบัน
- `complete_mock_day_purchase` มีอยู่ใน production database และ server function เรียกได้โดย user ที่ signed in; ยังไม่มี server-side environment assertion จึงต้องปิดก่อนงานอื่น
- RPC ที่รับ `_user_id` เป็น `SECURITY DEFINER` ต้อง revoke สิทธิ์เรียกตรงจาก `anon/authenticated`; caller identity ต้องมาจาก validated server context เท่านั้น
- หลาย wallet tables มี broad SQL grants แม้ RLS จำกัด row; ควรลด grants ให้ตรงกับ read-only client contract
- ledger ปัจจุบันยังแก้/ลบ row ได้ในระดับสิทธิ์ฐานข้อมูลถ้าพลาด policy ภายหลัง; ต้องมี database immutability guard
- public `getReading` รับข้อมูลกว้างและไม่ใช้ auth/rate-limit contract เดียวกับ guest calculator; ต้องรวม public calculation boundary
- AI facts ที่มาจาก client แก้ไขได้ แม้ model prompt จะห้าม hallucination

## B. Target architecture

```text
LINE LIFF / Public Review / Web
             |
      TanStack Routes + Query
             |
  Authenticated Server Functions -------- Public Calculation Route
             |                               (Zod + IP rate limit)
             |
  Domain Services (server-only)
  | Identity & Consent
  | Calculation Registry
  | Rule Evaluation + Citation Snapshot
  | Reading/Compatibility/AI Grounding
  | Economy Command Service
  | Payment + Webhook State Machine
  | Growth/Transfer/Content/Notifications
             |
  Lovable Cloud Database
  | immutable ledgers + idempotency registry
  | user-owned projections under RLS
  | service-only operational/payment tables
  | canonical versioned knowledge releases
             |
  External providers
  | LINE Messaging / Share
  | Payment provider signed webhooks
  | Gemini (wording only)
```

Review mode ใช้ calculation/read projections เท่านั้น; development mock commands เปิดได้เฉพาะ server environment allowlist; production ไม่มี mock endpoint/function execution path

## C. Database contracts และ security boundaries

1. **Canonical knowledge model**: เลือก `astrology_* + knowledge_releases` เป็น production runtime contract; เก็บ `kb_*` เป็น editorial compatibility layer ชั่วคราว พร้อม mapping/view/backfill และ deprecation date
2. **Calculation registry**: `calculation_profiles`, `calculation_runs`, `chart_fact_snapshots`; เก็บ zodiac, ayanamsa, node type, house/aspect model, location/timezone, engine/version และ input/output hashes
3. **Interpretation**: `reading_runs`, `reading_rule_matches`, `citation_snapshots`, `ai_response_feedback`; snapshot facts/rule IDs/citations/release/version ทุกครั้ง
4. **Unified economy**: `economy_accounts`, append-only `economy_ledger_entries`, `economy_idempotency_keys`, `entitlement_grants`; แยก asset `day`, `point`, `topic_credit`, `mile`; balance เป็น projection ที่ตรวจ sum ledger ได้
5. **Payments**: `payment_orders`, `payment_transactions`, `webhook_events`, `manual_payment_reviews`, `refunds`; server-authoritative package snapshot/price/currency, unique provider IDs, raw payload จำกัด service role, signed webhook ก่อน write
6. **Growth**: `missions`, `mission_completions`, `tier_definitions`, `member_progress`, `referral_qualifications`; reward ผ่าน economy command เดียว
7. **Transfers**: `day_transfer_intents` + single-use hashed token, expiry, min remaining threshold, sender/receiver audit; redeem + debit + credit ใน transaction เดียว
8. **Daily topics**: `daily_reading_claims` unique `(user_id, local_date, topic_code)`; overview free claim และ topic debit atomic เพื่อไม่หักซ้ำ
9. **Compatibility/privacy**: `relationship_profiles` user-owned, optional birth time, consent/share token แบบ scoped+expiring; public share เป็น redacted snapshot
10. **Content/commerce**: products, product_assets, purchases, entitlements, progress; private asset metadata/service-only writes
11. **Trust/legal**: consent_events, privacy_requests, moderation_reports, security_incidents, immutable admin_audit_log, social_impact_entries/receipts

ทุก public table: explicit GRANT → RLS → policies ใน migration เดียว; owner reads ผ่าน `auth.uid()`, writes ผ่าน authenticated server function/RLS เมื่อเป็นข้อมูลผู้ใช้ทั่วไป, privileged mutation ใช้ role check ก่อนโหลด admin client; roles อยู่ใน `user_roles` เท่านั้น

## D. Route/component/server-function plan

- `/dashboard`: Daily Hub + date rail/calendar + saved dates + five scores + published-rule-backed color/day/lucky cues + life graph; ห้ามแสดงคำอธิบายที่ไม่มี citation
- `/birth-chart`: report tabs Facts / 10 Planets / 12 Houses / Life Areas / Sources; unknown birth time ปิด ascendant/houses และลด confidence
- `/transits`: ใช้ neutral event detector ก่อน rule matching; เพิ่ม event timeline, alerts/preferences และ saved-date compare
- `/compatibility`: second profile form, uncertainty state, five dimensions, redacted share link
- `/ai-astrologer`: ส่งเฉพาะ question/topic; server โหลด chart facts + released rule matches เอง; response แยก Facts / Interpretation / Citations / Limits + feedback/report
- `/wallet`, `/invite`, `/transfer`: ใช้ unified ledger; checkout เรียก real payment order หรือ review-only mock adapter
- `/readings/topics`: daily overview + idempotent topic unlock
- `/rewards`: missions/tutorial/tier/miles; `/hall-of-fame` opt-in aliases/aggregates เท่านั้น
- `/cards`, `/lucky-number`, `/wallpapers`: ทำหลัง P2; original rules/assets + disclaimer/rate limit/entitlements
- `/library`: product catalog/viewer/progress/entitlements
- `/settings/privacy`, `/settings/notifications`: consent, LINE channel preferences, export/delete requests
- `/admin/*`: payments, refunds, referrals, content, moderation, analytics, incidents, canonical KB publishing

Server functions แยก thin `*.functions.ts` wrappers ออกจาก `*.server.ts`; external webhooks อยู่ `/api/public/webhooks/...`, validate signature + Zod + idempotency ก่อน privileged write

## E. Calculation engine และ rule-pack contract

```text
CalculationInput
  birth/date/time/timeKnown + IANA zone + lat/lon
  profile {zodiac, ayanamsa, nodeType, houseSystem, aspectModel, version}
        -> Deterministic FactSheet
           planets/longitudes/speed/retrograde
           ascendant/houses only when timeKnown
           aspects + neutral transit events
           provenance + inputHash + outputHash
        -> RuleMatcher(releaseId, systemId, version)
           published + cited + conflict-safe rules only
        -> InterpretationBundle
           facts, matchedRuleIds, citationSnapshots,
           confidence, limitations, generated wording
```

- แยก hardcoded score/dignity prose ออกจาก astronomy layer; ย้ายไป versioned rule packs เมื่อมี citation
- engine registry รองรับ `sidereal_lahiri_dev` ปัจจุบันและ future engines แต่ไม่กล่าวอ้าง Suriyayatra จน benchmark ผ่าน independent references
- compatibility ใช้ two-chart fact set; unknown time ตัด house/ascendant rules และคำนวณ confidence จาก available facts ไม่เดา
- transit detector สร้าง ingress/station/exact aspect/house entry/natal contact + time window ก่อน interpretation

## F. Roadmap P0–P4

### P0 — Security & production boundaries
1. ปิด mock checkout ใน production ทั้ง server function และ DB RPC; revoke direct RPC execution
2. harden grants/RLS, immutable ledger guards, idempotency primitives และ reconciliation checks
3. ย้าย public calculation ไป endpoint เดียวที่ validate/rate-limit; ปิด client-supplied AI facts
4. กำหนด canonical KB mapping และ freeze duplicate writes
5. เพิ่ม environment matrix + deployment checklist + security regression suite

### P1 — Trusted reading core
1. calculation registry/fact snapshots/neutral event detector
2. released rule matcher + citation snapshots + confidence/limitations
3. rebuild Daily Hub, Natal Report, Transit และ AI บน InterpretationBundle
4. saved dates, feedback/report และ notification preference contract

### P2 — Economy, payments และ growth
1. unified multi-asset ledger/backfill
2. real payment state machine, signed webhook, manual slip, refund/reconciliation
3. referral qualification, missions/tutorial/tier/miles
4. day transfer QR และ daily topic reading

### P3 — Compatibility, LINE และ trust operations
1. compatibility + privacy-safe sharing
2. LINE messaging consent, deep links, retries, delivery logs
3. privacy export/delete, moderation, incident/admin operations, analytics funnels
4. Hall of Fame แบบ explicit opt-in และ aggregate-safe

### P4 — Original commerce/entertainment
1. card/lucky-number experiences
2. wallpaper generator/export/digital entitlement
3. content CMS, previews, purchase entitlement, media progress
4. social-impact ledger/receipts และ final accessibility/performance polish

Dependency: P0 → P1 → P2 → P3 → P4; ห้ามเปิด payment หรือ reward mutation ก่อน economy invariants ผ่าน และห้ามทำ P4 ก่อน P0/P1 acceptance ผ่าน

## G. Acceptance criteria และ tests

- **P0**: production mock call = 404/403 และไม่เปลี่ยน balance; direct RPC as authenticated denied; ledger UPDATE/DELETE denied; duplicate command key ให้ผลเดิม; RLS matrix anon/user A/user B/admin ผ่าน
- **P1**: golden charts deterministic; timezone/DST/unknown-time boundaries; system isolation; unpublished/uncited/conflicted rule ไม่ออกผล; AI แก้ fact ไม่ได้และทุกคำอธิบาย trace ถึง rule/citation; responsive 320/375/430 + reduced motion
- **P2**: concurrent debit ไม่มี negative/double spend; webhook replay ไม่เพิ่มสิทธิ์ซ้ำ; price tampering ไม่สำเร็จ; refund เป็น reversal ไม่แก้ ledger; referral self/cycle/replay ถูกปฏิเสธ; topic เดิมไม่หักซ้ำ
- **P3**: share token หมดอายุ/revoke ได้และไม่เปิด PII; LINE ส่งเฉพาะผู้ consent; export ครบ owner data; delete workflow audit ได้; analytics ไม่มี raw birth data/LINE identifiers
- **P4**: assets มี rights metadata; rate limits ทำงาน; entitlement บังคับฝั่ง server; media progress owner-only; disclaimer แสดงก่อน sensitive entertainment output

ทุก phase มี unit + integration + SQL/RLS + Playwright mobile + accessibility + security scan และ rollback rehearsal

## H. Migration, backfill และ rollback

1. ทำ additive migrations ก่อน: tables/enums/functions/indexes/grants/RLS โดยไม่ rename/drop ของเดิม
2. dual-read comparison สำหรับ knowledge และ economy; หลีกเลี่ยง dual-write จาก client
3. backfill ด้วย deterministic idempotency key จาก legacy transaction ID; reconcile opening + entries = projected balance
4. shadow-run calculation/rule outputs และเก็บ diff โดยไม่เปลี่ยนหน้าผู้ใช้
5. cutover ด้วย server-side feature flags แยก review/dev/prod; production default off
6. rollback โดยสลับ reader/command adapter กลับ legacy; migrations ใหม่ไม่ลบข้อมูล; payment webhook ยังบันทึก event แบบ idempotent
7. หลัง observation window จึง revoke legacy writes และค่อยวางแผน deprecation/drop แยก migration

## I. Security/privacy/threat-model checklist

- IDOR/RLS, privilege escalation, role checks, service-client import boundary
- forged/replayed webhook, price/package tampering, duplicate refund, out-of-order event
- ledger race/double spend/negative balance/idempotency collision
- referral farming/self-referral/cycles, mission replay, QR theft/replay
- AI prompt injection, client fact tampering, citation spoofing, sensitive deterministic claims
- public calculator abuse/rate-limit evasion/oversized payload
- share-token enumeration, birth-data leakage, analytics/log PII, LINE consent misuse
- CSRF/open redirect/deep-link validation/session fixation
- admin audit immutability, separation of duties, incident evidence retention
- data minimization, retention schedules, export/delete legal hold, minors/sensitive topics
- copyrighted source ingestion and asset-rights provenance

## J. Exact sequence of implementation prompts

1. **P0.1 Mock lockdown** — “Audit and fail-close every mock purchase path in production; add server environment assertions, revoke direct authenticated RPC execution, preserve review/dev behavior, and prove balances cannot change in production tests.”
2. **P0.2 Economy hardening** — “Add immutable ledger/idempotency primitives and database guards around existing day/point balances without changing wallet UI; include grants, RLS, concurrency and replay tests.”
3. **P0.3 Public/AI trust boundary** — “Unify guest calculation under one Zod + per-IP limited endpoint and change AI to build authoritative fact sheets server-side; do not redesign UI.”
4. **P0.4 Canonical KB decision** — “Map `kb_*` and `astrology_*`, select canonical runtime entities, add compatibility views/backfill verification and freeze ambiguous duplicate writes; no destructive migration.”
5. **P1.1 Calculation contract** — “Implement versioned CalculationInput/FactSheet/provenance hashes and neutral transit events around the current `sidereal_lahiri_dev`; preserve numerical outputs and golden tests.”
6. **P1.2 Governed interpretation** — “Implement released published+cited rule matching, citation snapshots, confidence and limitations; uncited/unpublished/conflicted rules must return no factual interpretation.”
7. **P1.3 Daily Hub** — “Rebuild `/dashboard` from InterpretationBundle with calendar, saved dates, five scores and only citation-backed cues; mobile 320/375/430, Obsidian & Gold.”
8. **P1.4 Natal + Transit reports** — “Wire `/birth-chart` and `/transits` to governed facts/rules, expose provenance/citations/limitations, and handle unknown birth time without fabricated houses.”
9. **P1.5 AI experience** — “Rebuild AI response contract and UI into Facts/Interpretation/Citations/Limits with feedback/report and safety tests; client sends question only.”
10. **P2.1 Unified economy backfill** — “Migrate days, points and future topic credits to an append-only multi-asset ledger with reconciliation and reversible cutover.”
11. **P2.2 Payments** — “Implement payment orders/transactions/signed idempotent webhook/manual slip/refund/reconciliation with server-authoritative prices; keep provider adapter isolated.”
12. **P2.3 Growth** — “Implement referral qualification, check-in missions, tutorial rewards, tiers and miles through the economy command service only.”
13. **P2.4 Transfer + topics** — “Implement single-use expiring day-transfer QR and once-per-day topic claims with atomic no-double-charge tests.”
14. **P3.1 Compatibility** — “Build second-person profiles, two-chart governed matching, unknown-time confidence and expiring redacted share links.”
15. **P3.2 LINE notifications** — “Implement consented LINE notifications, preferences, event deep links, retries/idempotency and delivery operations.”
16. **P3.3 Privacy/trust/admin analytics** — “Implement export/delete requests, moderation, incident logs, admin operations and privacy-safe funnels/revenue analytics.”
17. **P4.1 Original tools** — “Create original card and lucky-number mechanics/assets with transparent rules, disclaimers, rate limits and point loop; no copied content.”
18. **P4.2 Wallpaper + content commerce** — “Build rights-tracked wallpaper generation/export and content product entitlements/progress for e-book/audio/video/course.”
19. **P4.3 Final hardening** — “Run full RLS/payment/AI/privacy/accessibility/performance regression, rollback rehearsal and production readiness review before enabling flags.”

## Technical implementation rule

แต่ละ prompt ต้องจบด้วย migration diff, threat-specific tests, mobile screenshots ที่ขนาดเป้าหมาย, reconciliation/security evidence และ explicit rollback note; ห้ามเปิด feature flag ขั้นถัดไปหาก acceptance ของขั้นก่อนยังไม่ผ่าน