import { describe, expect, it } from "vitest";

import { canAdvanceVersion, isCitationComplete, productionEligibleRules, shouldUseDemoReading, sourceAllowsFulltext, type GovernedRule } from "./kb-governance";

const citedPublishedRule: GovernedRule = {
  id: "rule-1", status: "published", conditions: {}, outcomeSummary: "safe", copyrightSafeWording: "ข้อความสรุปที่ผ่านการตรวจ", confidence: 0.8, conflictOpen: false,
  citations: [{ sourceId: "source-1", sourceTitle: "ตำรา", author: "ผู้แต่ง", locator: "หน้า 12", ruleId: "rule-1", ruleVersion: 1 }],
};

describe("knowledge governance", () => {
  it("prevents unpublished rules from production use", () => {
    expect(productionEligibleRules([{ ...citedPublishedRule, status: "expert_reviewed" }])).toEqual([]);
  });
  it("requires complete citations", () => {
    const citation = citedPublishedRule.citations[0];
    if (!citation) throw new Error("test citation missing");
    expect(isCitationComplete({ ...citation, locator: "" })).toBe(false);
    expect(productionEligibleRules([{ ...citedPublishedRule, citations: [] }])).toEqual([]);
  });
  it("isolates unresolved conflicts", () => {
    expect(productionEligibleRules([{ ...citedPublishedRule, conflictOpen: true }])).toEqual([]);
  });
  it("enforces unverified source rights", () => {
    expect(sourceAllowsFulltext({ fulltextStorageAllowed: false, copyrightStatus: "RIGHTS_UNVERIFIED_USER_SUPPLIED" })).toBe(false);
  });
  it("preserves monotonic version history", () => {
    expect(canAdvanceVersion(2, 3)).toBe(true);
    expect(canAdvanceVersion(2, 4)).toBe(false);
  });
  it("never overlays demo data on a saved chart", () => {
    expect(shouldUseDemoReading(true, true)).toBe(false);
    expect(shouldUseDemoReading(false, true)).toBe(false);
    expect(shouldUseDemoReading(false, false)).toBe(true);
  });
});