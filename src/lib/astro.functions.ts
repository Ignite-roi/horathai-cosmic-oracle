import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import { PublicReadingInput } from "./astro.schemas";

export const getReading = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PublicReadingInput.parse(input))
  .handler(async ({ data }) => {
    const { assertPublicRateLimit } = await import("./public-rate-limit.server");
    assertPublicRateLimit("public-reading", getRequestIP({ xForwardedFor: true }) ?? "unknown", 30);
    const { computeChart, buildReading } = await import("./ephemeris.server");
    const { findProvince } = await import("./provinces");

    const { zonedWallClockToUtc } = await import("./timezone");
    const place = findProvince(data.province);
    if (!place) throw new Error("ไม่พบจังหวัดที่เลือก");
    // Real zone offset for the birth instant, not a fixed assumption.
    const birth = zonedWallClockToUtc(
      data.birthDate,
      (data.birthTime || "12:00").slice(0, 5),
      data.timezone,
    );
    const when = data.at ? new Date(data.at) : new Date();
    if (Number.isNaN(birth.getTime())) throw new Error("รูปแบบวันเกิดไม่ถูกต้อง");
    if (Number.isNaN(when.getTime())) throw new Error("วันที่ดาวจรไม่ถูกต้อง");
    if (birth.getTime() > Date.now()) throw new Error("วันเกิดต้องไม่เป็นวันในอนาคต");
    if (birth.getUTCFullYear() < 1900) throw new Error("ปีเกิดต้องไม่เก่ากว่า พ.ศ. ๒๔๔๓");

    const natal = computeChart(birth, place.lat, place.lon);
    const transit = computeChart(when, place.lat, place.lon);
    return buildReading(natal, transit);
  });

export const getSkyNow = createServerFn({ method: "GET" }).handler(async () => {
  const { computeChart } = await import("./ephemeris.server");
  return computeChart(new Date(), 13.75, 100.5);
});
