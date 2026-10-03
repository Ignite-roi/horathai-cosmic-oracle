import { Link } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import type { ReactNode } from "react";

import type { BlogCard } from "@/lib/blog.functions";

export function formatThaiDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(iso));
}

export function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center gap-5 px-5 text-[13px]">
          <Link to="/" className="display text-base text-primary">Horathai AI</Link>
          <Link to="/blog" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-primary" }}>บทความ</Link>
          <Link to="/onboarding" className="press btn-gold ml-auto rounded-full px-4 py-1.5 text-[12px] font-semibold text-primary-foreground">ดูดวงฟรี</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:py-12">{children}</main>
      <PublicFooter />
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border px-5 py-8 text-center text-[12px] text-muted-foreground">
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/" className="hover:text-foreground">หน้าแรก</Link>
        <Link to="/blog" className="hover:text-foreground">บทความ</Link>
        <Link to="/service-info" className="hover:text-foreground">ข้อมูลบริการ</Link>
        <Link to="/terms" className="hover:text-foreground">เงื่อนไข</Link>
        <Link to="/privacy" className="hover:text-foreground">ความเป็นส่วนตัว</Link>
      </div>
      <p className="mt-3">© Horathai AI — เนื้อหาเพื่อการไตร่ตรอง ไม่ใช่คำทำนายที่พิสูจน์ทางวิทยาศาสตร์</p>
    </footer>
  );
}

export function PostCard({ post }: { post: BlogCard }) {
  return (
    <Link to="/blog/$slug" params={{ slug: post.slug }} className="press surface-card group block overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {post.cover_image_url ? (
          <img src={post.cover_image_url} alt={post.cover_alt ?? post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,var(--gold),transparent_60%)] opacity-30" />
        )}
      </div>
      <div className="p-4">
        <h3 className="thai-heading line-clamp-2 text-[16px] leading-snug text-foreground">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-muted-foreground">{post.excerpt}</p>}
        <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock3 className="h-3 w-3" /> {post.reading_minutes ?? 5} นาที · {formatThaiDate(post.published_at)}
        </p>
      </div>
    </Link>
  );
}
