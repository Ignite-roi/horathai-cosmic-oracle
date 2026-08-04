import { describe, expect, it } from "vitest";

import { evaluateMockCheckoutAccess } from "@/lib/mock-checkout.server";

describe("mock checkout server allowlist", () => {
  it("fails closed when configuration is absent", () => {
    expect(evaluateMockCheckoutAccess({}, "thaihora.app")).toEqual({
      allowed: false,
      reason: "disabled",
    });
  });

  it("denies production and unknown modes", () => {
    expect(
      evaluateMockCheckoutAccess(
        {
          HORATHAI_MOCK_CHECKOUT_MODE: "production",
          HORATHAI_MOCK_CHECKOUT_ALLOWED_HOSTS: "thaihora.app",
        },
        "thaihora.app",
      ),
    ).toEqual({ allowed: false, reason: "invalid_mode" });
  });

  it.each(["development", "review"] as const)(
    "allows %s only on an explicitly allowlisted host",
    (mode) => {
      const environment = {
        HORATHAI_MOCK_CHECKOUT_MODE: mode,
        HORATHAI_MOCK_CHECKOUT_ALLOWED_HOSTS: "localhost,id-preview--example.lovable.app",
      };
      expect(evaluateMockCheckoutAccess(environment, "localhost:8080")).toEqual({
        allowed: true,
        mode,
        host: "localhost",
      });
      expect(evaluateMockCheckoutAccess(environment, "thaihora.app")).toEqual({
        allowed: false,
        reason: "host_denied",
      });
    },
  );

  it("requires a host allowlist even in review mode", () => {
    expect(
      evaluateMockCheckoutAccess({ HORATHAI_MOCK_CHECKOUT_MODE: "review" }, "localhost"),
    ).toEqual({ allowed: false, reason: "missing_allowlist" });
  });

  it.each(["development", "review"] as const)(
    "denies a production hostname in %s mode before any mutation",
    (mode) => {
      let mutations = 0;
      const access = evaluateMockCheckoutAccess(
        {
          HORATHAI_MOCK_CHECKOUT_MODE: mode,
          HORATHAI_MOCK_CHECKOUT_ALLOWED_HOSTS: "localhost,id-preview--example.lovable.app",
        },
        "thaihora.app",
      );
      if (access.allowed) mutations += 1;
      expect(access).toEqual({ allowed: false, reason: "host_denied" });
      expect(mutations).toBe(0);
    },
  );

  it.each(["development", "review"] as const)(
    "allows exactly one mutation on an allowlisted host in %s mode",
    (mode) => {
      let mutations = 0;
      const access = evaluateMockCheckoutAccess(
        {
          HORATHAI_MOCK_CHECKOUT_MODE: mode,
          HORATHAI_MOCK_CHECKOUT_ALLOWED_HOSTS: "localhost,id-preview--example.lovable.app",
        },
        "id-preview--example.lovable.app",
      );
      if (access.allowed) mutations += 1;
      expect(access.allowed).toBe(true);
      expect(mutations).toBe(1);
    },
  );
});
