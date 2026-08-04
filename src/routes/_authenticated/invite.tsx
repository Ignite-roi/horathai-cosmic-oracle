import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Copy, Gift, MessageCircle, Share2, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useLineAuth } from "@/context/LineAuthContext";
import { useWallet } from "@/hooks/useWallet";

export const Route = createFileRoute("/_authenticated/invite")({
  head: () => ({ meta: [
    { title: "ชวนเพื่อนรับแต้ม | Horathai AI" },
    { name: "description", content: "แชร์โค้ดแนะนำเพื่อนและรับแต้ม Horathai เมื่อเพื่อนผ่านเงื่อนไข" },
    { property: "og:title", content: "ชวนเพื่อนรับแต้ม | Horathai AI" },
    { property: "og:description", content: "ชวนเพื่อนมาสำรวจดวงและรับแต้มสะสม" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: InvitePage,
});

function InvitePage() {
  const { data, isSignedIn } = useWallet();
  const { login } = useLineAuth();
  const [copied, setCopied] = useState(false);
  const text = `มาสำรวจดวงกับ Horathai AI ใช้โค้ดแนะนำ ${data.referralCode ?? ""}`;
  const share = async () => {
    if (navigator.share) await navigator.share({ title: "Horathai AI", text, url: window.location.origin });
    else await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
  };
  const copy = async () => { if (!data.referralCode) return; await navigator.clipboard.writeText(data.referralCode); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <AppShell><PageTransition>
    <SectionTitle kicker="Referral" title="ชวนเพื่อนเดินทางดูดาว" />
    <section className="surface-hero grain p-6 text-center">
      <span className="gold-metal mx-auto grid h-14 w-14 place-items-center rounded-2xl"><Gift className="h-6 w-6" /></span>
      <p className="mt-5 text-xs text-muted-foreground">โค้ดแนะนำเพื่อนของคุณ</p>
      <p className="numeral mt-2 text-3xl text-gold">{isSignedIn ? data.referralCode ?? "กำลังสร้าง…" : "••••••••••••"}</p>
      {isSignedIn ? <div className="mt-5 grid grid-cols-2 gap-3"><Button variant="outline" className="h-12 rounded-2xl bg-background/45" onClick={() => void copy()}>{copied ? <CheckCircle2 /> : <Copy />} {copied ? "คัดลอกแล้ว" : "คัดลอกโค้ด"}</Button><Button className="h-12 rounded-2xl bg-[#06C755] text-white hover:bg-[#06C755]/90" onClick={() => void share()}><MessageCircle /> แชร์ผ่าน LINE</Button></div> : <Button className="btn-gold mt-5 h-12 w-full rounded-2xl" onClick={() => void login()}>เข้าสู่ระบบเพื่อรับโค้ด</Button>}
    </section>
    <SectionTitle kicker="How it works" title="ได้แต้มเมื่อไหร่" />
    <div className="space-y-3">{[
      { icon: Share2, title: "ส่งโค้ดให้เพื่อน", text: "แชร์โค้ด 12 หลักผ่าน LINE หรือช่องทางที่คุณสะดวก" },
      { icon: UserPlus, title: "เพื่อนสมัครและผูกดวง", text: "ระบบบันทึกการแนะนำหลังเพื่อนเข้าสู่ระบบและสร้างดวงของตนเอง" },
      { icon: Sparkles, title: "รับแต้มเมื่อผ่านเงื่อนไข", text: "เมื่อรายการมีสถานะสำเร็จ แต้มจะเข้ากระเป๋าโดยระบบเท่านั้น ป้องกันการรับซ้ำ" },
    ].map(({ icon: Icon, title, text }, index) => <div key={title} className="surface-card flex gap-4 p-4"><span className="surface-inset grid h-10 w-10 shrink-0 place-items-center"><Icon className="h-4 w-4 text-primary" /></span><div><p className="text-[13px] text-foreground">{index + 1}. {title}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{text}</p></div></div>)}</div>
    <section className="mt-5 rounded-2xl border border-primary/25 bg-primary/8 p-5"><h2 className="thai-heading text-base text-gold">แต้มใช้ทำอะไรได้</h2><p className="mt-2 text-[11px] leading-5 text-muted-foreground">ใช้เป็นส่วนลดตอนเติมวันใช้งาน โดยทุก 10 แต้มลด 1 บาท ระบบจะหักแต้มพร้อมเพิ่มวันในรายการเดียวอย่างปลอดภัย</p></section>
  </PageTransition></AppShell>;
}