# เชื่อมระบบ LINE Login (LIFF) + ระบบผู้ใช้จริง

เป้าหมาย: ให้ Horathai AI รันเป็น LINE MINI App / LIFF โดยผู้ใช้กดเข้าจาก LINE แล้วล็อกอินอัตโนมัติ ได้ชื่อ+รูปโปรไฟล์ และข้อมูลวันเกิด/ดวง/สถานะพรีเมียมถูกเก็บในฐานข้อมูลจริง (ไม่ใช่ localStorage)

## สิ่งที่คุณต้องเตรียม (ผมทำแทนไม่ได้)

ตอนนี้คุณมีแค่ LINE OA (Messaging channel) ซึ่ง **ใช้ทำ LIFF ไม่ได้** ต้องสร้างเพิ่มใน LINE Developers Console:

1. เข้า console.line.biz ที่ Provider เดิม → Create new channel → **LINE Login**
2. ในแท็บ LIFF → Add → ตั้งค่า:
   - Endpoint URL: URL ของแอป (preview หรือ published)
   - Size: Full
   - Scopes: `profile`, `openid`
3. คัดลอกมาให้ผม 3 ค่า: **LIFF ID**, **LINE Login Channel ID**, **Channel Secret**

LIFF ID กับ Channel ID เป็นค่าสาธารณะ (เก็บใน env ปกติ) ส่วน Channel Secret จะเก็บเป็น secret ฝั่งเซิร์ฟเวอร์

## การล็อกอินทำงานอย่างไร

```text
เปิดใน LINE → liff.init() → liff.login() (ถ้ายังไม่ล็อกอิน)
      ↓ ได้ ID token จาก LINE
server function ตรวจ ID token กับ api.line.me/oauth2/v2.1/verify
      ↓ ได้ LINE userId / displayName / pictureUrl ที่เชื่อถือได้
สร้าง/ผูกผู้ใช้ในระบบ auth ของ Cloud → คืน session ให้เบราว์เซอร์
      ↓
แอปมีผู้ใช้จริง → อ่าน/เขียนโปรไฟล์ผ่าน RLS
```

เปิดนอก LINE (เบราว์เซอร์ปกติ) จะยังใช้ได้: แสดงปุ่ม "เข้าสู่ระบบด้วย LINE" ผ่าน LIFF web login และมีโหมด guest ที่ใช้ข้อมูลเดิมใน localStorage ต่อได้

## ฐานข้อมูล (migration)

- `profiles` — ผูกกับผู้ใช้ 1:1 เก็บ `line_user_id`, ชื่อแสดงผล, รูปโปรไฟล์, วันเกิด, เวลาเกิด, จังหวัด, สถานะ onboarding
- `entitlements` — สถานะพรีเมียม: ประเภทแผน, วันเริ่มทดลอง 30 วัน, วันหมดอายุ
- `gamification` — แต้มมงคล, สตรีค, วันเช็คอินล่าสุด (ย้ายจาก zustand)
- ทุกตารางเปิด RLS: เจ้าของอ่าน/แก้ได้เฉพาะแถวของตัวเอง + GRANT ให้ `authenticated` และ `service_role`
- trigger สร้างแถว profiles/entitlements/gamification อัตโนมัติเมื่อมีผู้ใช้ใหม่

## โค้ดที่จะเพิ่ม/แก้

| ไฟล์ | สิ่งที่ทำ |
| --- | --- |
| `src/lib/liff.client.ts` | โหลด `@line/liff` แบบ dynamic import (client-only) init/login/getIDToken/getProfile |
| `src/lib/line-auth.functions.ts` | server fn `signInWithLine`: verify ID token กับ LINE, ผูกผู้ใช้, คืน session |
| `src/hooks/useSession.ts` | สถานะผู้ใช้ + `onAuthStateChange` |
| `src/store/useProfile.ts` | เปลี่ยนจาก localStorage-only เป็นซิงก์กับ `profiles` (มี fallback guest) |
| `src/routes/onboarding.tsx` | ปุ่ม LINE login จริงแทน mock, บันทึกวันเกิดลงฐานข้อมูล |
| `src/routes/settings.tsx` | แสดงบัญชี LINE ที่เชื่อม + ปุ่มออกจากระบบ |
| `src/routes/premium.tsx` | อ่าน/เขียน trial 30 วันจาก `entitlements` แทน localStorage |
| `src/routes/__root.tsx` | เรียก LIFF init ครั้งเดียวตอนบูต |

ติดตั้งเพิ่ม: `@line/liff`

## ยังไม่รวมในรอบนี้

Messaging API (push ดวงรายวัน), Dynamic Rich Menu, share ผังดวงเข้าแชท — ทำต่อได้หลังจากระบบผู้ใช้เสร็จ เพราะทั้งหมดต้องใช้ `line_user_id` ที่รอบนี้จะเก็บไว้ให้แล้ว

## ลำดับการทำงาน

1. รัน migration สร้างตาราง + RLS + trigger
2. รับ LIFF ID / Channel ID / Channel Secret จากคุณ แล้วบันทึก secret
3. ทำ LIFF client + server fn ยืนยันตัวตน
4. ต่อระบบผู้ใช้เข้ากับ onboarding / premium / settings
5. ทดสอบทั้งในแอป LINE และเบราว์เซอร์ปกติ
