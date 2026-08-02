import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { ZodiacWheelClient } from "@/components/ClientScene";
import { HOUSES, buildChart, type PlacedPlanet } from "@/lib/astro";
import { seedKey, useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/chart")({
  head: () => ({
    meta: [
      { title: "ผังดวงกำเนิด 3 มิติ | Horathai AI" },
      { name: "description", content: "สำรวจผังดวงกำเนิดแบบสามมิติ ราศี เรือนชะตา และตำแหน่งดาวพระเคราะห์ไทย" },
      { property: "og:title", content: "ผังดวงกำเนิด 3 มิติ | Horathai AI" },
      { property: "og:description", content: "จักรราศีหมุนได้ พร้อมความหมายดาวแต่ละดวงในเรือนชะตาของคุณ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChartPage,
});

function ChartPage() {
  const profile = useProfile();
  const planets = useMemo(() => buildChart(seedKey(profile) || "guest"), [profile]);
  const [selected, setSelected] = useState<PlacedPlanet | null>(null);

  return (
    <AppShell>
      <PageTransition>
        <SectionTitle kicker="Birth Chart" title="ผังดวงกำเนิดของคุณ" />
        <div className="relative h-[420px] w-full overflow-hidden rounded-[28px] border border-primary/15 bg-[radial-gradient(70%_60%_at_50%_50%,oklch(0.24_0.12_305/60%),transparent_70%)]">
          <ZodiacWheelClient planets={planets} selected={selected} onSelect={setSelected} />
          <p className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-[11px] text-muted-foreground">
            แตะดาวเพื่อดูความหมาย
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {planets.map((p, i) => (
            <motion.button
              key={p.num}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(p)}
              className="glass rounded-2xl p-3 text-left"
            >
              <span
                className="mb-2 block h-2.5 w-2.5 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }}
              />
              <p className="text-[13px] font-medium text-foreground">{p.th}</p>
              <p className="text-[10px] text-muted-foreground">
                ราศี{p.sign.th} {p.degree}°
              </p>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              key="sheet"
              className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                className="glass w-full max-w-lg rounded-t-[28px] p-6 pb-10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-10 w-10 rounded-full"
                      style={{ background: selected.color, boxShadow: `0 0 26px ${selected.color}` }}
                    />
                    <div>
                      <h3 className="display text-xl font-semibold text-foreground">
                        {selected.th} ({selected.num})
                      </h3>
                      <p className="text-[11px] text-muted-foreground">{selected.meaning}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="rounded-full bg-muted p-2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {[
                    ["ตำแหน่ง", `ราศี${selected.sign.th} ${selected.degree}°`],
                    ["ธาตุราศี", selected.sign.element],
                    ["เรือนชะตา", `เรือน ${selected.house} · ${HOUSES[selected.house - 1]}`],
                    ["อิทธิพล", selected.influence],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl border border-border bg-card/50 p-3">
                      <p className="text-[10px] text-muted-foreground">{k}</p>
                      <p className="mt-1 text-[13px] text-foreground">{v}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 p-4 text-[12px] leading-relaxed text-foreground/90">
                  ดาว{selected.th}สถิตในเรือน{HOUSES[selected.house - 1]} ส่งผลให้เรื่อง
                  {selected.influence}เด่นชัดในช่วงนี้ ควรใช้จังหวะดาวนี้ตัดสินใจเรื่องสำคัญ
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}