import { describe, expect, it } from "vitest";

import {
  INDEXABLE_STATIC_PATHS,
  ROUTE_ALIASES,
  breadcrumbSchema,
  canonicalHref,
  canonicalUrl,
  faqSchemaMatchesVisible,
  headingId,
  pageHead,
} from "./seo";
import { PUBLIC_REVIEW_ROUTES } from "@/config/public-review";
// @ts-expect-error — plain ESM script without types
import {
  canonicalizeLinks,
  findKeywordCollision,
  qualityGate,
  ROUTE_ALIASES as SCRIPT_ALIASES,
} from "../../scripts/seo-gate.mjs";

describe("canonical URLs", () => {
  it("builds self canonicals without trailing slash or query", () => {
    expect(canonicalUrl("/")).toBe("https://thaihora.app/");
    expect(canonicalUrl("/blog/")).toBe("https://thaihora.app/blog");
    expect(canonicalUrl("/terms?x=1#a")).toBe("https://thaihora.app/terms");
  });

  it("maps redirect aliases to canonical targets", () => {
    expect(canonicalHref("/chart")).toBe("/birth-chart");
    expect(canonicalHref("/transit?d=1")).toBe("/transits?d=1");
    expect(canonicalHref("/blog/x")).toBe("/blog/x");
  });

  it("keeps the app and script alias maps in sync", () => {
    expect(SCRIPT_ALIASES).toEqual(ROUTE_ALIASES);
  });
});

describe("sitemap / indexable routes", () => {
  it("never lists redirect aliases or app routes as indexable", () => {
    for (const p of INDEXABLE_STATIC_PATHS) {
      expect(Object.keys(ROUTE_ALIASES)).not.toContain(p);
      expect(PUBLIC_REVIEW_ROUTES as readonly string[]).not.toContain(p);
    }
  });

  it("pageHead emits a canonical that matches og:url", () => {
    const h = pageHead({ path: "/privacy", title: "t", description: "d" });
    const og = h.meta.find((m) => m["property"] === "og:url");
    expect(h.links[0]).toEqual({ rel: "canonical", href: "https://thaihora.app/privacy" });
    expect(og?.["content"]).toBe("https://thaihora.app/privacy");
  });
});

describe("schema gates", () => {
  const faq = [{ q: "คำถาม", a: "คำตอบ" }];
  const schema = {
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "คำถาม", acceptedAnswer: { "@type": "Answer", text: "คำตอบ" } },
    ],
  };
  it("accepts FAQ schema only when it matches the visible FAQ", () => {
    expect(faqSchemaMatchesVisible(schema, faq)).toBe(true);
    expect(faqSchemaMatchesVisible(schema, [{ q: "คำถาม", a: "อื่น" }])).toBe(false);
    expect(faqSchemaMatchesVisible(schema, [])).toBe(false);
  });

  it("builds absolute breadcrumb items", () => {
    const b = breadcrumbSchema([{ name: "หน้าแรก", path: "/" }]);
    expect(b.itemListElement[0]?.item).toBe("https://thaihora.app/");
  });

  it("keeps Thai combining marks in heading ids", () => {
    expect(headingId("เคล็ดลับการเตรียมตัว")).toBe("เคล็ดลับการเตรียมตัว");
  });
});

describe("blog autopilot gates", () => {
  it("detects near-duplicate intent but keeps distinct entities apart", () => {
    expect(findKeywordCollision("ดูดวง ปี2570", ["ดูดวงปี 2570"])).not.toBeNull();
    expect(
      findKeywordCollision("ดวงชะตาคนเกิดลัคนาราศีเมถุน", ["ดวงชะตาคนเกิดลัคนาราศีเมษ"]),
    ).toBeNull();
    expect(findKeywordCollision("ดวงการเงินปี 2570", ["ดวงความรักปี 2570"])).toBeNull();
  });

  it("rewrites alias links deterministically", () => {
    expect(canonicalizeLinks("[a](/chart) [b](/ai#x) [c](/blog)")).toBe(
      "[a](/birth-chart) [b](/ai-astrologer#x) [c](/blog)",
    );
  });

  it("quarantines unsupported claims and missing internal links", () => {
    const body = `ดูดวงปี 2570 ${"เนื้อหา ".repeat(500)}\n## สรุป\nแม่นยำ 100 เปอร์เซ็นต์`;
    const r = qualityGate(
      { title: "t", meta_title: "ดูดวงปี 2570", meta_description: "d", content_md: body, faq: [] },
      "ดูดวงปี 2570",
    );
    expect(r.passed).toBe(false);
    expect(r.hard.join(" ")).toMatch(/internal link/);
    expect(r.hard.join(" ")).toMatch(/unsafe|statistic/);
  });

  it("allows disclaimers and passes a clean article", () => {
    const body = `ดูดวงปี 2570 ${"เนื้อหา ".repeat(500)} [ผังดวงกำเนิด](/birth-chart) ไม่รับประกันผล\n## สรุป\nจบ`;
    const r = qualityGate(
      {
        title: "t",
        meta_title: "ดูดวงปี 2570",
        meta_description: "d".repeat(120),
        content_md: body,
        faq: [
          { q: "q", a: "a" },
          { q: "q", a: "a" },
          { q: "q", a: "a" },
        ],
      },
      "ดูดวงปี 2570",
    );
    expect(r.hard).toEqual([]);
  });
});
