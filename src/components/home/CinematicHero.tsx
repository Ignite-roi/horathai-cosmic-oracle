import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { AstrologerHero } from "@/components/brand/AstrologerHero";
import { HeroOrrery } from "@/components/home/HeroOrrery";
import { KanokCorner, ThaiFrame } from "@/components/thai/Ornaments";
import { PlanetGlyph } from "@/components/thai/PlanetGlyph";
import type { PlacedPlanet } from "@/lib/astro";

export function CinematicHero({
  planets,
  ascendant,
  activePlanet,
  isDemo,
}: {
  planets: PlacedPlanet[];
  ascendant: number;
  activePlanet?: PlacedPlanet | undefined;
  isDemo: boolean;
}) {
  return (
    <section className="surface-hero grain relative overflow-hidden">
      <ThaiFrame />
      <KanokCorner position="tl" size={92} opacity={0.24} />
      <KanokCorner position="br" size={92} opacity={0.16} />

      {/* stage: orrery behind, astrologer in front */}
      <div className="relative h-[248px] w-full sm:h-[286px]">
        <div className="pointer-events-none absolute left-1/2 top-2 h-[250px] w-[250px] -translate-x-1/2 opacity-80 sm:h-[290px] sm:w-[290px]">
          <HeroOrrery planets={planets} ascendant={ascendant} {...(activePlanet ? { activeNum: activePlanet.num } : {})} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-1/2 w-[168px] -translate-x-1/2 sm:w-[190px]"
        >
          <AstrologerHero variant="hero" priority className="drop-shadow-[0_24px_48px_oklch(0_0_0/0.7)]" />
        </motion.div>

        {activePlanet && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="surface-inset absolute left-3 top-4 flex items-center gap-2 px-2.5 py-2"
          >
            <PlanetGlyph num={activePlanet.num} size={30} active />
            <span className="text-[11px] leading-tight text-foreground/85">
              ดาว{activePlanet.th}
              <br />
              <span className="text-muted-foreground">ราศี{activePlanet.signTh}</span>
            </span>
          </motion.div>
        )}

        {isDemo && (
          <span className="gold-hairline absolute right-3 top-4 rounded-full px-2.5 py-1 text-[10px] tracking-wide text-[var(--gold)]">
            ตัวอย่างการแสดงผล
          </span>
        )}
      </div>

      <div className="relative px-5 pb-6">
        <h1 className="thai-heading text-center text-[25px] leading-[1.28] text-foreground">
          ดาวย้ายครั้งนี้
          <br />
          <span className="text-gold">เปลี่ยนดวงคุณด้านไหน</span>
        </h1>
        <p className="mx-auto mt-3 max-w-[19rem] text-center text-[12.5px] leading-relaxed text-muted-foreground">
          วิเคราะห์จากวัน เวลา และสถานที่เกิดของคุณ
          <br />
          ด้วยหลักโหราศาสตร์ไทยและ AI
        </p>

        <div className="mt-5 space-y-2.5">
          <Link
            to={isDemo ? "/onboarding" : "/chart"}
            className="press gold-metal flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            {isDemo ? "กรอกวันเกิดเพื่อเปิดดวงของฉัน" : "เปิดดวงของฉัน"}
          </Link>
          <Link
            to="/transit"
            className="press surface-inset flex h-12 w-full items-center justify-center gap-2 text-[13.5px] text-foreground"
          >
            ดูดาวที่กำลังส่งผล
            <ArrowUpRight className="h-4 w-4 text-[var(--gold)]" />
          </Link>
        </div>
      </div>
    </section>
  );
}