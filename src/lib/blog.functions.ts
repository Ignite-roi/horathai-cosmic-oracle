import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export const SITE_URL = "https://thaihora.app";

export type BlogCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_alt: string | null;
  tags: string[];
  reading_minutes: number | null;
  published_at: string | null;
  updated_at: string;
};

export type FaqItem = { q: string; a: string };

const CARD_COLUMNS =
  "slug,title,excerpt,cover_image_url,cover_alt,tags,reading_minutes,published_at,updated_at";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ limit: z.number().int().min(1).max(500).default(500) }).parse(input ?? {}))
  .handler(async ({ data }): Promise<BlogCard[]> => {
    const { data: rows, error } = await publicClient()
      .from("blog_posts")
      .select(CARD_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(data.limit);
    if (error) {
      console.error("listPublishedPosts", error);
      return [];
    }
    return (rows ?? []) as BlogCard[];
  });

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const client = publicClient();
    const { data: post, error } = await client
      .from("blog_posts")
      .select("slug,title,meta_title,meta_description,excerpt,content_md,cover_image_url,cover_alt,tags,primary_keyword,faq,schema_jsonld,reading_minutes,author,published_at,updated_at")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error("ไม่สามารถโหลดบทความได้");
    if (!post) throw notFound();
    const { data: others } = await client
      .from("blog_posts")
      .select(CARD_COLUMNS)
      .eq("status", "published")
      .neq("slug", data.slug)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(40);
    const pool = (others ?? []) as BlogCard[];
    const tagSet = new Set(post.tags);
    const sameTag = pool.filter((p) => p.tags.some((t) => tagSet.has(t)));
    const related = [...sameTag, ...pool.filter((p) => !sameTag.includes(p))].slice(0, 3);
    const faq = (Array.isArray(post.faq) ? post.faq : []).filter(
      (f): f is FaqItem => !!f && typeof f === "object" && typeof (f as FaqItem).q === "string" && typeof (f as FaqItem).a === "string",
    );
    const schema = (Array.isArray(post.schema_jsonld) ? post.schema_jsonld : []).filter(
      (s) => !!s && typeof s === "object" && !Array.isArray(s),
    ) as Record<string, unknown>[];
    return { post: { ...post, faq, schema_jsonld: schema }, related };
  });

/* ---------------- Admin (admin/reviewer verified server-side) ---------------- */

async function assertRole(context: { supabase: ReturnType<typeof createClient<Database>>; userId: string }, write: boolean) {
  const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role);
  const ok = write ? roles.includes("admin") : roles.includes("admin") || roles.includes("reviewer");
  if (!ok) throw new Error("Forbidden");
}

export const adminListBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertRole(context as never, false);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id,slug,title,meta_title,meta_description,content_md,status,quality,primary_keyword,published_at,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().trim().min(1).max(300).optional(),
      meta_title: z.string().max(300).nullable().optional(),
      meta_description: z.string().max(600).nullable().optional(),
      content_md: z.string().min(1).max(200_000).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertRole(context as never, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { data: existing } = await supabaseAdmin.from("blog_posts").select("published_at").eq("id", id).maybeSingle();
    if (!existing) throw new Error("ไม่พบบทความ");
    const update: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
    if (patch.status === "published" && !existing.published_at) update["published_at"] = new Date().toISOString();
    const { error } = await supabaseAdmin.from("blog_posts").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertRole(context as never, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
