import { describe, expect, it } from "vitest";

import { GOLDEN_CHAIYAPHUM_24H, goldenCaseUtc, normalizeCivil24Hour } from "./golden-case";

describe("golden Chaiyaphum civil time", () => {
  it("normalizes end-of-day 24:00 to next-day midnight", () => {
    expect(normalizeCivil24Hour("1988-05-05", "24:00")).toEqual({ date: "1988-05-06", time: "00:00" });
    expect(goldenCaseUtc()).toBe("1988-05-05T17:00:00.000Z");
  });
  it("does not invent unbenchmarked astronomy outputs", () => {
    expect(GOLDEN_CHAIYAPHUM_24H.calculationStatus).toBe("calculation_pending");
    expect(GOLDEN_CHAIYAPHUM_24H.activatedRuleIds).toEqual([]);
  });
});