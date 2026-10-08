import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { BlogLayout, PostCard, formatThaiDate } from "@/components/blog/BlogUI";
import { getPublishedPost } from "@/lib/blog.functions";
import { NOINDEX_META, breadcrumbSchema, canonicalHref, headingId, jsonLd, pageHead } from "@/lib/seo";

const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["blog", "post", slug], queryFn: () => getPublishedPost({ data: { slug } }), staleTime: 60_000 });

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQuery(params.slug)),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "ไม่พบบทความ | Horathai AI" }, NOINDEX_META] };
    const p = loaderData.post;
    const title = p.meta_title || `${p.title} | Horathai AI`;
    const desc = p.meta_description || p.excerpt || "";
    const path = `/blog/${params.slug}`;
    const img = p.cover_image_url?.startsWith("https://") ? p.cover_image_url : undefined;
    const base = pageHead({ path, title, description: desc, type: "article", image: img });
    const crumbs = breadcrumbSchema([
      { name: "หน้าแรก", path: "/" },
      { name: "บทความ", path: "/blog" },
      { name: p.title, path },
    ]);
    return {
      meta: [
        ...base.meta,
        ...(p.published_at ? [{ property: "article:published_time", content: p.published_at }] : []),
        { property: "article:modified_time", content: p.updated_at },
      ],
      links: base.links,
      scripts: [
        ...p.schema_jsonld.map((s) => ({ type: "application/ld+json", children: s })),
        { type: "application/ld+json", children: jsonLd(crumbs) },
      ],
    };
  },
  notFoundComponent: NotFoundPost,
  errorComponent: () => <BlogLayout><p className="text-center text-sm text-muted-foreground">โหลดบทความไม่สำเร็จ กรุณาลองใหม่</p></BlogLayout>,
  component: PostPage,
});

function NotFoundPost() {
  return (
    <BlogLayout>
      <div className="py-16 text-center">
        <h1 className="thai-heading text-2xl">ไม่พบบทความนี้</h1>
        <Link to="/blog" className="mt-4 inline-block text-primary">กลับไปหน้าบทความ</Link>
      </div>
    </BlogLayout>
  );
}

function PostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const { post, related } = data;
  const body = post.content_md.replace(/^\s*#\s+[^\n]*\n?/, "");
  const toc = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]!.replace(/[*_`]/g, "").trim());

  return (
    <BlogLayout>
      <article className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-[12px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">หน้าแรก</Link><ChevronRight className="h-3 w-3" />
          <Link to="/blog" className="hover:text-foreground">บทความ</Link><ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 text-foreground/80">{post.title}</span>
        </nav>
        <h1 className="thai-heading mt-4 text-3xl leading-tight text-foreground sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-[12px] text-muted-foreground">
          {post.author ?? "Horathai AI"} · {formatThaiDate(post.published_at)} · อ่าน {post.reading_minutes ?? 5} นาที
        </p>
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.cover_alt ?? post.title} className="mt-6 aspect-video w-full rounded-2xl border border-border object-cover" />
        )}
        {toc.length > 1 && (
          <nav aria-label="สารบัญ" className="surface-card mt-8 p-5">
            <p className="eyebrow">สารบัญ</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[13px]">
              {toc.map((t) => <li key={t}><a href={`#${headingId(t)}`} className="text-muted-foreground hover:text-primary">{t}</a></li>)}
            </ol>
          </nav>
        )}
        <div className="blog-prose mt-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
              h2: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
              // Internal links always resolve to canonical paths (legacy aliases like /chart redirect).
              a: ({ href, children }) =>
                href?.startsWith("/") && !href.startsWith("//") ? (
                  <Link to={canonicalHref(href)}>{children}</Link>
                ) : (
                  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                ),
              img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" />,
            }}
          >
            {body}
          </ReactMarkdown>
        </div>

        {post.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="thai-heading text-xl text-foreground">คำถามที่พบบ่อย</h2>
            {/* Native <details> keeps every answer in the server HTML so it matches FAQPage schema. */}
            <div className="mt-3 divide-y divide-border border-b border-border">
              {post.faq.map((f, i) => (
                <details key={i} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-[14px] font-medium [&::-webkit-details-marker]:hidden">
                    <h3 className="text-[14px] font-medium">{f.q}</h3>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="pb-4 text-[13px] leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="glass-deep grain mt-12 rounded-[26px] p-6 text-center">
          <p className="thai-heading text-xl text-foreground">ดูดวงกำเนิดของคุณฟรี</p>
          <p className="mt-2 text-[12px] text-muted-foreground">กรอกวัน เวลา และจังหวัดเกิด เพื่อคำนวณลัคนาและตำแหน่งดาวของคุณ</p>
          <Link to="/onboarding" className="press btn-gold mt-5 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-2xl text-[14px] font-semibold text-primary-foreground">
            เริ่มผูกดวงฟรี
          </Link>
        </section>
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl">
          <h2 className="thai-heading text-xl text-foreground">บทความที่เกี่ยวข้อง</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}
    </BlogLayout>
  );
}
