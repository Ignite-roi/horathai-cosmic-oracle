import type { GuestBirthContext, GuestBirthInput } from "./guest-birth";
import { calculateNatal } from "./astrology-engine.server";
import { findProvince } from "./provinces";
import { zonedWallClockToUtc } from "./timezone";

export async function calculateGuestBirthChartOnServer(
  input: GuestBirthInput,
): Promise<GuestBirthContext> {
  const place = findProvince(input.province);
  if (!place) throw new Error(`ไม่พบพิกัดของจังหวัด "${input.province}" กรุณาเลือกจากรายการ`);

  const timezone = "Asia/Bangkok";
  const time = input.birth_time_known ? (input.birth_time ?? "12:00") : "12:00";
  const birthMoment = zonedWallClockToUtc(input.birth_date, time, timezone);
  if (birthMoment.getTime() > Date.now()) throw new Error("วันเกิดต้องไม่เป็นวันในอนาคต");
  if (birthMoment.getUTCFullYear() < 1900) throw new Error("ปีเกิดต้องไม่เก่ากว่า พ.ศ. ๒๔๔๓");

  const result = await calculateNatal({
    birthDate: input.birth_date,
    birthTime: time,
    birthTimeKnown: input.birth_time_known,
    latitude: place.lat,
    longitude: place.lon,
    timezone,
  });
  const now = new Date().toISOString();

  return {
    temporary: true,
    birthProfile: {
      id: "guest-temporary",
      nickname: input.nickname,
      birth_date: input.birth_date,
      birth_time: input.birth_time_known ? time : null,
      birth_time_known: input.birth_time_known,
      country: input.country,
      province: input.province,
      district: input.district?.trim() || null,
      latitude: place.lat,
      longitude: place.lon,
      timezone,
      calculation_system: result.engine,
    },
    chart: {
      id: "guest-temporary",
      ascendant_sign: result.ascendant?.signTh ?? "",
      ascendant_degree: result.ascendant?.siderealLongitude ?? 0,
      planets_json: result.planets,
      houses_json: result.houses,
      standards_json: result.standards,
      calculation_version: result.calculationVersion,
      calculated_at: now,
      ascendant_json: result.ascendant ?? {},
      ascendant_known: result.ascendantKnown,
      utc_birth_datetime: result.utcBirthDatetime,
      timezone: result.timezone,
      latitude: result.latitude,
      longitude: result.longitude,
      house_system: result.houseSystem,
      ayanamsa: result.ayanamsa,
      engine_type: result.engine,
      input_hash: null,
    },
  };
}