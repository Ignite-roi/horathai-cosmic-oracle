import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BirthInput = z.object({
  birthDate: z.string().min(4),
  birthTime: z.string().default("12:00"),
  province: z.string().default("กรุงเทพมหานคร"),
  timezone: z.string().default("Asia/Bangkok"),
  /** ISO timestamp to evaluate transits at; defaults to now */
  at: z.string().optional(),
});

export const getReading = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BirthInput.parse(input))
  .handler(async ({ data }) => {
    const { computeChart, buildReading } = await import("./ephemeris.server");
    const { findProvince } = await import("./provinces");

    const { zonedWallClockToUtc } = await import("./timezone");
    const place = findProvince(data.province);
    // Real zone offset for the birth instant, not a fixed assumption.
    const birth = zonedWallClockToUtc(
      data.birthDate,
      (data.birthTime || "12:00").slice(0, 5),
      data.timezone,
    );
    const when = data.at ? new Date(data.at) : new Date();
    if (Number.isNaN(birth.getTime())) throw new Error("รูปแบบวันเกิดไม่ถูกต้อง");

    const natal = computeChart(birth, place.lat, place.lon);
    const transit = computeChart(when, place.lat, place.lon);
    return buildReading(natal, transit);
  });

export const getSkyNow = createServerFn({ method: "GET" }).handler(async () => {
  const { computeChart } = await import("./ephemeris.server");
  return computeChart(new Date(), 13.75, 100.5);
});
