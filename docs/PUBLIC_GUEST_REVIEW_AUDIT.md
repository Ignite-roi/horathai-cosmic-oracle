# Public Guest Review / Payment Gateway Submission Readiness

วันที่ตรวจ: 2026-08-04  
ขอบเขต: preview เท่านั้น — **ไม่ได้ publish production**  
Security baseline: P0.1 Mock Lockdown (`docs/P0_1_MOCK_LOCKDOWN.md`)

## สรุป

เว็บไซต์เปิดเส้นทางที่กำหนดให้ผู้ตรวจเข้าได้โดยไม่ต้อง LINE Login แล้ว โดย Guest สามารถกรอกข้อมูลเกิดและคำนวณดวงจริงแบบชั่วคราวได้ ข้อมูลดังกล่าวเก็บใน `sessionStorage` ของ browser และไม่เขียนลงฐานข้อมูล ผู้ใช้ Guest ไม่สามารถเรียก AI แบบมีต้นทุน ซื้อแพ็กเกจ เพิ่มวัน/แต้ม หรือเรียก wallet RPC ที่มีสิทธิ์สูงได้

ระบบนี้อธิบายสถานะตาม **clean-room functional parity** เท่านั้น ไม่อ้างความเหมือนผลิตภัณฑ์อื่น 100% และไม่รับรอง logic proprietary ที่ไม่มีหลักฐานตรวจสอบ

## Capability Matrix

| หมวด | สถานะ | ขอบเขตที่ตรวจพบ |
|---|---|---|
| Natal chart | real backend | คำนวณฝั่ง server จากวัน เวลา จังหวัด พิกัด และ timezone; Guest ได้ผลชั่วคราว, ผู้ใช้ที่ยืนยันตัวตนบันทึกได้ |
| Transits / time travel | real backend | คำนวณตำแหน่งดาวจรและเทียบดวงกำเนิด; Guest ใช้ดวงชั่วคราวหรือดวงตัวอย่างที่มีป้ายกำกับ |
| Daily insight | real backend | ใช้ calculation/rule pipeline; Guest endpoint ถูก validate และจำกัดคำขอ |
| Calendar 6 เดือน | real backend | สร้างปฏิทินคะแนนจาก calculation/rule pipeline; ไม่ใช่คำรับรองผลลัพธ์ในอนาคต |
| Compatibility | real backend | คำนวณจากข้อมูลสองฝ่ายผ่าน service boundary; ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์ |
| AI / Knowledge Base | safe demo | AI จริงสงวนไว้สำหรับผู้ใช้ยืนยันตัวตน; Guest เห็นตัวอย่างแบบไม่เรียก Gemini จึงไม่สร้างต้นทุนสาธารณะ |
| Wallet / payment | safe demo | แสดงแพ็กเกจ ราคา และเงื่อนไข; Payment Gateway ยังไม่เชื่อมและไม่มีการรับเงินจริง |
| Referrals | real backend | มี referral code และข้อมูล backend; การทำรายการต้องยืนยันตัวตน |
| Result sharing | real backend | มี public read-only snapshot token; ไม่มีสิทธิ์แก้ไขจาก public route |
| Day transfer | blocked | ต้องยืนยันตัวตนและผ่านกฎยอดคงเหลือ; ไม่เปิดเป็น Guest action |
| LINE Login / LIFF | real backend | เป็นทางเลือก ไม่บังคับ Guest; ID token ตรวจฝั่ง server |
| LINE Messaging API / webhook | missing | ยังไม่เชื่อมเต็มรูปแบบ และไม่ได้ใช้ค่า Messaging channel แทน Login/LIFF channel |
| Terms | UI only | มีข้อกำหนดบริการและเงื่อนไขยกเลิก/คืนเงินก่อนเปิดชำระจริง |
| Privacy | UI only | อธิบายข้อมูล Guest ชั่วคราวและการจัดการข้อมูลในระดับหน้าเว็บไซต์ |
| Provider / product information | UI only | `/service-info` อธิบายบริการดิจิทัล สถานะ gateway และข้อจำกัด; ช่องทางติดต่อทางการยังรอเจ้าของยืนยัน |

## Public Route Smoke Test

ทดสอบแบบ signed-out บน live preview ที่ viewport 1280×1800:

| Route | ผล |
|---|---|
| `/` | 200, ไม่ redirect login, มี CTA “เริ่มใช้งานโดยไม่ต้องล็อกอิน” |
| `/onboarding` | 200, ไม่ redirect login |
| `/dashboard` | 200, ไม่ redirect login |
| `/birth-chart` | 200, ไม่ redirect login |
| `/transits` | 200, ไม่ redirect login |
| `/daily` | 200, ไม่ redirect login |
| `/calendar` | 200, ไม่ redirect login |
| `/compat` | 200, ไม่ redirect login |
| `/ai-astrologer` | 200, ไม่ redirect login; Guest ถูกจำกัดเป็น safe demo |
| `/premium` | 200, redirect ภายในไป `/wallet?checkout=packages` ตามการออกแบบ |
| `/wallet` | 200, ไม่ redirect login; แสดงแพ็กเกจแต่ปิด mutation สำหรับ Guest |
| `/terms` | 200 |
| `/privacy` | 200 |
| `/service-info` | 200 |

ไม่พบ browser page error ระหว่าง smoke test

## Guest Data Test

กรณีทดสอบ: ชื่อ “ผู้ตรวจระบบ”, 5 พฤษภาคม 1988, 00:00, ชัยภูมิ

- คำนวณผ่าน public server function สำเร็จ
- บันทึกเฉพาะ `sessionStorage` key `horathai:guest-birth-chart:v1`
- refresh แล้วข้อมูลยังอยู่ใน session เดิม
- `/birth-chart` แสดงป้าย “ดวงชั่วคราว — ยังไม่ได้บันทึก”
- จำนวน `birth_profiles` และ `natal_charts` ในฐานข้อมูลก่อน/หลัง Guest flow ไม่เปลี่ยน
- ไม่มีการ log payload ที่มีชื่อ/วันเกิดใน guest calculation path

ลำดับข้อมูลที่ใช้: ผู้ใช้ยืนยันตัวตน → Guest temporary chart → owner review sample ที่ติดป้ายตัวอย่าง

## Public Endpoint Controls

- `calculateGuestBirthChart`: Zod validation, province lookup, IANA timezone, ช่วงปีเกิด 1900–ปัจจุบัน และจำกัด 6 requests/minute ต่อ IP ต่อ instance
- `getReading`: Zod validation, `Asia/Bangkok`, date/time validation และจำกัด 30 requests/minute ต่อ IP ต่อ instance
- AI endpoint ใช้ authenticated middleware; Guest UI ไม่ส่งคำขอ Gemini
- ไม่มี Guest endpoint ที่ใช้ service-role client หรือเขียน PII ลงฐานข้อมูล

> ข้อจำกัด: rate limiter ปัจจุบันเป็น in-memory per-instance จึงเหมาะกับ review/readiness baseline แต่ไม่ใช่ distributed rate limit ที่แข็งแรงสำหรับ public production scale-out ควรเปลี่ยนเป็น shared durable store ก่อนเปิด traffic สูง

## P0.1 Security Evidence

ตรวจสิทธิ์สดและยิงคำขอด้วย publishable/anonymous credential:

- `complete_mock_day_purchase`: HTTP 401 / PostgreSQL `42501`
- `grant_user_days`: HTTP 401 / PostgreSQL `42501`
- direct insert `user_credits`: HTTP 401 / PostgreSQL `42501`
- `anon` และ `authenticated` ไม่มี `EXECUTE` บน privileged wallet RPC
- browser roles ไม่มี INSERT/UPDATE/DELETE บน economy tables
- balances และ ledger counts ก่อน/หลังคำขอ deny เท่ากัน (`total_days = 0`, `ledger_rows = 0` ณ เวลาทดสอบ)
- production hostname ยังคง fail-closed ก่อน mutation; service-role boundary ไม่เปลี่ยน

## Automated Verification

- TypeScript (`tsgo --noEmit`): ผ่าน
- Vitest: 7 files, 38 tests ผ่านทั้งหมด
- P0.1 regression tests: production deny/no mutation, cross-user ownership, host allowlist และ disabled mode ผ่าน
- Production build: ตรวจโดย project harness หลังการแก้ไข; ไม่ deploy/publish production

## ไฟล์ในงานนี้

สร้าง:

- `src/lib/public-rate-limit.server.ts`
- `src/lib/astro.schemas.ts`
- `src/routes/service-info.tsx`
- `docs/PUBLIC_GUEST_REVIEW_AUDIT.md`

แก้ไข:

- `src/lib/guest-birth.functions.ts`
- `src/lib/astro.functions.ts`
- `src/routes/index.tsx`
- `src/routes/_authenticated/onboarding.tsx`
- `src/hooks/useHomeReading.ts`
- `src/hooks/useReading.ts`
- `src/lib/wallet.ts`
- `src/routes/_authenticated/wallet.tsx`
- `src/routes/terms.tsx`

## สิ่งที่ยังขาด / ความเสี่ยง

1. เจ้าของบริการยังต้องระบุชื่อผู้ประกอบการ อีเมล/โทรศัพท์ และที่อยู่ที่ตรวจสอบได้ก่อนยื่น gateway จริง
2. Payment Gateway, webhook verification, receipt/invoice และ settlement ยังไม่มี; ห้ามสื่อว่าเปิดรับชำระแล้ว
3. LINE Messaging API/webhook ยังไม่มี และต้องแยก credentials/channel จาก LINE Login/LIFF อย่างเด็ดขาด
4. Distributed public rate limiting ยังไม่มี; in-memory limiter ลด abuse เบื้องต้นแต่ไม่เพียงพอเมื่อ scale หลาย instance
5. Daily/calendar/compatibility เป็นระบบคำนวณจริงตาม methodology ปัจจุบัน แต่ไม่ควรอ้างความเทียบเท่า proprietary implementation ของคู่แข่ง
6. custom domain `thaihora.app` ชี้ deployment revision เก่ากว่า preview ที่ตรวจ จึงอาจยังไม่เห็นงานนี้; รอบนี้ไม่ได้ publish ตามคำสั่ง

## Rollback

1. คืนไฟล์ frontend/hook ที่แก้ไขตามรายการด้านบนเป็น revision ก่อนงานนี้
2. ลบ route `/service-info` และไฟล์ schema/rate-limit ที่สร้างในงานนี้ หากไม่ต้องการ public review flow
3. คง migration และ permission ของ P0.1 ไว้ทั้งหมด — rollback งานนี้ **ห้าม** grant RPC หรือ economy-table mutations กลับให้ `anon/authenticated`
4. ปิด public review โดยเปลี่ยน config gate ที่ควบคุม guest route allowlist; อย่าแก้ auth/RLS เพื่อปิดโหมด
5. ตรวจ signed-out routes และ P0.1 security tests ซ้ำหลัง rollback
