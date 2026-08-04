/** Client-safe astrology constants, types and formatters (no calculations). */

export type Zodiac = {
  id: number;
  th: string;
  en: string;
  symbol: string;
  element: "ไฟ" | "ดิน" | "ลม" | "น้ำ";
  lord: number;
};

export const ZODIACS: Zodiac[] = [
  { id: 1, th: "เมษ", en: "Aries", symbol: "♈", element: "ไฟ", lord: 3 },
  { id: 2, th: "พฤษภ", en: "Taurus", symbol: "♉", element: "ดิน", lord: 6 },
  { id: 3, th: "เมถุน", en: "Gemini", symbol: "♊", element: "ลม", lord: 4 },
  { id: 4, th: "กรกฎ", en: "Cancer", symbol: "♋", element: "น้ำ", lord: 2 },
  { id: 5, th: "สิงห์", en: "Leo", symbol: "♌", element: "ไฟ", lord: 1 },
  { id: 6, th: "กันย์", en: "Virgo", symbol: "♍", element: "ดิน", lord: 4 },
  { id: 7, th: "ตุลย์", en: "Libra", symbol: "♎", element: "ลม", lord: 6 },
  { id: 8, th: "พิจิก", en: "Scorpio", symbol: "♏", element: "น้ำ", lord: 3 },
  { id: 9, th: "ธนู", en: "Sagittarius", symbol: "♐", element: "ไฟ", lord: 5 },
  { id: 10, th: "มังกร", en: "Capricorn", symbol: "♑", element: "ดิน", lord: 7 },
  { id: 11, th: "กุมภ์", en: "Aquarius", symbol: "♒", element: "ลม", lord: 7 },
  { id: 12, th: "มีน", en: "Pisces", symbol: "♓", element: "น้ำ", lord: 5 },
];

export type PlanetId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Planet = {
  num: PlanetId;
  th: string;
  thaiNumeral: string;
  code: string;
  color: string;
  meaning: string;
  influence: string;
  /** relative orbital radius used by the 3D solar system */
  orbit: number;
  size: number;
};

/** ดาวพระเคราะห์ที่ใช้กับโมเดล Lahiri แบบมีเวอร์ชันและให้ผลซ้ำได้ */
export const PLANETS: Planet[] = [
  {
    num: 1,
    th: "อาทิตย์",
    thaiNumeral: "๑",
    code: "Su",
    color: "#ffc95e",
    meaning: "อำนาจ บารมี ตัวตน",
    influence: "ชื่อเสียงและการยอมรับ",
    orbit: 1.05,
    size: 0.17,
  },
  {
    num: 2,
    th: "จันทร์",
    thaiNumeral: "๒",
    code: "Mo",
    color: "#cfe3ff",
    meaning: "จิตใจ อารมณ์ มารดา",
    influence: "ความรู้สึกและผู้ใหญ่ผู้หญิง",
    orbit: 1.38,
    size: 0.13,
  },
  {
    num: 3,
    th: "อังคาร",
    thaiNumeral: "๓",
    code: "Ma",
    color: "#ff7d5c",
    meaning: "พลัง การต่อสู้ แข่งขัน",
    influence: "ความกล้าและอุบัติเหตุ",
    orbit: 1.72,
    size: 0.12,
  },
  {
    num: 4,
    th: "พุธ",
    thaiNumeral: "๔",
    code: "Me",
    color: "#7ef0c2",
    meaning: "การสื่อสาร การค้า",
    influence: "เจรจา ติดต่อ ปัญญาไว",
    orbit: 2.05,
    size: 0.11,
  },
  {
    num: 5,
    th: "พฤหัสบดี",
    thaiNumeral: "๕",
    code: "Ju",
    color: "#ffd89b",
    meaning: "ครูบาอาจารย์ โชคลาภ",
    influence: "ผู้ใหญ่อุปถัมภ์และความมั่งคั่ง",
    orbit: 2.38,
    size: 0.16,
  },
  {
    num: 6,
    th: "ศุกร์",
    thaiNumeral: "๖",
    code: "Ve",
    color: "#ffb0e2",
    meaning: "ความรัก ศิลปะ เสน่ห์",
    influence: "คู่ครองและรสนิยม",
    orbit: 2.7,
    size: 0.13,
  },
  {
    num: 7,
    th: "เสาร์",
    thaiNumeral: "๗",
    code: "Sa",
    color: "#a79fdd",
    meaning: "อุปสรรค ความอดทน",
    influence: "บททดสอบและวินัย",
    orbit: 3.02,
    size: 0.15,
  },
  {
    num: 8,
    th: "ราหู",
    thaiNumeral: "๘",
    code: "Ra",
    color: "#9b6bff",
    meaning: "การเปลี่ยนแปลงฉับพลัน",
    influence: "โชคลาภแบบพลิกผัน",
    orbit: 3.34,
    size: 0.12,
  },
  {
    num: 9,
    th: "เกตุ",
    thaiNumeral: "๙",
    code: "Ke",
    color: "#6fe4ff",
    meaning: "โชคลี้ลับ จิตวิญญาณ",
    influence: "สิ่งศักดิ์สิทธิ์คุ้มครอง",
    orbit: 3.62,
    size: 0.1,
  },
];

export const PLANET_BY_NUM = new Map(PLANETS.map((p) => [p.num, p]));

export const HOUSES = [
  { n: 1, th: "ภพตนุ", about: "ตัวตน บุคลิก ร่างกาย" },
  { n: 2, th: "ภพกดุมภะ", about: "ทรัพย์สิน รายได้" },
  { n: 3, th: "ภพสหัชชะ", about: "มิตรสหาย ความพยายาม" },
  { n: 4, th: "ภพพันธุ", about: "ที่อยู่ ครอบครัว" },
  { n: 5, th: "ภพปุตตะ", about: "บุตร ความคิดสร้างสรรค์" },
  { n: 6, th: "ภพอริ", about: "ศัตรู โรคภัย หนี้สิน" },
  { n: 7, th: "ภพปัตนิ", about: "คู่ครอง หุ้นส่วน" },
  { n: 8, th: "ภพมรณะ", about: "การเปลี่ยนผ่าน ความลับ" },
  { n: 9, th: "ภพศุภะ", about: "โชคลาภ ศาสนา การเดินทางไกล" },
  { n: 10, th: "ภพกัมมะ", about: "การงาน เกียรติยศ" },
  { n: 11, th: "ภพลาภะ", about: "ลาภผล ความสำเร็จ" },
  { n: 12, th: "ภพวินาศ", about: "การสูญเสีย ความสงบภายใน" },
] as const;

export type LifeArea = "career" | "money" | "love" | "health" | "family" | "partner";

export const LIFE_AREAS: { id: LifeArea; th: string; icon: string }[] = [
  { id: "career", th: "การงาน", icon: "briefcase" },
  { id: "money", th: "การเงิน", icon: "coins" },
  { id: "love", th: "ความรัก", icon: "heart" },
  { id: "health", th: "สุขภาพ", icon: "activity" },
  { id: "family", th: "ครอบครัว", icon: "home" },
  { id: "partner", th: "คู่ครอง", icon: "users" },
];

export type PlacedPlanet = {
  num: PlanetId;
  th: string;
  thaiNumeral: string;
  color: string;
  meaning: string;
  influence: string;
  orbit: number;
  size: number;
  /** sidereal (นิรายนะ) ecliptic longitude 0-360 */
  longitude: number;
  signId: number;
  signTh: string;
  signSymbol: string;
  element: Zodiac["element"];
  /** degrees within sign */
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
  /** 0-1 relative strength used for glow intensity */
  strength: number;
};

export type AspectKind = "conjunction" | "trine" | "square" | "opposition" | "sextile";

export type Aspect = {
  a: PlanetId;
  b: PlanetId;
  kind: AspectKind;
  angle: number;
  orb: number;
  benefic: boolean;
};

export const ASPECT_LABEL: Record<AspectKind, string> = {
  conjunction: "กุม",
  trine: "ตรีโกณ",
  square: "เล็ง ๙๐°",
  opposition: "เล็ง",
  sextile: "โยค ๖๐°",
};

export type AreaScore = {
  area: LifeArea;
  th: string;
  score: number;
  reasons: string[];
};

export type ChartResult = {
  planets: PlacedPlanet[];
  aspects: Aspect[];
  ascendant: { longitude: number; signId: number; signTh: string; degree: number };
  moonPhase: number;
  ayanamsa: number;
  julianDay: number;
  isoDate: string;
  engine: string;
  calculationVersion: string;
  ephemerisSource: string;
  ayanamsaName: string;
  houseSystem: string;
};

export type ReadingResult = {
  natal: ChartResult;
  transit: ChartResult;
  scores: AreaScore[];
  overall: number;
  highlights: { title: string; body: string; tone: "good" | "watch" | "neutral" }[];
  provenance: {
    engine: string;
    calculationVersion: string;
    ephemerisSource: string;
    ayanamsaName: string;
    houseSystem: string;
    natalInstant: string;
    transitInstant: string;
  };
};

/* ---------- formatters ---------- */

const THAI_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];

export function toThaiDigits(n: number | string) {
  return String(n).replace(/\d/g, (d) => THAI_DIGITS[Number(d)]!);
}

export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function thaiDate(d = new Date()) {
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function formatDegree(p: { degree: number; minute: number }) {
  return `${p.degree}°${String(p.minute).padStart(2, "0")}'`;
}

export function moonPhaseLabel(phase: number) {
  if (phase < 0.03 || phase > 0.97) return "จันทร์ดับ";
  if (phase < 0.22) return "ข้างขึ้นอ่อน";
  if (phase < 0.28) return "กึ่งดวงข้างขึ้น";
  if (phase < 0.47) return "ข้างขึ้นแก่";
  if (phase < 0.53) return "จันทร์เพ็ญ";
  if (phase < 0.72) return "ข้างแรมอ่อน";
  if (phase < 0.78) return "กึ่งดวงข้างแรม";
  return "ข้างแรมแก่";
}
