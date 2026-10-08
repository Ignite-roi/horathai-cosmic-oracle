// Horathai Blog Autopilot — ให้ Gemini เขียนบทความ SEO ภาษาไทยวันละ N เรื่อง แล้วบันทึกเป็น posts/<slug>.json
// ENV: GEMINI_API_KEY (จำเป็น), GEMINI_MODEL, POSTS_PER_RUN (ค่าเริ่มต้น 1), POST_STATUS (published|draft)

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { INTERNAL_DESTINATIONS, canonicalizeLinks, findKeywordCollision, qualityGate } from "./seo-gate.mjs";

const KEY = process.env.GEMINI_API_KEY;
const MODELS = [process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash"].filter(Boolean);
const COUNT = Math.max(1, Math.min(3, Number(process.env.POSTS_PER_RUN || 1)));
const STATUS = process.env.POST_STATUS === "draft" ? "draft" : "published";
const POSTS_DIR = "posts";
const KEYWORDS_FILE = "content/keywords.txt";
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function fail(msg) {
  console.error(`❌ ${msg}`);
  console.log(`::error::${msg}`);
  process.exit(1);
}
if (!KEY) fail("ไม่พบ GEMINI_API_KEY (ตั้งใน GitHub → Settings → Secrets and variables → Actions)");

// ---------- เลือกคีย์เวิร์ดที่ยังไม่เคยเขียน ----------
async function usedKeywords() {
  const used = new Set();
  const files = (await readdir(POSTS_DIR).catch(() => [])).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    try {
      const p = JSON.parse(await readFile(path.join(POSTS_DIR, f), "utf8"));
      if (p.primary_keyword) used.add(p.primary_keyword.trim());
    } catch {}
  }
  return { used, slugs: new Set(files.map((f) => f.replace(/\.json$/, ""))) };
}

async function pickKeywords(n) {
  const raw = await readFile(KEYWORDS_FILE, "utf8").catch(() => fail(`ไม่พบไฟล์ ${KEYWORDS_FILE}`));
  const all = raw.split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
  const { used, slugs } = await usedKeywords();
  // SEO OS zero-LLM preflight: one owner per intent — skip exact/near-duplicate keywords
  // before spending a Gemini call (SKIP_CANNIBALIZATION).
  const owners = [...used];
  const left = [];
  for (const k of all) {
    if (used.has(k)) continue;
    const hit = findKeywordCollision(k, owners);
    if (hit) {
      console.log(`⏭️  SKIP_CANNIBALIZATION: "${k}" ทับเจตนากับ "${hit.keyword}" (${hit.score.toFixed(2)})`);
      continue;
    }
    left.push(k);
  }
  if (!left.length) fail(`คีย์เวิร์ดใน ${KEYWORDS_FILE} ถูกใช้หมดแล้ว — เพิ่มบรรทัดใหม่ได้เลย`);
  console.log(`🔑 เหลือคีย์เวิร์ดที่ยังไม่เขียน ${left.length} คำ`);
  return { picks: left.slice(0, n), slugs };
}

// ---------- เรียก Gemini ----------
const SCHEMA = {
  type: "OBJECT",
  properties: {
    slug: { type: "STRING", description: "English, lowercase, a-z0-9 and hyphens only, 3-8 words" },
    title: { type: "STRING" },
    meta_title: { type: "STRING", description: "≤ 60 characters, contains the keyword" },
    meta_description: { type: "STRING", description: "120-155 characters, contains the keyword" },
    excerpt: { type: "STRING", description: "1-2 sentences" },
    content_md: { type: "STRING" },
    cover_alt: { type: "STRING" },
    tags: { type: "ARRAY", items: { type: "STRING" } },
    reading_minutes: { type: "INTEGER" },
    faq: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { q: { type: "STRING" }, a: { type: "STRING" } }, required: ["q", "a"] },
    },
  },
  required: ["slug", "title", "meta_title", "meta_description", "excerpt", "content_md", "tags", "faq"],
};

function prompt(keyword) {
  return `คุณคือบรรณาธิการเว็บไซต์ Horathai (thaihora.app) แอปโหราศาสตร์ไทยที่คำนวณดวงกำเนิด ลัคนา และดาวจร
เขียนบทความ SEO ภาษาไทย 1 เรื่อง สำหรับคีย์เวิร์ดหลัก: "${keyword}"

ข้อกำหนด:
- ความยาว content_md 1,200-1,800 คำ เป็น Markdown ใช้ ## และ ### เป็นหัวข้อ (ห้ามใช้ # ระดับ 1)
- ใส่คีย์เวิร์ดหลักใน 100 คำแรก, ในหัวข้อ ## อย่างน้อย 1 หัวข้อ และกระจายอย่างเป็นธรรมชาติ
- มีตารางสรุปอย่างน้อย 1 ตาราง และ bullet list ที่อ่านง่าย
- ลิงก์ภายในอย่างน้อย 2 ลิงก์ เลือกจากรายการนี้เท่านั้น: ${INTERNAL_DESTINATIONS.map((d) => `[${d.label}](${d.href})`).join(", ")}
- ปิดท้ายด้วยหัวข้อ "## สรุป" และชวนให้ลองดูดวงกำเนิดของตัวเองที่ Horathai
- น้ำเสียง: อบอุ่น น่าเชื่อถือ อธิบายตามหลักโหราศาสตร์ไทย (ราศี ลัคนา ดาวนพเคราะห์ ภพ) ไม่ฟันธงเกินจริง
- ห้ามให้คำแนะนำทางการแพทย์ การเงิน หรือกฎหมายแบบรับประกันผล ห้ามสร้างคำพูดของบุคคลจริง
- ห้ามแต่งสถิติ ตัวเลขเปอร์เซ็นต์ หรือแหล่งอ้างอิงที่ไม่มีจริง ห้ามอ้างความแม่นยำ ห้ามใช้คำว่า "รับประกัน" หรือ "การันตี" กับผลทำนาย
- ห้ามอ้างข้อมูลราคา แพ็กเกจ โปรโมชัน รีวิว หรือจำนวนผู้ใช้ของ Horathai
- faq: 3-5 ข้อ คำถามที่คนค้นหาจริงเกี่ยวกับ "${keyword}"
- tags: 3-5 แท็กภาษาไทย
- slug: ภาษาอังกฤษ ตัวพิมพ์เล็ก คั่นด้วย - เท่านั้น
- reading_minutes: ประมาณจากความยาว
ตอบเป็น JSON ตาม schema เท่านั้น`;
}

async function callGemini(keyword) {
  let lastErr;
  for (const model of MODELS) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt(keyword) }] }],
        generationConfig: { temperature: 0.8, responseMimeType: "application/json", responseSchema: SCHEMA },
      }),
    });
    const text = await res.text();
    if (res.status === 404 || res.status === 403 || res.status === 429 || res.status >= 500) {
      lastErr = `${model}: HTTP ${res.status}`;
      console.log(`↪️  ${lastErr} — ลองรุ่นถัดไป`);
      continue;
    }
    if (!res.ok) throw new Error(`Gemini ${model} HTTP ${res.status}: ${text.slice(0, 300)}`);
    const data = JSON.parse(text);
    const out = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    console.log(`🤖 ใช้รุ่น ${model}`);
    const u = data.usageMetadata || {};
    console.log(`🧮 tokens: prompt=${u.promptTokenCount ?? "?"} output=${u.candidatesTokenCount ?? "?"} thinking=${u.thoughtsTokenCount ?? 0} total=${u.totalTokenCount ?? "?"}`);
    return JSON.parse(out);
  }
  throw new Error(`เรียก Gemini ไม่ได้ทุกรุ่น (${lastErr})`);
}

// ---------- ตรวจคุณภาพ + บันทึก ----------
function clean(post, keyword, slugs) {
  let slug = String(post.slug || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!SLUG_RE.test(slug)) slug = `horathai-${Date.now()}`;
  if (slugs.has(slug)) slug = `${slug}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`;

  // Deterministic repair (no LLM): drop stray H1, point alias links at canonical paths.
  const content = canonicalizeLinks(String(post.content_md || "").replace(/^# .*\n/m, ""));
  const words = content.split(/\s+/).length;
  if (content.length < 2500) throw new Error(`เนื้อหาสั้นเกินไป (${content.length} ตัวอักษร)`);

  const faq = (post.faq || []).filter((f) => f.q && f.a).slice(0, 6);
  const url = `https://thaihora.app/blog/${slug}`;
  const today = new Date().toISOString();

  // SEO OS quality gate: hard failure → quarantine as draft (fail closed, no regeneration loop).
  const gate = qualityGate({ ...post, content_md: content, faq }, keyword);
  const status = gate.passed ? STATUS : "draft";
  if (!gate.passed) console.log(`🛑 QUARANTINE → draft: ${gate.hard.join("; ")}`);
  if (gate.soft.length) console.log(`⚠️  soft: ${gate.soft.join("; ")}`);

  return {
    slug,
    title: post.title.trim(),
    meta_title: post.meta_title.trim().slice(0, 70),
    meta_description: post.meta_description.trim().slice(0, 160),
    excerpt: post.excerpt.trim(),
    content_md: content.trim(),
    cover_alt: post.cover_alt || post.title,
    tags: (post.tags || []).slice(0, 6),
    primary_keyword: keyword,
    status,
    quality: { gate: "seo-os-v1", checked_at: today, passed: gate.passed, hard: gate.hard, soft: gate.soft },
    reading_minutes: post.reading_minutes || Math.max(3, Math.round(words / 200)),
    author: "Horathai Editorial",
    source: "autopilot-gemini",
    faq,
    schema_jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title.trim(),
        description: post.meta_description.trim(),
        inLanguage: "th-TH",
        datePublished: today,
        dateModified: today,
        author: { "@type": "Organization", name: "Horathai Editorial" },
        publisher: { "@type": "Organization", "@id": "https://thaihora.app/#organization", name: "Horathai AI", url: "https://thaihora.app/" },
        mainEntityOfPage: url,
        url,
        keywords: keyword,
      },
      ...(faq.length
        ? [{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }]
        : []),
    ],
  };
}

async function main() {
  await mkdir(POSTS_DIR, { recursive: true });
  const { picks, slugs } = await pickKeywords(COUNT);
  let ok = 0;
  for (const kw of picks) {
    try {
      console.log(`✍️  กำลังเขียน: ${kw}`);
      const post = clean(await callGemini(kw), kw, slugs);
      await writeFile(path.join(POSTS_DIR, `${post.slug}.json`), JSON.stringify(post, null, 2) + "\n");
      slugs.add(post.slug);
      console.log(`✅ บันทึก posts/${post.slug}.json (${post.content_md.length} ตัวอักษร, ${post.status})`);
      ok++;
    } catch (e) {
      console.error(`❌ ${kw}: ${e.message}`);
      console.log(`::error::${kw}: ${e.message}`);
    }
  }
  if (!ok) process.exit(1);
}

main().catch((e) => fail(e.message));
