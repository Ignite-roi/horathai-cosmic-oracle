import { LogIn, ShieldCheck } from "lucide-react";

import { PUBLIC_REVIEW_MODE } from "@/config/public-review";
import { useLineAuth } from "@/context/LineAuthContext";
import { readGuestBirthContext } from "@/lib/guest-birth";

export function ReviewModeBanner() {
  const { isSignedIn, login } = useLineAuth();
  if (!PUBLIC_REVIEW_MODE || isSignedIn) return null;
  const hasTemporaryChart = readGuestBirthContext() !== null;

  return (
    <aside className="mb-4 rounded-xl border border-primary/25 bg-card/75 px-3 py-2.5 backdrop-blur-xl">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] leading-5 text-foreground">
            {hasTemporaryChart
              ? "ดวงชั่วคราว — ยังไม่ได้บันทึก ข้อมูลจะหายเมื่อปิดแท็บ"
              : "โหมดผู้เยี่ยมชม — หากยังไม่กรอกข้อมูล ระบบจะแสดงดวงตัวอย่างพร้อมป้ายกำกับ"}
          </p>
          <button
            type="button"
            onClick={() => void login()}
            className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary"
          >
            <LogIn className="h-3.5 w-3.5" /> เข้าสู่ระบบด้วย LINE
          </button>
        </div>
      </div>
    </aside>
  );
}
