import { OWNER_REVIEW_BIRTH } from "@/config/public-review";
import { calculateNatal } from "@/lib/astrology-engine.server";
import { computeChart, buildReading } from "@/lib/ephemeris.server";
import { findProvince } from "@/lib/provinces";
import { zonedWallClockToUtc } from "@/lib/timezone";

export async function calculatePublicReviewChart() {
  const place = findProvince(OWNER_REVIEW_BIRTH.province);
  return calculateNatal({
    birthDate: OWNER_REVIEW_BIRTH.birthDate,
    birthTime: OWNER_REVIEW_BIRTH.birthTime,
    birthTimeKnown: OWNER_REVIEW_BIRTH.birthTimeKnown,
    latitude: place.lat,
    longitude: place.lon,
    timezone: OWNER_REVIEW_BIRTH.timezone,
  });
}

export function calculatePublicReviewReading(at?: string) {
  const place = findProvince(OWNER_REVIEW_BIRTH.province);
  const birth = zonedWallClockToUtc(
    OWNER_REVIEW_BIRTH.birthDate,
    OWNER_REVIEW_BIRTH.birthTime,
    OWNER_REVIEW_BIRTH.timezone,
  );
  const transitAt = at ? new Date(at) : new Date();
  if (Number.isNaN(transitAt.getTime())) throw new Error("วันที่ดาวจรไม่ถูกต้อง");
  return buildReading(
    computeChart(birth, place.lat, place.lon),
    computeChart(transitAt, place.lat, place.lon),
  );
}