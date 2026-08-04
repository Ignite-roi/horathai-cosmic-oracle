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
  packages: [],
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