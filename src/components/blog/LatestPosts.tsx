import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { listPublishedPosts } from "@/lib/blog.functions";

export function LatestPosts() {
  const { data } = useQuery({ queryKey: ["blog", "latest3"], queryFn: () => listPublishedPosts({ data: { limit: 3 } }), staleTime: 60_000 });
  return (
    <section className="mt-8 text-left">
      <div className="flex items-center justify-between">
        <p className="eyebrow">บทความล่าสุด</p>
        <Link to="/blog" className="text-[11px] text-primary">บทความ ›</Link>
      </div>
      <div className="mt-3 space-y-2">
        {(data ?? []).map((p) => (
          <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="press flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-2">
            {p.cover_image_url && <img src={p.cover_image_url} alt={p.cover_alt ?? ""} className="h-12 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />}
            <span className="line-clamp-2 text-[12px] text-foreground">{p.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
