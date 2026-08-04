import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

/**
 * Shown when the visitor has no saved birth profile. The composition below is
 * calculated from a fixed sample birth and is never written to the database.
 */
export function TransitDemoBanner() {
  return (
    <section className="surface-card grain relative overflow-hidden p-5">
      <span
        aria-hidden
        className="absolute -left-8 -top-10 h-28 w-28 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 24%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <span className="gold-hairline inline-flex rounded-full px-2 py-1 text-[9.5px] tracking-wide text-[var(--gold)]">
          ดวงสาธิต
        </span>
        <h2 className="thai-heading mt-2 text-[16px] text-foreground">
          กำลังดูดาวย้ายจากดวงตัวอย่าง ยังไม่ใช่ดวงของคุณ
        </h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          คุณเลื่อนเวลาและดูดาวย้ายได้ครบทุกฟังก์ชันในช่วงพัฒนา ระบบไม่บันทึกดวงสาธิตนี้ไว้
          การเข้าสู่ระบบด้วย LINE ใช้เพื่อบันทึกดวงถาวรและซิงก์ข้ามอุปกรณ์เท่านั้น
        </p>
        <Link
          to="/onboarding"
          className="press gold-metal mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          สร้างดวงจริงของฉัน
        </Link>
      </div>
    </section>
  );
}
