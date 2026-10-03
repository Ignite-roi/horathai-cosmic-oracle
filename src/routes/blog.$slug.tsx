import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { BlogLayout, PostCard, formatThaiDate } from "@/components/blog/BlogUI";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE_URL, getPublishedPost } from "@/lib/blog.functions";

const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["blog", "post", slug], queryFn: () => getPublishedPost({ data: { slug } }), staleTime: 60_000 });

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}
const headingId = (t: string) => t.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQuery(params.slug)),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "ไม่พบบทความ | Horathai AI" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.post;
    const title = p.meta_title || `${p.title} | Horathai AI`;
    const desc = p.meta_description || p.excerpt || "";
    const url = `${SITE_URL}/blog/${params.slug}`;
    const img = p.cover_image_url?.startsWith("https://") ? p.cover_image_url : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
        ...(p.published_at ? [{ property: "article:published_time", content: p.published_at }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p.schema_jsonld.map((s) => ({ type: "application/ld+json", children: JSON.stringify(s) })),
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
              a: ({ href, children }) =>
                href?.startsWith("/") && !href.startsWith("//") ? (
                  <Link to={href}>{children}</Link>
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
            <Accordion type="single" collapsible className="mt-3">
              {post.faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-[14px]">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
