export type Zodiac = {
  id: number;
  th: string;
  en: string;
  symbol: string;
  element: "ไฟ" | "ดิน" | "ลม" | "น้ำ";
};

export const ZODIACS: Zodiac[] = [
  { id: 1, th: "เมษ", en: "Aries", symbol: "♈", element: "ไฟ" },
  { id: 2, th: "พฤษภ", en: "Taurus", symbol: "♉", element: "ดิน" },
  { id: 3, th: "เมถุน", en: "Gemini", symbol: "♊", element: "ลม" },
  { id: 4, th: "กรกฎ", en: "Cancer", symbol: "♋", element: "น้ำ" },
  { id: 5, th: "สิงห์", en: "Leo", symbol: "♌", element: "ไฟ" },
  { id: 6, th: "กันย์", en: "Virgo", symbol: "♍", element: "ดิน" },
  { id: 7, th: "ตุลย์", en: "Libra", symbol: "♎", element: "ลม" },
  { id: 8, th: "พิจิก", en: "Scorpio", symbol: "♏", element: "น้ำ" },
  { id: 9, th: "ธนู", en: "Sagittarius", symbol: "♐", element: "ไฟ" },
  { id: 10, th: "มังกร", en: "Capricorn", symbol: "♑", element: "ดิน" },
  { id: 11, th: "กุมภ์", en: "Aquarius", symbol: "♒", element: "ลม" },
  { id: 12, th: "มีน", en: "Pisces", symbol: "♓", element: "น้ำ" },
];

export type Planet = {
  num: number;
  th: string;
  code: string;
  color: string;
  meaning: string;
  influence: string;
};

/** ดาวพระเคราะห์ตามหลักโหราศาสตร์ไทย (สุริยยาตร์) */
export const PLANETS: Planet[] = [
  { num: 1, th: "อาทิตย์", code: "Su", color: "#ffcf6b", meaning: "อำนาจ บารมี ตัวตน", influence: "ชื่อเสียงและการยอมรับ" },
  { num: 2, th: "จันทร์", code: "Mo", color: "#cfe3ff", meaning: "จิตใจ อารมณ์ มารดา", influence: "ความรู้สึกและผู้ใหญ่ผู้หญิง" },
  { num: 3, th: "อังคาร", code: "Ma", color: "#ff8a6b", meaning: "พลัง การต่อสู้ แข่งขัน", influence: "ความกล้าและอุบัติเหตุ" },
  { num: 4, th: "พุธ", code: "Me", color: "#8ef0c9", meaning: "การสื่อสาร การค้า", influence: "เจรจา ติดต่อ ปัญญาไว" },
  { num: 5, th: "พฤหัสบดี", code: "Ju", color: "#ffd89b", meaning: "ครูบาอาจารย์ โชคลาภ", influence: "ผู้ใหญ่อุปถัมภ์และความมั่งคั่ง" },
  { num: 6, th: "ศุกร์", code: "Ve", color: "#ffb3e6", meaning: "ความรัก ศิลปะ เสน่ห์", influence: "คู่ครองและรสนิยม" },
  { num: 7, th: "เสาร์", code: "Sa", color: "#a9a4d6", meaning: "อุปสรรค ความอดทน", influence: "บททดสอบและวินัย" },
  { num: 8, th: "ราหู", code: "Ra", color: "#9b6bff", meaning: "การเปลี่ยนแปลงฉับพลัน", influence: "โชคลาภแบบพลิกผัน" },
  { num: 9, th: "เกตุ", code: "Ke", color: "#7ee8ff", meaning: "โชคลี้ลับ จิตวิญญาณ", influence: "สิ่งศักดิ์สิทธิ์คุ้มครอง" },
];

export const HOUSES = [
  "ภพตนุ",
  "ภพกดุมภะ",
  "ภพสหัชชะ",
  "ภพพันธุ",
  "ภพปุตตะ",
  "ภพอริ",
  "ภพปัตนิ",
  "ภพมรณะ",
  "ภพศุภะ",
  "ภพกัมมะ",
  "ภพลาภะ",
  "ภพวินาศ",
];

/** Deterministic pseudo-random from a seed string (stable across SSR/CSR). */
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Scores = { money: number; love: number; career: number; health: number; overall: number };

export function dailyScores(seedKey: string): Scores {
  const rnd = seededRandom(seedKey + new Date().toDateString());
  const money = 55 + Math.floor(rnd() * 45);
  const love = 55 + Math.floor(rnd() * 45);
  const career = 55 + Math.floor(rnd() * 45);
  const health = 55 + Math.floor(rnd() * 45);
  return { money, love, career, health, overall: Math.round((money + love + career + health) / 4) };
}

export type PlacedPlanet = Planet & { sign: Zodiac; house: number; degree: number };

export function buildChart(seedKey: string): PlacedPlanet[] {
  const rnd = seededRandom("chart:" + seedKey);
  return PLANETS.map((p) => {
    const signIndex = Math.floor(rnd() * 12);
    return {
      ...p,
      sign: ZODIACS[signIndex]!,
      house: 1 + Math.floor(rnd() * 12),
      degree: Math.round(rnd() * 29 * 10) / 10,
    };
  });
}

export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function thaiToday() {
  const d = new Date();
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}