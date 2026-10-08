// SEO Operating System — deterministic gates for the Blog Autopilot (zero LLM calls).
// Used by scripts/generate-post.mjs before and after the single Gemini generation.
// Rules: docs/seo/SEO_OPERATING_SYSTEM.md (hard failure → quarantine as draft, never auto-publish).

/** Legacy aliases redirect; internal links must use canonical paths (mirror of src/lib/seo.ts). */
export const ROUTE_ALIASES = Object.freeze({
  "/chart": "/birth-chart",
  "/transit": "/transits",
  "/ai": "/ai-astrologer",
});

/** Allowed internal link destinations for generated articles. */
export const INTERNAL_DESTINATIONS = Object.freeze([
  { href: "/onboarding", label: "ดูดวงกำเนิดฟรี" },
  { href: "/birth-chart", label: "ผังดวงกำเนิด" },
  { href: "/transits", label: "ดาวจรวันนี้" },
  { href: "/ai-astrologer", label: "ถามหมอดู AI" },
  { href: "/blog", label: "บทความทั้งหมด" },
]);

export function normalizeKeyword(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFC")
    .replace(/[\s\-_.,!?:;"'()[\]]+/g, "");
}

function bigrams(s) {
  const out = new Set();
  const chars = [...s];
  for (let i = 0; i < chars.length - 1; i++) out.add(chars[i] + chars[i + 1]);
  return out;
}

/** Character-bigram Jaccard similarity — works for Thai (no word spaces). */
export function keywordSimilarity(a, b) {
  const x = normalizeKeyword(a);
  const y = normalizeKeyword(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const A = bigrams(x);
  const B = bigrams(y);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / (A.size + B.size - inter);
}

export const COLLISION_THRESHOLD = 0.75;

// Entity tokens that make otherwise-templated keywords distinct intents
// (e.g. ลัคนาราศีเมษ vs ลัคนาราศีเมถุน, ดวงความรักปี 2570 vs ดวงการเงินปี 2570).
const ENTITY_RE = new RegExp(
  [
    "เมษ",
    "พฤษภ",
    "เมถุน",
    "กรกฎ",
    "สิงห์",
    "กันย์",
    "ตุลย์",
    "พิจิก",
    "ธนู",
    "มังกร",
    "กุมภ์",
    "มีน",
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัส",
    "ศุกร์",
    "เสาร์",
    "ราหู",
    "เกตุ",
    "มฤตยู",
    "กลางวัน",
    "กลางคืน",
    "ความรัก",
    "การเงิน",
    "การงาน",
    "สุขภาพ",
    "โชคลาภ",
    "คู่",
    "สี",
    "เลข",
    "ลาภะ",
    "ปัตนิ",
    "กัมมะ",
    "ตนุ",
    "กดุมภะ",
    "สหัชชะ",
    "พันธุ",
    "ปุตตะ",
    "อริ",
    "มรณะ",
    "ศุภะ",
    "วินาศ",
    "\\d{4}",
  ].join("|"),
  "g",
);

export function keywordEntities(keyword) {
  return [...new Set(normalizeKeyword(keyword).match(ENTITY_RE) ?? [])].sort().join("|");
}

/**
 * Ownership / intent-collision preflight. Returns the existing keyword that already
 * owns this intent (exact or near-duplicate), or null when the keyword is free.
 * Keywords with different entity tokens are treated as distinct intents.
 */
export function findKeywordCollision(keyword, existingKeywords, threshold = COLLISION_THRESHOLD) {
  let best = null;
  const entities = keywordEntities(keyword);
  for (const k of existingKeywords) {
    if (normalizeKeyword(k) !== normalizeKeyword(keyword) && keywordEntities(k) !== entities)
      continue;
    const score = keywordSimilarity(keyword, k);
    if (score >= threshold && (!best || score > best.score)) best = { keyword: k, score };
  }
  return best;
}

/** Rewrite markdown links that point to redirect aliases onto their canonical path. */
export function canonicalizeLinks(md) {
  return String(md).replace(/\]\((\/[a-z-]*)([?#][^)]*)?\)/g, (m, path, rest = "") => {
    const target = ROUTE_ALIASES[path];
    return target ? `](${target}${rest})` : m;
  });
}

// Negative lookbehinds allow disclaimers such as "ไม่รับประกันผล".
const UNSAFE_CLAIMS = [
  /(?<!ไม่)(?<!ไม่ได้)(?<!ไม่มีการ)รับประกัน/,
  /(?<!ไม่)(?<!ไม่ได้)การันตี/,
  /แม่นยำ\s*100/,
  /รักษา(โรค|ให้หาย)/,
  /รวยแน่นอน|ถูกหวยแน่นอน|โชคดีแน่นอน/,
];

/**
 * Quality gate. Hard failures block publishing (post is quarantined as draft).
 * Soft warnings are recorded only — they never trigger regeneration.
 */
export function qualityGate(post, keyword) {
  const hard = [];
  const soft = [];
  const body = String(post.content_md ?? "");
  const text = `${post.title ?? ""}\n${post.meta_description ?? ""}\n${body}\n${(post.faq ?? []).map((f) => `${f.q} ${f.a}`).join("\n")}`;

  if (body.length < 2500) hard.push(`content too short (${body.length} chars)`);
  if (/^#\s/m.test(body))
    hard.push("content contains an H1 (page already renders the title as H1)");
  for (const re of UNSAFE_CLAIMS)
    if (re.test(text)) hard.push(`unsafe/unsupported claim matched ${re}`);
  if (/\d+(?:[.,]\d+)?\s*(?:%|เปอร์เซ็นต์)/.test(text))
    hard.push("contains a statistic/percentage (no verified data source)");
  if (/\]\(https?:\/\/(?!thaihora\.app)/.test(body))
    soft.push("external link present — verify the source exists");

  const internal = [...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1].split(/[?#]/)[0]);
  const allowed = new Set(INTERNAL_DESTINATIONS.map((d) => d.href));
  if (!internal.some((h) => allowed.has(h) || h.startsWith("/blog/")))
    hard.push("missing required internal link to an owner destination");
  for (const h of internal) if (ROUTE_ALIASES[h]) hard.push(`links to redirect alias ${h}`);
  for (const h of internal)
    if (!allowed.has(h) && !h.startsWith("/blog/")) soft.push(`internal link to unknown path ${h}`);

  const kw = normalizeKeyword(keyword);
  if (kw && !normalizeKeyword(body.slice(0, 600)).includes(kw))
    soft.push("primary keyword not in the opening section");
  if (kw && !normalizeKeyword(post.meta_title).includes(kw))
    soft.push("primary keyword not in meta_title");
  const mt = String(post.meta_title ?? "").length;
  if (mt > 60) soft.push(`meta_title ${mt} chars (>60)`);
  const md = String(post.meta_description ?? "").length;
  if (md < 90 || md > 160) soft.push(`meta_description ${md} chars (target 90–160)`);
  const faqCount = (post.faq ?? []).length;
  if (faqCount < 3) soft.push(`only ${faqCount} FAQ items`);
  if (!/^##\s*สรุป/m.test(body)) soft.push("missing '## สรุป' section");

  return { passed: hard.length === 0, hard, soft };
}
