export type WalletPackage = {
  code: string;
  name_th: string;
  days: number;
  price_thb: number;
  bonus_days: number;
  is_popular: boolean;
  sort_order: number;
};

export type CreditTransaction = {
  id: string;
  type: "purchase" | "referral" | "transfer_in" | "transfer_out" | "bonus" | "admin";
  days: number;
  points_used: number;
  note: string | null;
  created_at: string;
};

export type WalletData = {
  daysRemaining: number;
  expiresAt: string | null;
  points: number;
  referralCode: string | null;
  transactions: CreditTransaction[];
  packages: WalletPackage[];
};

export const EMPTY_WALLET: WalletData = {
  daysRemaining: 0,
  expiresAt: null,
  points: 0,
  referralCode: null,
  transactions: [],
  packages: [
    { code: "starlight_7", name_th: "แสงดาว 7 วัน", days: 7, price_thb: 79, bonus_days: 0, is_popular: false, sort_order: 10 },
    { code: "orbit_30", name_th: "วงโคจร 30 วัน", days: 30, price_thb: 249, bonus_days: 3, is_popular: false, sort_order: 20 },
    { code: "cosmos_90", name_th: "จักรวาล 90 วัน", days: 90, price_thb: 599, bonus_days: 15, is_popular: true, sort_order: 30 },
    { code: "eternity_365", name_th: "นิรันดร์ 365 วัน", days: 365, price_thb: 1790, bonus_days: 60, is_popular: false, sort_order: 40 },
  ],
};

export function formatThaiBuddhistDate(value: string | null) {
  if (!value) return "ยังไม่มีวันหมดอายุ";
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function transactionLabel(type: CreditTransaction["type"]) {
  return {
    purchase: "เติมวันใช้งาน",
    referral: "รางวัลแนะนำเพื่อน",
    transfer_in: "รับโอนวัน",
    transfer_out: "โอนวันออก",
    bonus: "โบนัส",
    admin: "ปรับยอดโดยระบบ",
  }[type];
}

export function packageTotalDays(item: WalletPackage) {
  return item.days + item.bonus_days;
}

export function pricePerDay(item: WalletPackage) {
  return item.price_thb / packageTotalDays(item);
}