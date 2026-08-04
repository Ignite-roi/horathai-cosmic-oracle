import { useServerFn } from "@tanstack/react-start";
import { Link2, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createResultShare } from "@/lib/social.functions";
import type { ShareKind } from "@/lib/social.features";

export function ShareResultButton({ type, sourceId }: { type: ShareKind; sourceId?: string }) {
  const create = useServerFn(createResultShare);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const share = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await create({ data: { type, ...(sourceId ? { sourceId } : {}), expiresInDays: 7 } });
      const url = `${window.location.origin}/r/${result.token}`;
      if (navigator.share) await navigator.share({ title: result.title, text: "ผลอ่าน Horathai แบบอ่านอย่างเดียว", url });
      else await navigator.clipboard.writeText(url);
      setMessage("สร้างลิงก์แล้ว · หมดอายุใน 7 วัน");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "สร้างลิงก์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };
  return <div><Button variant="outline" className="h-12 w-full gap-2" disabled={busy} onClick={() => void share()}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} แชร์ลิงก์อ่านอย่างเดียว</Button>{message && <p className="mt-2 text-center text-[10px] text-muted-foreground">{message}</p>}</div>;
}