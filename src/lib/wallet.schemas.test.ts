import { describe, expect, it } from "vitest";

import { MockCheckoutInput } from "@/lib/wallet.schemas";

describe("mock checkout input boundary", () => {
  it("accepts only package code and points", () => {
    expect(MockCheckoutInput.parse({ packageCode: "orbit_30", pointsToUse: 20 })).toEqual({
      packageCode: "orbit_30",
      pointsToUse: 20,
    });
  });

  it.each([
    { userId: "00000000-0000-0000-0000-000000000000" },
    { price: 1 },
    { days: 999999 },
    { payableAmount: 0 },
  ])("rejects privileged client fields: %o", (injected) => {
    expect(() =>
      MockCheckoutInput.parse({ packageCode: "orbit_30", pointsToUse: 0, ...injected }),
    ).toThrow();
  });

  it.each([
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
  ])("rejects ownership tampering for user %s", (userId) => {
    expect(() =>
      MockCheckoutInput.parse({ packageCode: "orbit_30", pointsToUse: 0, userId }),
    ).toThrow();
  });
});
