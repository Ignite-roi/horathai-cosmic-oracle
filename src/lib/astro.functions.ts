import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BirthInput = z.object({
  birthDate: z.string().min(4),
  birthTime: z.string().default("12:00"),
  province: z.string().default("กรุงเทพมหานคร"),
  /** ISO timestamp to evaluate transits at; defaults to now */
  at: z.string().optional(),
});

export const getReading = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BirthInput.parse(input))
  .handler(async ({ data }) => {
    const { computeChart, buildReading } = await import("./ephemeris.server");
    const { findProvince } = await import("./provinces");

    const place = findProvince(data.province);
    // Thai local time is UTC+7
    const birth = new Date(`${data.birthDate}T${data.birthTime || "12:00"}:00+07:00`);
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
