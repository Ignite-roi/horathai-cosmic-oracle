import { HOUSES, ZODIACS } from "./astro";
import type { ChartHouse, ChartPlanet, PlanetStandard } from "./astrology-engine.server";

export type InterpretationSection = { title: string; fact: string; interpretation: string };

const ELEMENT_WORDS = {
  ไฟ: "มุ่งมั่น กล้าริเริ่ม และขับเคลื่อนชีวิตด้วยแรงบันดาลใจ",
  ดิน: "สุขุม เป็นระบบ และให้คุณค่ากับสิ่งที่สร้างผลได้จริง",
  ลม: "เรียนรู้เร็ว สื่อสารเก่ง และเติบโตผ่านความคิดใหม่",
  น้ำ: "รับรู้อารมณ์ละเอียด ปรับตัวเก่ง และผูกพันกับความหมายภายใน",
} as const;

export function buildNatalInterpretations(
  planets: ChartPlanet[],
  houses: ChartHouse[],
  standards: PlanetStandard[],
  ascendantSign?: string,
): InterpretationSection[] {
  const ascZodiac = ZODIACS.find((z) => z.th === ascendantSign);
  const strong = standards.filter((s) => s.standard === "เกษตร" || s.standard === "อุจจ์");
  const cautions = standards.filter((s) => s.standard === "นิจ");
  const dominant = [...planets].sort((a, b) => b.strength - a.strength)[0];
  const occupied = [...houses].sort((a, b) => b.planets.length - a.planets.length)[0];
  const elementCounts = ZODIACS.reduce<Record<string, number>>((acc, sign) => {
    acc[sign.element] = planets.filter((p) => p.signId === sign.id).length + (acc[sign.element] ?? 0);
    return acc;
  }, {});
  const leadElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as keyof typeof ELEMENT_WORDS | undefined;

  return [
    {
      title: "ภาพรวมตัวตน",
      fact: ascendantSign ? `ลัคนาสถิตราศี${ascendantSign}` : "ไม่ทราบเวลาเกิด จึงไม่กำหนดลัคนา",
      interpretation: ascZodiac ? ELEMENT_WORDS[ascZodiac.element] : "อ่านภาพรวมจากตำแหน่งดาวโดยไม่สรุปลัคนา",
    },
    {
      title: "จุดเด่น",
      fact: strong.length ? strong.map((s) => `${s.th}ได้มาตรฐาน${s.standard}`).join(" · ") : "ไม่พบดาวเกษตรหรืออุจจ์ในชุดกฎปัจจุบัน",
      interpretation: strong.length ? "ดาวที่ได้มาตรฐานเป็นกำลังที่นำมาใช้ได้ชัด เมื่อพัฒนาอย่างมีสติ" : "ศักยภาพกระจายตัว ควรพิจารณาหลายภพร่วมกัน",
    },
    {
      title: "สิ่งที่ควรระวัง",
      fact: cautions.length ? cautions.map((s) => `${s.th}เป็นนิจ`).join(" · ") : "ไม่พบดาวนิจในชุดกฎปัจจุบัน",
      interpretation: cautions.length ? "เป็นพื้นที่ให้ทบทวนและฝึกฝน ไม่ใช่คำตัดสินตายตัว" : "ยังควรพิจารณาดาวพักร์และบริบทชีวิตจริงประกอบ",
    },
    {
      title: "พลังของลัคนา",
      fact: ascZodiac ? `ราศี${ascZodiac.th} · ธาตุ${ascZodiac.element}` : "ลัคนายังไม่ทราบ",
      interpretation: ascZodiac ? ELEMENT_WORDS[ascZodiac.element] : "เพิ่มเวลาเกิดที่แม่นยำเพื่ออ่านภพและบุคลิกจากลัคนา",
    },
    {
      title: "ดาวเด่นในดวง",
      fact: dominant ? `${dominant.th} ราศี${dominant.signTh} ภพ ${dominant.house}` : "ไม่มีข้อมูล",
      interpretation: dominant ? `${dominant.th}เชื่อมโยงกับ${dominant.meaning} จึงเป็นหัวข้อที่ควรสังเกตในชีวิต` : "—",
    },
    {
      title: "ภพสำคัญ",
      fact: occupied ? `${occupied.th} มีดาว ${occupied.planets.length} ดวง` : "ไม่มีภพที่มีดาวเด่นชัด",
      interpretation: occupied ? `เรื่อง${HOUSES[occupied.n - 1]?.about ?? occupied.about}มีแนวโน้มเป็นเวทีสำคัญของประสบการณ์` : "อ่านจากเจ้าเรือนและดาวจรร่วมด้วย",
    },
    {
      title: "สมดุลธาตุ",
      fact: leadElement ? `ธาตุ${leadElement}ปรากฏมากที่สุด (${elementCounts[leadElement]} ดวง)` : "ไม่มีข้อมูล",
      interpretation: leadElement ? ELEMENT_WORDS[leadElement] : "—",
    },
  ];
}