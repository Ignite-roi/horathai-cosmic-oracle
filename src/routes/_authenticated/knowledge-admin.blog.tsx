import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Newspaper } from "lucide-react";
import { useState } from "react";

import { KbPageHeader } from "@/components/kb/AdminKnowledgeShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminDeleteBlogPost, adminListBlogPosts, adminUpdateBlogPost } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/knowledge-admin/blog")({
  head: () => ({ meta: [{ title: "Blog Autopilot | Horathai Admin" }, { name: "description", content: "จัดการบทความจาก SEO Blog Autopilot" }, { property: "og:title", content: "Blog Autopilot | Horathai Admin" }, { property: "og:description", content: "จัดการบทความ" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: BlogAdmin,
});

type Row = Awaited<ReturnType<typeof adminListBlogPosts>>[number];
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("th-TH-u-hc-h23", { timeZone: "Asia/Bangkok" }) : "—");

function BlogAdmin() {
  const qc = useQueryClient();
  const list = useServerFn(adminListBlogPosts);
  const update = useServerFn(adminUpdateBlogPost);
  const remove = useServerFn(adminDeleteBlogPost);
  const posts = useQuery({ queryKey: ["admin-blog"], queryFn: () => list() });
  const [edit, setEdit] = useState<Row | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-blog"] });
  const save = useMutation({ mutationFn: (d: Parameters<typeof update>[0]["data"]) => update({ data: d }), onSuccess: () => { setEdit(null); void refresh(); } });
  const del = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: refresh });

  return (
    <div>
      <KbPageHeader title="Blog Autopilot" description="บทความที่ส่งเข้ามาจาก pipeline อัตโนมัติ — แก้ไข เปลี่ยนสถานะ หรือลบ (ต้องเป็น admin)" icon={Newspaper} />
      {posts.isLoading && <p className="text-sm text-muted-foreground">กำลังโหลด…</p>}
      {posts.error && <p className="text-sm text-destructive">{(posts.error as Error).message}</p>}
      {(save.error || del.error) && <p className="mb-3 text-sm text-destructive">{((save.error || del.error) as Error).message}</p>}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-left text-muted-foreground"><tr>{["Title", "Status", "Score", "Keyword", "Published", "Updated", ""].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {(posts.data ?? []).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="max-w-xs p-3"><p className="line-clamp-2 text-foreground">{p.title}</p><p className="text-[10px] text-muted-foreground">{p.slug}</p></td>
                <td className="p-3">
                  <select value={p.status} onChange={(e) => save.mutate({ id: p.id, status: e.target.value as "draft" })} className="rounded border border-border bg-background px-2 py-1">
                    {["draft", "published", "archived"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">{String((p.quality as { score?: unknown } | null)?.score ?? "—")}</td>
                <td className="p-3">{p.primary_keyword ?? "—"}</td>
                <td className="p-3 whitespace-nowrap">{fmt(p.published_at)}</td>
                <td className="p-3 whitespace-nowrap">{fmt(p.updated_at)}</td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    {p.status === "published" && <Button asChild size="sm" variant="ghost"><Link to="/blog/$slug" params={{ slug: p.slug }} target="_blank">View</Link></Button>}
                    <Button size="sm" variant="outline" onClick={() => setEdit(p)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => { if (confirm(`ลบ "${p.title}"?`)) del.mutate(p.id); }}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.data?.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">ยังไม่มีบทความ</td></tr>}
          </tbody>
        </table>
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>แก้ไขบทความ</DialogTitle>
          {edit && <EditForm row={edit} saving={save.isPending} onSave={(d) => save.mutate({ id: edit.id, ...d })} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditForm({ row, saving, onSave }: { row: Row; saving: boolean; onSave: (d: { title: string; meta_title: string | null; meta_description: string | null; content_md: string }) => void }) {
  const [title, setTitle] = useState(row.title);
  const [mt, setMt] = useState(row.meta_title ?? "");
  const [md, setMd] = useState(row.meta_description ?? "");
  const [content, setContent] = useState(row.content_md);
  return (
    <div className="space-y-3">
      <label className="block text-xs">Title<Input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="block text-xs">Meta title<Input value={mt} onChange={(e) => setMt(e.target.value)} /></label>
      <label className="block text-xs">Meta description<Textarea rows={2} value={md} onChange={(e) => setMd(e.target.value)} /></label>
      <label className="block text-xs">Content (Markdown)<Textarea rows={12} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-xs" /></label>
      <Button disabled={saving || !title.trim() || !content.trim()} onClick={() => onSave({ title, meta_title: mt || null, meta_description: md || null, content_md: content })}>บันทึก</Button>
    </div>
  );
}
