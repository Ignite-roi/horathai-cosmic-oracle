import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL, listPublishedPosts } from "@/lib/blog.functions";

const STATIC_PATHS = ["/", "/chart", "/transit", "/ai", "/service-info", "/terms", "/privacy"];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = await listPublishedPosts({ data: { limit: 500 } });
        const newest = posts.reduce<string | null>((m, p) => (!m || p.updated_at > m ? p.updated_at : m), null);
        const urls: string[] = STATIC_PATHS.map((p) => `<url><loc>${SITE_URL}${p === "/" ? "/" : p}</loc></url>`);
        urls.push(`<url><loc>${SITE_URL}/blog</loc>${newest ? `<lastmod>${newest}</lastmod>` : ""}</url>`);
        for (const p of posts) {
          const img = p.cover_image_url?.startsWith("http")
            ? `<image:image><image:loc>${esc(p.cover_image_url)}</image:loc>${p.cover_alt ? `<image:title>${esc(p.cover_alt)}</image:title>` : ""}</image:image>`
            : "";
          urls.push(`<url><loc>${SITE_URL}/blog/${p.slug}</loc><lastmod>${p.updated_at}</lastmod>${img}</url>`);
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
