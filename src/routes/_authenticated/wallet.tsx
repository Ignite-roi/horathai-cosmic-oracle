import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, CircleDollarSign, Clock3, Coins, CreditCard, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useLineAuth } from "@/context/LineAuthContext";
import { useWallet } from "@/hooks/useWallet";
import { completeMockCheckout } from "@/lib/wallet.functions";
import { formatThaiBuddhistDate, packageTotalDays, pricePerDay, transactionLabel, type WalletPackage } from "@/lib/wallet";

const SearchSchema = z.object({
  checkout: z.enum(["packages"]).optional(),
  returnTo: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/wallet")({
  validateSearch: (search) => SearchSchema.parse(search),
  head: () => ({ meta: [
    { title: "กระเป๋าวันใช้งาน | Horathai AI" },
    { name: "description", content: "ดูวันใช้งาน แต้มสะสม ประวัติ และเติมวันสำหรับ Horathai AI" },
    { property: "og:title", content: "กระเป๋าวันใช้งาน | Horathai AI" },
    { property: "og:description", content: "จัดการวันใช้งานและแต้มสะสมของคุณ" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WalletPage,
});

const STEPS = ["แพ็กเกจ", "ส่วนลด", "วิธีจ่าย", "ชำระเงิน"];

function WalletPage() {
  const { checkout, returnTo } = Route.useSearch();
  const { data, isLoading, isSignedIn } = useWallet();
  const { login } = useLineAuth();
  const [step, setStep] = useState(checkout ? 1 : 0);
  const [selected, setSelected] = useState<WalletPackage | null>(null);
  const [points, setPoints] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const complete = useServerFn(completeMockCheckout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (checkout && data.packages.length > 0 && !selected) {
      setSelected(data.packages.find((item) => item.is_popular) ?? data.packages[0] ?? null);
    }
  }, [checkout, data.packages, selected]);

  const discount = Math.floor(points / 10);
  const payable = Math.max(0, (selected?.price_thb ?? 0) - discount);
  const maxPoints = Math.min(data.points, (selected?.price_thb ?? 0) * 10);
  const bestCode = useMemo(() => [...data.packages].sort((a, b) => pricePerDay(a) - pricePerDay(b))[0]?.code, [data.packages]);

  const pay = async () => {
    if (!selected) return;
    setProcessing(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      await complete({ data: { packageCode: selected.code, pointsToUse: points } });
      await queryClient.invalidateQueries({ queryKey: ["wallet"] });
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) window.location.assign(returnTo);
      else void navigate({ to: "/wallet", search: { checkout: undefined, returnTo: undefined }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ชำระเงินจำลองไม่สำเร็จ");
      setProcessing(false);
    }
  };

  if (processing) return <ProcessingScreen />;

  return (
    <AppShell><PageTransition>
      {step === 0 ? (
        <>
          <SectionTitle kicker="Day Wallet" title="กระเป๋าวันใช้งาน" right={<Button size="sm" className="btn-gold rounded-full" onClick={() => setStep(1)}>เติมวัน</Button>} />
          {!isSignedIn ? (
            <section className="surface-hero grain p-7 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
              <h1 className="thai-heading mt-4 text-xl text-gold">เก็บวันใช้งานไว้กับบัญชีคุณ</h1>
              <p className="mt-2 text-[12px] leading-6 text-muted-foreground">เข้าสู่ระบบด้วย LINE เพื่อดูยอด เติมวัน และเก็บประวัติอย่างปลอดภัย</p>
              <Button className="btn-gold mt-5 h-12 w-full rounded-2xl" onClick={() => void login()}>เข้าสู่ระบบด้วย LINE</Button>
            </section>
          ) : (
            <>
              <section className="surface-hero grain relative overflow-hidden p-6">
                <p className="eyebrow">Available days</p>
                <p className="display mt-2 text-5xl text-gold">{data.daysRemaining.toLocaleString("th-TH")} <span className="text-xl">วัน</span></p>
                <p className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground"><Clock3 className="h-4 w-4 text-primary" /> ใช้ได้ถึง {formatThaiBuddhistDate(data.expiresAt)}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="flex items-center gap-2 text-[12px] text-muted-foreground"><Coins className="h-4 w-4 text-warning" /> แต้มสะสม</span><strong className="numeral text-gold">{data.points.toLocaleString("th-TH")} แต้ม</strong></div>
              </section>
              <Button asChild variant="outline" className="mt-4 h-12 w-full rounded-2xl bg-background/45"><Link to="/invite">ชวนเพื่อนรับแต้ม <ChevronRight /></Link></Button>
              <SectionTitle kicker="History" title="ประวัติวันใช้งาน" />
              <div className="space-y-2.5">
                {isLoading ? <p className="py-8 text-center text-xs text-muted-foreground">กำลังโหลด…</p> : data.transactions.length === 0 ? <p className="surface-card p-5 text-center text-xs text-muted-foreground">ยังไม่มีประวัติการรับหรือใช้วัน</p> : data.transactions.map((item) => (
                  <div key={item.id} className="surface-card flex items-center gap-3 p-4">
                    <span className="surface-inset grid h-10 w-10 place-items-center"><CircleDollarSign className="h-4 w-4 text-primary" /></span>
                    <div className="min-w-0 flex-1"><p className="text-[13px] text-foreground">{transactionLabel(item.type)}</p><p className="truncate text-[10px] text-muted-foreground">{item.note ?? new Intl.DateTimeFormat("th-TH-u-ca-buddhist", { dateStyle: "medium" }).format(new Date(item.created_at))}</p></div>
                    <span className={`numeral text-sm ${item.days > 0 ? "text-primary" : "text-destructive"}`}>{item.days > 0 ? "+" : ""}{item.days.toLocaleString("th-TH")} วัน</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <section>
          <div className="mb-5 flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => step === 1 ? setStep(0) : setStep((value) => value - 1)} aria-label="ย้อนกลับ"><ArrowLeft /></Button><div><p className="eyebrow">Checkout</p><h1 className="thai-heading text-xl text-gold">เติมวันใช้งาน</h1></div></div>
          <div className="mb-6 grid grid-cols-4 gap-1">{STEPS.map((label, index) => <div key={label} className="text-center"><div className={`mx-auto grid h-7 w-7 place-items-center rounded-full border text-[10px] ${step >= index + 1 ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>{step > index + 1 ? <Check className="h-3.5 w-3.5" /> : index + 1}</div><p className="mt-1 text-[9px] text-muted-foreground">{label}</p></div>)}</div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              {step === 1 && <PackageStep items={data.packages} selected={selected} bestCode={bestCode} onSelect={setSelected} />}
              {step === 2 && <PointsStep balance={data.points} value={points} max={maxPoints} discount={discount} onChange={setPoints} />}
              {step === 3 && <PaymentStep />}
              {step === 4 && selected && <ReviewStep item={selected} points={points} discount={discount} payable={payable} />}
            </motion.div>
          </AnimatePresence>
          {error && <p className="mt-4 text-center text-xs text-destructive">{error}</p>}
          <Button className="btn-gold mt-6 h-13 w-full rounded-2xl" disabled={!selected || !isSignedIn} onClick={() => step < 4 ? setStep(step + 1) : void pay()}>{step < 4 ? "ถัดไป" : `ชำระ ฿${payable.toLocaleString("th-TH")} (จำลอง)`}</Button>
          {!isSignedIn && <Button variant="outline" className="mt-3 h-12 w-full rounded-2xl" onClick={() => void login()}>เข้าสู่ระบบเพื่อเติมวัน</Button>}
        </section>
      )}
    </PageTransition></AppShell>
  );
}

function PackageStep({ items, selected, bestCode, onSelect }: { items: WalletPackage[]; selected: WalletPackage | null; bestCode?: string; onSelect: (item: WalletPackage) => void }) {
  return <div className="space-y-3">{items.map((item) => <Button key={item.code} variant="outline" onClick={() => onSelect(item)} className={`relative h-auto w-full justify-start whitespace-normal rounded-2xl p-4 text-left ${selected?.code === item.code ? "border-primary bg-primary/10" : "bg-background/45"}`}><div className="flex w-full items-center gap-3"><span className="gold-metal grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm">{packageTotalDays(item)}</span><span className="min-w-0 flex-1"><strong className="block text-[14px] text-foreground">{item.name_th}</strong><small className="text-[10px] text-muted-foreground">฿{pricePerDay(item).toFixed(2)}/วัน {item.bonus_days > 0 ? `· โบนัส ${item.bonus_days} วัน` : ""}</small></span><span className="numeral text-base text-gold">฿{item.price_thb.toLocaleString("th-TH")}</span></div>{item.code === bestCode && <span className="absolute -top-2 right-3 rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold text-primary-foreground">คุ้มที่สุด</span>}</Button>)}</div>;
}

function PointsStep({ balance, value, max, discount, onChange }: { balance: number; value: number; max: number; discount: number; onChange: (value: number) => void }) {
  return <section className="surface-card p-5"><Coins className="h-6 w-6 text-warning" /><h2 className="thai-heading mt-3 text-lg text-gold">ใช้แต้มเป็นส่วนลด</h2><p className="mt-1 text-xs text-muted-foreground">มี {balance.toLocaleString("th-TH")} แต้ม · ทุก 10 แต้มลด 1 บาท</p><input className="mt-6 w-full accent-[var(--gold)]" type="range" min={0} max={max} step={10} value={value} onChange={(event) => onChange(Number(event.target.value))} /><div className="mt-3 flex justify-between text-xs"><span>{value.toLocaleString("th-TH")} แต้ม</span><span className="text-primary">ลด ฿{discount.toLocaleString("th-TH")}</span></div></section>;
}

function PaymentStep() { return <section className="surface-card p-5"><p className="eyebrow">Mock provider</p><div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary bg-primary/10 p-4"><CreditCard className="h-5 w-5 text-primary" /><div className="flex-1"><p className="text-sm text-foreground">ระบบชำระเงินจำลอง</p><p className="text-[10px] text-muted-foreground">ไม่ตัดเงินจริง · พร้อมเปลี่ยน provider ภายหลัง</p></div><Check className="h-4 w-4 text-primary" /></div></section>; }

function ReviewStep({ item, points, discount, payable }: { item: WalletPackage; points: number; discount: number; payable: number }) { return <section className="surface-hero grain p-5"><Sparkles className="h-6 w-6 text-primary" /><h2 className="thai-heading mt-3 text-xl text-gold">ตรวจสอบการเติมวัน</h2><dl className="mt-5 space-y-3 text-xs"><div className="flex justify-between"><dt className="text-muted-foreground">แพ็กเกจ</dt><dd>{item.name_th}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">วันได้รับทั้งหมด</dt><dd>{packageTotalDays(item)} วัน</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">ใช้แต้ม</dt><dd>{points.toLocaleString("th-TH")} แต้ม</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">ส่วนลด</dt><dd>-฿{discount.toLocaleString("th-TH")}</dd></div><div className="flex justify-between border-t border-border pt-3 text-base"><dt>ยอดชำระ</dt><dd className="text-gold">฿{payable.toLocaleString("th-TH")}</dd></div></dl></section>; }

function ProcessingScreen() { return <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /><h1 className="thai-heading mt-6 text-2xl text-gold">กำลังเติมวันเข้าสู่จักรวาลของคุณ</h1><p className="mt-2 text-xs text-muted-foreground">กำลังยืนยันรายการและพากลับไปยังหน้าที่คุณค้างไว้…</p></div>; }