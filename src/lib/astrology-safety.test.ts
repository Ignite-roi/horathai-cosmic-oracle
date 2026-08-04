import { describe, expect, it } from "vitest";

import { calculateNatal } from "./astrology-engine.server";

describe("unknown birth time", () => {
  it("does not fabricate an ascendant or houses", async () => {
    const result = await calculateNatal({ birthDate: "1988-05-06", birthTime: "12:00", birthTimeKnown: false, latitude: 15.8068, longitude: 102.0315, timezone: "Asia/Bangkok" });
    expect(result.ascendantKnown).toBe(false);
    expect(result.ascendant).toBeNull();
    expect(result.houses).toEqual([]);
  });
});