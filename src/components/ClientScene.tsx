import { Suspense, lazy, useEffect, useState, type ComponentType } from "react";

const CosmicScene = lazy(() => import("./cosmos/CosmicScene"));
const ZodiacWheel3D = lazy(() => import("./cosmos/ZodiacWheel3D"));

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

function Fallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-24 w-24 animate-pulse-glow rounded-full bg-[radial-gradient(circle,var(--gold),transparent_70%)] opacity-60" />
    </div>
  );
}

function Client({ Comp, props }: { Comp: ComponentType<never>; props?: unknown }) {
  const hydrated = useHydrated();
  if (!hydrated) return <Fallback />;
  const C = Comp as ComponentType<Record<string, unknown>>;
  return (
    <Suspense fallback={<Fallback />}>
      <C {...(props as Record<string, unknown>)} />
    </Suspense>
  );
}

export function CosmicSceneClient() {
  return <Client Comp={CosmicScene as unknown as ComponentType<never>} props={{}} />;
}

export function ZodiacWheelClient(props: Record<string, unknown>) {
  return <Client Comp={ZodiacWheel3D as unknown as ComponentType<never>} props={props} />;
}