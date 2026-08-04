# Phase: LINE identity, persistent profile, onboarding → Dashboard

Goal for today: the four core checkpoints work end-to-end inside LINE.
1. Open in LINE → backend-verified LINE user
2. User saved in the database
3. Birth data entered → still there after closing and reopening
4. Chart calculated → land on Dashboard

No visual redesign in this phase. Screens keep the current Obsidian & Gold look; only structure, data and states change.

## 1. LIFF boot and session

A single boot state machine with explicit phases: booting → in LINE / external browser → logged out / verifying → ready / error.
- Nothing protected renders until boot finishes; a branded loading screen covers it.
- In LINE and already logged in → silent ID-token verification.
- In an external browser → a clear "เปิดผ่านแอป LINE" screen plus a LINE Login button, no dead end.
- Expired or invalid session → one automatic re-verification with a fresh LIFF ID token, then a retry button.
- Every failure state gets a Thai message and a ลองใหม่ action: LIFF init failed, LINE login failed, token verification failed, backend unreachable, offline.

The server already verifies the ID token with LINE and never trusts client-supplied identity; that stays. Added: `last_login_at` on every verified sign-in, failure logs that never contain raw tokens, and a simple rate limit on the sign-in and chart-calculation endpoints.

## 2. Database changes (one migration)

`profiles` — add picture URL, onboarding completed, subscription status, trial start, trial end, last login. Existing columns and the signup trigger stay so nothing currently working breaks.

`birth_profiles` (new) — user, nickname, birth date, birth time, birth-time-known flag, country, province, district, latitude, longitude, timezone, calculation system, timestamps. One active birth profile per user now, shaped to hold several later.

`natal_charts` (new) — birth profile reference, ascendant sign and degree, planets JSON, houses JSON, standards JSON, calculation version, calculated time.

Access rules on both new tables so each person can read and write only their own records, with the required grants. Chart rows are written server-side after calculation.

## 3. Onboarding (5 steps, Thai, mobile-first)

1. ชื่อเล่น + วันเกิด (Buddhist year shown, Gregorian stored)
2. เวลาเกิด — exact, or "ไม่ทราบเวลาเกิด" (falls back to 12:00 and flags reduced accuracy for ascendant-dependent readings)
3. ประเทศ / จังหวัด / อำเภอ — province drives coordinates from the existing 77-province table; district is optional free text for now
4. ทบทวนข้อมูล before saving
5. คำนวณและบันทึกดวง — calculate, store the natal chart, mark onboarding complete, go to Dashboard

Draft answers persist per step so leaving and returning inside LINE resumes where the user stopped. Validation with clear Thai errors (future date, impossible time, missing province).

## 4. Routes and guards

Protected paths behind one auth gate: `/dashboard`, `/birth-chart`, `/transits`, `/time-travel`, `/ai-astrologer`, `/premium`, `/settings`. `/onboarding` sits behind LINE sign-in but before the birth-profile requirement. Existing `/chart`, `/transit`, `/ai` redirect to the new paths. `/` becomes the entry screen that routes on state:

```text
LIFF not ready        → loading screen
not signed in         → LINE login
signed in, no chart   → /onboarding
signed in, has chart  → /dashboard
```

Entitlement is derived server-side: active trial or paid → premium, otherwise free.

## 5. Astrology service boundary

The real Suriyayart engine already in the project is wrapped behind one typed service returning ascendant, planets, houses, planet standards, transit summary and calculation version. Results are versioned and cached in `natal_charts`, recalculated when the version changes. No mock data is introduced — production data only.

## 6. Dashboard

Real data only: LINE picture and display name, ascendant, today's main transit, the four life scores, next planetary event, and premium trial days remaining. Missing birth time shows an accuracy note instead of silently guessing.

## 7. Verification

Passes for: first-time LINE user, returning user, external browser, signed-in user without a birth profile, complete profile, active trial, expired trial, and iOS/Android LINE WebView viewport sizes.

## Delivered afterwards

Migration summary, environment variables still required, route list, the authentication flow, and remaining setup steps on the LINE and backend side.