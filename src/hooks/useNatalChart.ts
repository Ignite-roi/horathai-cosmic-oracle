import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { z } from "zod";

import { getReading } from "@/lib/astro.functions";
import { calculateAndSaveChart, getMyBirthContext } from "@/lib/birth.functions";
import { DEMO_BIRTH } from "@/hooks/useHomeReading";
import { useSession } from "@/hooks/useAuth";

const planetSchema = z.object({
  num: z.number(), th: z.string(), thaiNumeral: z.string(), longitude: z.number(), signId: z.number(),
  signTh: z.string(), degree: z.number(), minute: z.number(), house: z.number(), retrograde: z.boolean(),
  strength: z.number(), color: z.string(), meaning: z.string(),
});
const houseSchema = z.object({ n: z.number(), th: z.string(), about: z.string(), signId: z.number(), signTh: z.string(), planets: z.array(z.number()) });
const standardSchema = z.object({ num: z.number(), th: z.string(), standard: z.string(), note: z.string() });
const ascendantSchema = z.object({ signId: z.number(), signTh: z.string(), degree: z.number(), minute: z.number(), longitude: z.number(), siderealLongitude: z.number().optional() });

export function useNatalChart(mode: "natal" | "transit" | "both") {
  const { session, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const bindChart = useServerFn(calculateAndSaveChart);
  const fetchDemo = useServerFn(getReading);

  const context = useQuery({
    queryKey: ["birth-chart-context", session?.user.id ?? "guest"],
    queryFn: () => getMyBirthContext(),
    enabled: Boolean(session),
    staleTime: 60_000,
    retry: false,
  });

  const calculation = useMutation({
    mutationFn: () => bindChart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["birth-chart-context"] }),
  });

  useEffect(() => {
    if (context.data?.birthProfile && !context.data.chart && !calculation.isPending && !calculation.isSuccess) calculation.mutate();
  }, [context.data, calculation]);

  const transit = useQuery({
    queryKey: ["birth-chart-transit", session?.user.id],
    queryFn: () => {
      const profile = context.data?.birthProfile;
      if (!profile) throw new Error("ยังไม่พบข้อมูลวันเกิด");
      return fetchDemo({ data: { birthDate: profile.birth_date, birthTime: (profile.birth_time ?? "12:00").slice(0, 5), province: profile.province } });
    },
    enabled: Boolean(session && context.data?.chart && mode !== "natal"),
    staleTime: 30 * 60_000,
  });

  const demo = useQuery({
    queryKey: ["birth-chart-demo"],
    queryFn: () => fetchDemo({ data: DEMO_BIRTH }),
    enabled: !sessionLoading && !session,
    staleTime: 60 * 60_000,
  });

  const saved = context.data?.chart;
  const parsedPlanets = saved ? planetSchema.array().safeParse(saved.planets_json) : null;
  const parsedHouses = saved ? houseSchema.array().safeParse(saved.houses_json) : null;
  const parsedStandards = saved ? standardSchema.array().safeParse(saved.standards_json) : null;
  const parsedAscendant = saved?.ascendant_known ? ascendantSchema.safeParse(saved.ascendant_json) : null;
  const demoPlanets = demo.data?.natal.planets.map((p) => ({ ...p, minute: p.minute })) ?? [];

  return {
    isDemo: !session,
    isLoading: sessionLoading || context.isLoading || demo.isLoading || calculation.isPending,
    error: context.error ?? demo.error ?? calculation.error ?? transit.error,
    retry: () => { void context.refetch(); void demo.refetch(); },
    profile: context.data?.birthProfile ?? null,
    chart: saved ?? null,
    planets: parsedPlanets?.success ? parsedPlanets.data : saved ? [] : demoPlanets,
    houses: parsedHouses?.success ? parsedHouses.data : [],
    standards: parsedStandards?.success ? parsedStandards.data : [],
    ascendant: parsedAscendant?.success ? parsedAscendant.data : saved ? null : demo.data?.natal.ascendant ? { ...demo.data.natal.ascendant, minute: Math.round((demo.data.natal.ascendant.degree % 1) * 60), signId: demo.data.natal.ascendant.signId, signTh: demo.data.natal.ascendant.signTh } : null,
    transitPlanets: mode === "natal" ? [] : (transit.data?.transit.planets ?? []),
  };
}