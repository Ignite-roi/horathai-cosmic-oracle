import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { LiveUniverse } from "@/components/cosmos/LiveUniverse";
import { useAccount } from "@/hooks/useAuth";
import { useLineAuth } from "@/context/LineAuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Horathai AI — โหราศาสตร์ไทยด้วย AI" },
      {
        name: "description",
        content: "ผูกดวงกำเนิดตามหลักสุริยยาตร์ ดูดาวย้าย และปรึกษาโหร AI ผ่าน LINE",
      },
      { property: "og:title", content: "Horathai AI — โหราศาสตร์ไทยด้วย AI" },
      { property: "og:description", content: "ผูกดวงกำเนิด ดาวย้าย และโหร AI ในแอปเดียว" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entry,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <LiveUniverse />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        {children}
      </motion.div>
    </div>
  );
}

function Orb({ label }: { label: string }) {
  return (
    <>
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 animate-orbit-spin rounded-full border border-dashed border-primary/40" />
        <div className="absolute inset-3 animate-orbit-spin rounded-full border border-primary/20" style={{ animationDirection: "reverse" }} />
        <div className="absolute inset-0 m-auto h-8 w-8 animate-pulse-glow rounded-full bg-[radial-gradient(circle,var(--gold),transparent_70%)]" />
      </div>
      <p className="mt-6 text-[12px] tracking-[0.24em] text-muted-foreground">{label}</p>
    </>
  );
}

function Entry() {
  const navigate = useNavigate();
  const { status, error, isSignedIn, login, retry, configured } = useLineAuth();
  const { data: account } = useAccount();

  useEffect(() => {
    if (!isSignedIn || !account) return;
    const done = account.profile?.onboarding_completed;
    void navigate({ to: done ? "/dashboard" : "/onboarding", replace: true });
  }, [isSignedIn, account, navigate]);

  if (isSignedIn) return <Shell><Orb label="กำลังเข้าสู่แอป…" /></Shell>;

  if (status === "idle" || status === "booting") return <Shell><Orb label="กำลังเริ่มระบบ…" /></Shell>;
  if (status === "verifying") return <Shell><Orb label="กำลังยืนยันตัวตนกับ LINE…" /></Shell>;

  if (status === "unconfigured" || !configured) {
    return (
      <Shell>
        <AlertTriangle className="mx-auto h-8 w-8 text-primary" />
        <h1 className="display mt-4 text-xl text-foreground">ยังไม่ได้ตั้งค่า LIFF</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          ผู้ดูแลระบบต้องตั้งค่า LIFF ID ก่อนจึงจะเข้าใช้งานผ่าน LINE ได้
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="display text-2xl text-foreground">Horathai AI</h1>
      <p className="mt-2 text-[12px] tracking-[0.2em] text-primary/80">โหราศาสตร์ไทยด้วย AI</p>

      {status === "external" && (
        <p className="mt-5 flex items-center justify-center gap-2 text-[12px] leading-relaxed text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5 text-primary" />
          แนะนำให้เปิดผ่านแอป LINE เพื่อประสบการณ์ที่สมบูรณ์
        </p>
      )}

      {status === "error" && error && (
        <p className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[12px] text-foreground">
          {error}
        </p>
      )}

      <button
        onClick={() => void login()}
        className="press btn-gold mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl text-[14px] font-semibold text-primary-foreground"
      >
        เข้าสู่ระบบด้วย LINE
      </button>

      {status === "error" && (
        <button
          onClick={() => void retry()}
          className="press mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 text-[13px] text-foreground"
        >
          <RefreshCw className="h-4 w-4" /> ลองใหม่อีกครั้ง
        </button>
      )}
    </Shell>
  );
}