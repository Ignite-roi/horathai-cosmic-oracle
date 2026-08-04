# Deterministic Logic Contracts

## สัญญากลาง

ทุกผลต้องมี engine/profile/release version, input hash, facts, matched rule traces, output, limitations และ warnings การใช้ input, profile และ release เดิมต้องได้ผลและ hash เดิมเสมอ

Production rule ต้อง Published, อยู่ใน immutable release, มี citation locator ที่ตรวจแล้ว, rights clearance, ผู้ตรวจที่ไม่ใช่ผู้สกัด, positive/negative/boundary tests และไม่มี blocking conflict

## ข้อมูลเกิดและเวลาไม่ทราบ

Input ต้องมี local date, time precision, IANA timezone, latitude/longitude และ calendar

- เวลาแม่นระดับนาที: ใช้ลัคนา เรือน และแกนมุมได้
- เวลาโดยประมาณ/ช่วงเวลา: คำนวณหลายค่าและใช้เฉพาะ facts ที่คงที่; ส่วนไม่คงที่เป็น candidate set
- ไม่ทราบเวลา: คำนวณช่วงทั้งวัน ห้ามใช้เวลาเที่ยงแทนค่าจริง ห้ามพยากรณ์จากลัคนา เรือน เจ้าเรือน หรือแกนมุม

## พื้นดวง

Facts: ดาว, longitude, ราศี, องศา/ลิปดา, speed, motion, retrograde, ascendant, houses, aspects, dignity และ lordship ตามสำนัก

Rule families: planet-in-sign, planet-in-house, house-lord, aspect, dignity, angularity, configuration และ synthesis

AI/Template ห้ามสร้างบุคลิกหรือเหตุการณ์ที่ไม่มี matched rule

## ดาว 0–9 และ 12 บ้าน

เลขดาวต้องเป็น catalog data ตาม tradition ไม่ฝังใน UI เลข 0/8/9 ต้องมีแหล่งอ้างอิงเฉพาะสำนัก

เรือนใช้ canonical key 1–12 ชื่อไทยเป็น localization occupant, lord และ aspect เป็น facts แยก ห้ามสร้างเรือนเมื่อไม่ทราบเวลาเกิด

## คู่เลขและเบอร์มือถือ

Input: หมายเลขดิบ, country code, include-country-code และ segmentation profile

Facts: normalized digits, overlapping adjacent pairs, index, frequency, repeated sequence และ sum เฉพาะเมื่อโปรไฟล์กำหนด

Output ต้องบอกความหมายรายคู่, conflict และ coverage ratio สูตรตัดเลขนำหน้า คู่ย้อนกลับ น้ำหนักตำแหน่ง และผลรวมยังเป็น evidence gap ห้ามเดาให้เหมือนคู่แข่ง

## ดาวจรและดาวย้าย

Facts: transit positions, sign/house ingress, aspect enter/exact/exit, station และ retrograde windows

ช่วงวันต้องได้จากการหาจุดตัดทางคณิตศาสตร์ ไม่ใช่ข้อความกำหนดเอง ทุก event ต้องมี start/exact/end และ precision

## รายวันและ 9 หมวด

Product taxonomy ของ Horathai ต้อง versioned เช่น overall, career, finance, love, health, family, social, travel และ caution

คะแนนทุก delta/base/clamp/normalization/tie-break ต้องอยู่ใน published rule Unknown time ต้องตัด contribution ที่พึ่งเรือนแล้ว normalize ด้วยน้ำหนักที่เหลือ Coverage ต่ำให้ `insufficient_data`

## สี

ผลต้องระบุ color id, palette, domain, supportive/neutral/avoid, rule ids, confidence และ validity window ห้ามรับประกันเงิน ความรัก สุขภาพ หรือความปลอดภัย

## วันดี–วันควรระวัง

แยกคะแนนตามกิจกรรม ห้ามใช้คะแนนภาพรวมแทนทุกกิจกรรม ใช้ band `supportive`, `mixed`, `caution`, `insufficient_data` แทนคำฟันธง

## กราฟชีวิต

กราฟเป็น time-series จาก rule engine ต้องระบุ sampling interval, smoothing, normalization และ missing-data behavior ห้ามสุ่มคลื่นหรือสร้างคะแนนเพื่อความสวย

## สมพงษ์ 5 มิติ

Facts: inter-chart aspects, sign/element relationships, house overlays เมื่อมีเวลา และ lordship ตาม tradition ชื่อมิติต้องเป็น catalog ของ Horathai

Unknown time ต้องตัด house overlays และ angular contacts ห้ามฟันธงคู่แท้ เลิกกัน หรือนอกใจ

## ฮวงจุ้ยและคำแนะนำ

Feng shui ต้องมีทิศทาง แผนผัง พิกัด และช่วงอาคาร ข้อมูลไม่ครบให้ insufficient data

Remedy ต้องผูก matched rule, evidence grade, cost band และ safety flags ห้ามแนะนำงานโครงสร้าง ไฟฟ้า แก๊ส การแพทย์ หรือกดดันซื้อวัตถุมงคล

## สิ่งที่ยังเป็น observed-only

- สูตร Barcode ของคู่แข่ง
- สูตรที่ทำให้กรณีชัยภูมิได้ลัคนาธนู
- mapping 0–9 เฉพาะคู่แข่ง
- สูตรคู่เลข คะแนนรายวัน สี กราฟชีวิต สมพงษ์ และคำแนะนำของคู่แข่ง
- ข้อความ Premium ทั้งหมด

Observation ใช้สร้าง hypothesis และ comparison fixture เท่านั้น `reusable_as_rule=false`

## Publish gates

Calculation fixtures, deterministic tests, unknown-time tests, citation coverage, rights clearance, expert review, conflict handling, load test แบบ AI/network=0, safety copy และ sentence lineage ต้องผ่านครบก่อนเปิด Production

