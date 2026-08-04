export const PUBLIC_REVIEW_MODE = true;

export const OWNER_REVIEW_BIRTH = Object.freeze({
  label: "ดวงตัวอย่างของเจ้าของระบบ",
  birthDate: "1988-05-05",
  birthTime: "00:00",
  birthTimeKnown: true,
  province: "ชัยภูมิ",
  country: "ประเทศไทย",
  timezone: "Asia/Bangkok",
});

export const PUBLIC_REVIEW_ROUTES = [
  "/onboarding",
  "/dashboard",
  "/birth-chart",
  "/transits",
  "/ai-astrologer",
  "/premium",
  "/wallet",
  "/invite",
  "/settings",
] as const;

export function isPublicReviewRoute(pathname: string) {
  return PUBLIC_REVIEW_MODE && PUBLIC_REVIEW_ROUTES.some((route) => pathname === route);
}
