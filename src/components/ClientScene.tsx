import { Suspense, lazy } from "react";

import { useHydrated, useQuality } from "@/hooks/useQuality";
import type { SolarSystemProps } from "./cosmos/SolarSystem3D";

const SolarSystem3D = lazy(() => import("./cosmos/SolarSystem3D"));

function Fallback({ label = "กำลังเรียงดาว…" }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-orbit-spin rounded-full border border-dashed border-primary/40" />
        <div className="absolute inset-0 m-auto h-10 w-10 animate-pulse-glow rounded-full bg-[radial-gradient(circle,var(--gold),transparent_70%)]" />
      </div>
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

/** Hydration-safe, capability-aware 3D chart. */
export function SolarSystemClient(props: SolarSystemProps) {
  const hydrated = useHydrated();
  const { quality } = useQuality();
  if (!hydrated) return <Fallback />;
  return (
    <Suspense fallback={<Fallback />}>
      <SolarSystem3D {...props} lowPower={quality === "battery"} />
    </Suspense>
  );
}
