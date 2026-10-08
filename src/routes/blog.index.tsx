import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { BlogLayout, PostCard } from "@/components/blog/BlogUI";
import { Skeleton } from "@/components/ui/skeleton";
import { listPublishedPosts } from "@/lib/blog.functions";
import { breadcrumbSchema, jsonLd, pageHead } from "@/lib/seo";

const PAGE = 12;
export const blogListQuery = queryOptions({
  queryKey: ["blog", "list"],
  queryFn: () => listPublishedPosts({ data: { limit: 500 } }),
  staleTime: 60_000,
});

const TITLE = "บทความโหราศาสตร์ไทย | Horathai AI";
const DESC = "บทความโหราศาสตร์ไทย ลัคนา ดาวย้าย ดวงกำเนิด และวิธีอ่านดวงอย่างมีหลักการ จาก Horathai AI";

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(blogListQuery),
  head: () => ({
    ...pageHead({ path: "/blog", title: TITLE, description: DESC }),
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(breadcrumbSchema([{ name: "หน้าแรก", path: "/" }, { name: "บทความ", path: "/blog" }])),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data } = useSuspenseQuery(blogListQuery);
  const isLoading = false;
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const posts = data ?? [];
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].slice(0, 30), [posts]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return posts.filter((p) => (!tag || p.tags.includes(tag)) && (!s || `${p.title} ${p.excerpt ?? ""}`.toLowerCase().includes(s)));
  }, [posts, q, tag]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const visible = filtered.slice((page - 1) * PAGE, page * PAGE);

  return (
    <BlogLayout>
      <p className="eyebrow">Horathai Journal</p>
      <h1 className="thai-heading mt-2 text-3xl text-foreground sm:text-4xl">บทความโหราศาสตร์</h1>
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-card/50 px-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="ค้นหาบทความ…" aria-label="ค้นหาบทความ" className="h-11 w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
      </div>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[null, ...tags].map((t) => (
            <button key={t ?? "all"} onClick={() => { setTag(t); setPage(1); }} className={`press rounded-full border px-3 py-1 text-[11px] ${tag === t ? "border-primary/50 bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
              {t ?? "ทั้งหมด"}
            </button>
          ))}
        </div>
      )}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && !data
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />)
          : visible.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
      {!isLoading && filtered.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">ยังไม่มีบทความที่ตรงกับการค้นหา</p>}
      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3 text-[13px]">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="press rounded-full border border-border px-4 py-2 disabled:opacity-40">ก่อนหน้า</button>
          <span className="text-muted-foreground">{page} / {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className="press rounded-full border border-border px-4 py-2 disabled:opacity-40">ถัดไป</button>
        </div>
      )}
    </BlogLayout>
  );
}
