import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { APP_ACCESS_MODE } from "@/config/access";
import { getLiffDiagnostics } from "@/lib/line-auth.functions";
import { useQuery } from "@tanstack/react-query";

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
      {
        property: "og:description",
        content: "ผูกดวงกำเนิดตามหลักสุริยยาตร์ ดูดาวย้าย และปรึกษาโหร AI ผ่าน LINE",
      },
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
        <div
          className="absolute inset-3 animate-orbit-spin rounded-full border border-primary/20"
          style={{ animationDirection: "reverse" }}
        />
        <div className="absolute inset-0 m-auto h-8 w-8 animate-pulse-glow rounded-full bg-[radial-gradient(circle,var(--gold),transparent_70%)]" />
      </div>
      <p className="mt-6 text-[12px] tracking-[0.24em] text-muted-foreground">{label}</p>
    </>
  );
}

/** Safe, secret-free diagnostics. Only rendered while access is unlocked. */
function Diagnostics() {
  const [open, setOpen] = useState(false);
  const { status, liffError, inLine, initialized, lineLoggedIn, configured, diagnostics } =
    useLineAuth();
  const { data: server } = useQuery({
    queryKey: ["liff-diagnostics"],
    queryFn: () => getLiffDiagnostics(),
    staleTime: 60_000,
    enabled: APP_ACCESS_MODE === "development_unlocked",
  });

  if (APP_ACCESS_MODE !== "development_unlocked") return null;

  const rows: Array<[string, string]> = [
    ["LIFF ID loaded", configured ? "yes" : "no"],
    ["Masked LIFF ID", server?.maskedLiffId ?? "—"],
    ["LIFF ID format valid", server ? (server.liffIdLooksValid ? "yes" : "no") : "—"],
    ["Login channel id", server ? (server.hasLoginChannelId ? "yes" : "no") : "—"],
    [
      "Login channel matches LIFF",
      server ? (server.loginChannelMatchesLiffPrefix ? "yes" : "no") : "—",
    ],
    ["Channel secret", server ? (server.hasChannelSecret ? "yes" : "no") : "—"],
    ["Bridge secret", server ? (server.hasBridgeSecret ? "yes" : "no") : "—"],
    ["Access mode", server?.accessMode ?? APP_ACCESS_MODE],
    ["Origin", typeof window === "undefined" ? "—" : window.location.origin],
    ["Path", typeof window === "undefined" ? "—" : window.location.pathname],
    ["Inside LINE", inLine ? "yes" : "no"],
    ["LIFF initialized", initialized ? "yes" : "no"],
    ["LINE logged in", lineLoggedIn ? "yes" : "no"],
    ["Has ID token", diagnostics.hasIdToken ? "yes" : "no"],
    ["Has decoded ID token", diagnostics.hasDecodedIdToken ? "yes" : "no"],
    ["Context type", diagnostics.contextType],
    ["Provider status", status],
    ["Error code", liffError?.code ?? "—"],
    ["Error message", liffError?.message ?? "—"],
  ];

  return (
    <div className="mt-6 text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="press inline-flex w-full items-center justify-between rounded-2xl border border-primary/20 px-4 py-2.5 text-[11px] tracking-[0.16em] text-muted-foreground"
      >
        DIAGNOSTICS
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <dl className="mt-2 space-y-1 rounded-2xl border border-primary/10 bg-black/30 px-4 py-3 text-[11px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="max-w-[60%] truncate text-right text-foreground/90">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Entry() {
  const navigate = useNavigate();
  const {
    status,
    error,
    liffError,
    isSignedIn,
    login,
    retry,
    inLine,
    needsReauthorization,
    reauthorize,
  } = useLineAuth();
  const { data: account } = useAccount();

  useEffect(() => {
    if (!isSignedIn || !account) return;
    const done = account.profile?.onboarding_completed;
    void navigate({ to: done ? "/dashboard" : "/onboarding", replace: true });
  }, [isSignedIn, account, navigate]);

  if (isSignedIn)
    return (
      <Shell>
        <Orb label="กำลังเข้าสู่แอป…" />
      </Shell>
    );

  if (status === "idle" || status === "loading_config")
    return (
      <Shell>
        <Orb label="กำลังเริ่มระบบ…" />
      </Shell>
    );
  if (status === "initializing")
    return (
      <Shell>
        <Orb label="กำลังเชื่อมต่อ LINE…" />
      </Shell>
    );
  if (status === "signing_in")
    return (
      <Shell>
        <Orb label="กำลังยืนยันตัวตนกับ LINE…" />
      </Shell>
    );

  const isConfigError = status === "configuration_error";

  if (needsReauthorization)
    return (
      <Shell>
        <h1 className="display text-2xl text-foreground">ต้องอนุญาต LINE ใหม่</h1>
        <div className="mt-5 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-4 text-left text-[12px] leading-relaxed text-foreground">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              LINE เข้าสู่ระบบให้แล้ว แต่ยังไม่ได้มอบสิทธิ์ข้อมูลโปรไฟล์ (openid) ให้แอปนี้
              ระบบจึงยังยืนยันตัวตนของคุณไม่ได้ กรุณากดปุ่มด้านล่างเพื่ออนุญาตใหม่อีกครั้ง
            </span>
          </p>
          <p className="mt-2 text-[10px] tracking-[0.12em] text-muted-foreground">
            {liffError?.code ?? "LINE_ID_TOKEN_MISSING"}
          </p>
        </div>

        <button
          onClick={() => void reauthorize()}
          className="press btn-gold mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl text-[14px] font-semibold text-primary-foreground"
        >
          อนุญาต LINE ใหม่
        </button>

        {APP_ACCESS_MODE === "development_unlocked" && (
          <Link
            to="/transit"
            className="press mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-primary/30 text-[13px] text-foreground"
          >
            สำรวจแบบผู้เยี่ยมชมก่อน
          </Link>
        )}

        <Diagnostics />
      </Shell>
    );

  return (
    <Shell>
      <h1 className="display text-2xl text-foreground">Horathai AI</h1>
      <p className="mt-2 text-[12px] tracking-[0.2em] text-primary/80">โหราศาสตร์ไทยด้วย AI</p>

      {!inLine && (
        <p className="mt-5 flex items-center justify-center gap-2 text-[12px] leading-relaxed text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5 text-primary" />
          คุณกำลังเปิดผ่านเว็บเบราว์เซอร์ ใช้งานได้ตามปกติ — แนะนำให้เปิดผ่านแอป LINE
          เพื่อประสบการณ์ที่สมบูรณ์
        </p>
      )}

      {error && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-[12px] text-foreground ${
            isConfigError
              ? "border-primary/40 bg-primary/10"
              : "border-destructive/40 bg-destructive/10"
          }`}
        >
          <p className="flex items-start gap-2 text-left leading-relaxed">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{error}</span>
          </p>
          {liffError && (
            <p className="mt-1 text-left text-[10px] tracking-[0.12em] text-muted-foreground">
              {liffError.code}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => void login()}
        className="press btn-gold mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl text-[14px] font-semibold text-primary-foreground"
      >
        เข้าสู่ระบบด้วย LINE
      </button>

      {(status === "initialization_error" || status === "configuration_error") && (
        <button
          onClick={() => void retry()}
          className="press mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 text-[13px] text-foreground"
        >
          <RefreshCw className="h-4 w-4" /> ลองใหม่อีกครั้ง
        </button>
      )}

      <Diagnostics />
    </Shell>
  );
}
