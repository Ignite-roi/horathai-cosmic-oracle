import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "crypto";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-autopilot-secret",
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FIELDS = [
  "slug", "title", "meta_title", "meta_description", "excerpt", "content_md", "cover_image_url",
  "cover_alt", "tags", "primary_keyword", "faq", "schema_jsonld", "status", "reading_minutes",
  "author", "source", "quality",
] as const;
const STATUSES = ["draft", "published", "archived"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function secretOk(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/blog-ingest")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        if (!secretOk(request.headers.get("x-autopilot-secret"), process.env["AUTOPILOT_SECRET"])) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }
        let body: { action?: unknown; post?: Record<string, unknown> };
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid json" }, 400);
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (body.action === "list") {
          const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .select("slug,title,status,primary_keyword,published_at,updated_at")
            .order("updated_at", { ascending: false })
            .limit(1000);
          if (error) return json({ ok: false, error: error.message }, 500);
          return json({ ok: true, posts: data ?? [] });
        }

        if (body.action === "upsert") {
          const input = body.post;
          if (!input || typeof input !== "object") return json({ ok: false, error: "post required" }, 400);
          const slug = input["slug"];
          if (typeof slug !== "string" || !SLUG_RE.test(slug)) return json({ ok: false, error: "invalid slug" }, 400);
          if (typeof input["title"] !== "string" || !input["title"].trim()) return json({ ok: false, error: "title required" }, 400);
          if (typeof input["content_md"] !== "string" || !input["content_md"].trim()) return json({ ok: false, error: "content_md required" }, 400);

          const row: Record<string, unknown> = {};
          for (const f of FIELDS) if (f in input) row[f] = input[f];
          if (!STATUSES.includes(row["status"] as string)) row["status"] = "draft";
          row["updated_at"] = new Date().toISOString();

          const { data: existing } = await supabaseAdmin
            .from("blog_posts").select("status,published_at").eq("slug", slug).maybeSingle();
          if (existing?.status === "archived") row["status"] = "archived";
          if (row["status"] === "published") row["published_at"] = existing?.published_at ?? new Date().toISOString();

          const { error } = await supabaseAdmin.from("blog_posts").upsert(row as never, { onConflict: "slug" });
          if (error) return json({ ok: false, error: error.message }, 400);
          return json({ ok: true, slug, status: row["status"] });
        }

        return json({ ok: false, error: "unknown action" }, 400);
      },
    },
  },
});
