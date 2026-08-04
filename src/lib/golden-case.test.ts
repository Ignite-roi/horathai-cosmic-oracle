import { describe, expect, it } from "vitest";

import { calculateNatal } from "./astrology-engine.server";
import { GOLDEN_CHAIYAPHUM_24H, GOLDEN_CHAIYAPHUM_MIDNIGHT, goldenCaseUtc, normalizeCivil24Hour } from "./golden-case";

describe("golden Chaiyaphum civil time", () => {
  it("normalizes end-of-day 24:00 to next-day midnight", () => {
    expect(normalizeCivil24Hour("1988-05-05", "24:00")).toEqual({ date: "1988-05-06", time: "00:00" });
    expect(goldenCaseUtc()).toBe("1988-05-05T17:00:00.000Z");
  });
  it("does not invent unbenchmarked astronomy outputs", () => {
    expect(GOLDEN_CHAIYAPHUM_24H.calculationStatus).toBe("calculation_pending");
    expect(GOLDEN_CHAIYAPHUM_24H.activatedRuleIds).toEqual([]);
  });
  it("matches the independent Lahiri ascendant fixture", async () => {
    const result = await calculateNatal(GOLDEN_CHAIYAPHUM_MIDNIGHT.input);
    expect(result.utcBirthDatetime).toBe(GOLDEN_CHAIYAPHUM_MIDNIGHT.expectedUtc);
    expect(result.ascendant?.signTh).toBe(GOLDEN_CHAIYAPHUM_MIDNIGHT.expectedSign);
    expect(result.ascendant?.degree).toBe(GOLDEN_CHAIYAPHUM_MIDNIGHT.expectedDegree);
    expect(result.ascendant?.minute).toBe(GOLDEN_CHAIYAPHUM_MIDNIGHT.expectedMinute);
    expect(Math.abs((result.ascendant?.siderealLongitude ?? 0) - GOLDEN_CHAIYAPHUM_MIDNIGHT.expectedSiderealAscendant)).toBeLessThan(GOLDEN_CHAIYAPHUM_MIDNIGHT.toleranceDegrees);
  });
});