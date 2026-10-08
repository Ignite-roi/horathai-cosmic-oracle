// Horathai Blog Autopilot — ส่งบทความใน posts/*.json เข้า /api/public/blog-ingest แล้ว ping IndexNow
// ใช้ Node 20+ (มี fetch ในตัว) ไม่ต้องติดตั้งแพ็กเกจเพิ่ม
//
// ENV:
//   BLOG_BASE_URL      เช่น https://thaihora.app  (หรือ URL preview)
//   AUTOPILOT_SECRET   ต้องตรงกับ Secret ใน Lovable
//   FORCE_UPDATE=1     อัปเดตบทความที่มี slug อยู่แล้วด้วย (ปกติข้าม)
//   INDEXNOW_KEY       ค่าเริ่มต้น = key ที่วางไว้ใน public/
//   DRY_RUN=1          แค่แสดงผล ไม่ยิงจริง

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.BLOG_BASE_URL || "https://thaihora.app").replace(/\/$/, "");
const SECRET = process.env.AUTOPILOT_SECRET;
const FORCE = process.env.FORCE_UPDATE === "1";
const DRY = process.env.DRY_RUN === "1";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "7303c0391e1cbf898e1ef4c9034081b6";
const POSTS_DIR = process.env.POSTS_DIR || "posts";
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function fail(message) {
  console.error(`❌ ${message}`);
  console.log("::error::" + message);
}

if (!SECRET) {
  fail("ไม่พบ AUTOPILOT_SECRET (ตั้งใน GitHub → Settings → Secrets and variables → Actions)");
  process.exit(1);
}

async function ingest(body) {
  const res = await fetch(`${BASE}/api/public/blog-ingest`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-autopilot-secret": SECRET },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const snippet = text.slice(0, 200).replaceAll(SECRET, "***");
    throw new Error(`HTTP ${res.status} non-JSON response from ${BASE}: ${snippet}`);
  }
  if (!res.ok || !data.ok) throw new Error(`HTTP ${res.status} ${data.error || "unknown error"}`);
  return data;
}

function validate(post, file) {
  const errs = [];
  if (typeof post.slug !== "string" || !SLUG_RE.test(post.slug)) errs.push("slug ต้องเป็น a-z0-9 คั่นด้วย -");
  if (!post.title?.trim()) errs.push("ไม่มี title");
  if (!post.content_md?.trim()) errs.push("ไม่มี content_md");
  if (post.meta_description && post.meta_description.length > 160) errs.push("meta_description เกิน 160 ตัวอักษร");
  if (errs.length) throw new Error(`${file}: ${errs.join(", ")}`);
}

async function pingIndexNow(urls) {
  if (!urls.length) return;
  const host = new URL(BASE).host;
  if (host.includes("lovable.app")) {
    console.log("ℹ️  ข้าม IndexNow (เป็น URL preview)");
    return;
  }
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(`📡 IndexNow: HTTP ${res.status} (${urls.length} URL) — 200/202 = สำเร็จ`);
}

async function main() {
  console.log(`🎯 Target: ${BASE}${DRY ? "  (DRY RUN)" : ""}`);

  // 1) เช็ค slug ที่มีอยู่แล้ว
  const { posts: existing } = await ingest({ action: "list" });
  const existingSlugs = new Set(existing.map((p) => p.slug));
  console.log(`📚 มีบทความในระบบแล้ว ${existingSlugs.size} เรื่อง`);

  // 2) อ่านไฟล์บทความ
  const files = (await readdir(POSTS_DIR).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  const changedUrls = [];
  let sent = 0, skipped = 0, failed = 0;

  for (const file of files) {
    try {
      const raw = JSON.parse(await readFile(path.join(POSTS_DIR, file), "utf8"));
      const post = raw.post ?? raw; // รองรับทั้ง {post:{...}} และ {...}
      validate(post, file);
      // SEO OS fail-closed: a post whose recorded quality gate failed is never published.
      if (post.quality && post.quality.passed === false && post.status === "published") {
        console.log(`🛑 ${post.slug}: quality gate failed → ส่งเป็น draft`);
        post.status = "draft";
      }

      if (existingSlugs.has(post.slug) && !FORCE) {
        console.log(`⏭️  ข้าม ${post.slug} (มีอยู่แล้ว)`);
        skipped++;
        continue;
      }
      if (DRY) {
        console.log(`🧪 จะส่ง ${post.slug} [${post.status || "draft"}]`);
        continue;
      }
      const r = await ingest({ action: "upsert", post });
      console.log(`✅ ${r.slug} → ${r.status}`);
      sent++;
      if (r.status === "published") changedUrls.push(`${BASE}/blog/${r.slug}`);
    } catch (e) {
      console.error(`❌ ${file}: ${e.message}`);
      failed++;
    }
  }

  // 3) แจ้ง Search Engine
  if (!DRY && changedUrls.length) {
    changedUrls.push(`${BASE}/blog`, `${BASE}/sitemap.xml`);
    await pingIndexNow(changedUrls).catch((e) => console.error("⚠️ IndexNow:", e.message));
  }

  console.log(`\nสรุป: ส่ง ${sent} · ข้าม ${skipped} · ผิดพลาด ${failed}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
