import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";

import { getReading } from "@/lib/astro.functions";
import { calculateAndSaveChart, getMyBirthContext } from "@/lib/birth.functions";
import { useSession } from "@/hooks/useAuth";
import { PUBLIC_REVIEW_MODE } from "@/config/public-review";
import { getPublicReviewChart, getPublicReviewReading } from "@/lib/public-review.functions";
import { readGuestBirthContext, type GuestBirthContext } from "@/lib/guest-birth";

const planetSchema = z.object({
  num: z.number(),
  th: z.string(),
  thaiNumeral: z.string(),
  longitude: z.number(),
  signId: z.number(),
  signTh: z.string(),
  degree: z.number(),
  minute: z.number(),
  house: z.number(),
  retrograde: z.boolean(),
  strength: z.number(),
  color: z.string(),
  meaning: z.string(),
});
const houseSchema = z.object({
  n: z.number(),
  th: z.string(),
  about: z.string(),
  signId: z.number(),
  signTh: z.string(),
  planets: z.array(z.number()),
});
const standardSchema = z.object({
  num: z.number(),
  th: z.string(),
  standard: z.string(),
  note: z.string(),
});
const ascendantSchema = z.object({
  signId: z.number(),
  signTh: z.string(),
  degree: z.number(),
  minute: z.number(),
  longitude: z.number(),
  siderealLongitude: z.number().optional(),
});

export function useNatalChart(mode: "natal" | "transit" | "both", transitAt?: string) {
  const { session, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const bindChart = useServerFn(calculateAndSaveChart);
  const fetchReading = useServerFn(getReading);
  const fetchReviewChart = useServerFn(getPublicReviewChart);
  const fetchReviewReading = useServerFn(getPublicReviewReading);
  const [guestContext, setGuestContext] = useState<GuestBirthContext | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session) setGuestContext(readGuestBirthContext());
  }, [sessionLoading, session]);

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
    if (
      context.data?.birthProfile &&
      !context.data.chart &&
      !calculation.isPending &&
      !calculation.isSuccess
    )
      calculation.mutate();
  }, [context.data, calculation]);

  const transit = useQuery({
    queryKey: ["birth-chart-transit", session?.user.id ?? "guest", guestContext?.birthProfile.birth_date, transitAt],
    queryFn: () => {
      const profile = context.data?.birthProfile ?? guestContext?.birthProfile;
      if (!profile) throw new Error("ยังไม่พบข้อมูลวันเกิด");
      return fetchReading({
        data: {
          birthDate: profile.birth_date,
          birthTime: (profile.birth_time ?? "12:00").slice(0, 5),
          province: profile.province,
          ...(transitAt ? { at: transitAt } : {}),
        },
      });
    },
    enabled: Boolean((context.data?.chart || guestContext?.chart) && mode !== "natal"),
    staleTime: 30 * 60_000,
  });

  const reviewChart = useQuery({
    queryKey: ["public-review-chart"],
    queryFn: () => fetchReviewChart(),
    enabled: PUBLIC_REVIEW_MODE && !sessionLoading && !session && !guestContext,
    staleTime: 60 * 60_000,
  });

  const reviewTransit = useQuery({
    queryKey: ["public-review-chart-transit", mode, transitAt],
    queryFn: () => fetchReviewReading({ data: transitAt ? { at: transitAt } : {} }),
    enabled: PUBLIC_REVIEW_MODE && !sessionLoading && !session && !guestContext && mode !== "natal",
    staleTime: 30 * 60_000,
  });

  const saved = context.data?.chart ?? guestContext?.chart;
  const parsedPlanets = saved ? planetSchema.array().safeParse(saved.planets_json) : null;
  const parsedHouses = saved ? houseSchema.array().safeParse(saved.houses_json) : null;
  const parsedStandards = saved ? standardSchema.array().safeParse(saved.standards_json) : null;
  const parsedAscendant = saved?.ascendant_known
    ? ascendantSchema.safeParse(saved.ascendant_json)
    : null;
  const publicPlanets = guestContext ? [] : (reviewChart.data?.planets ?? []);
  const publicAscendant = guestContext ? null : (reviewChart.data?.ascendant ?? null);

  return {
    isDemo: !session,
    isTemporary: Boolean(!session && guestContext),
    isLoading:
      sessionLoading || context.isLoading || reviewChart.isLoading || calculation.isPending,
    error:
      context.error ??
      reviewChart.error ??
      calculation.error ??
      transit.error ??
      reviewTransit.error,
    retry: () => {
      void context.refetch();
      void reviewChart.refetch();
      setGuestContext(readGuestBirthContext());
    },
    profile: context.data?.birthProfile ?? guestContext?.birthProfile ?? null,
    chart: saved ?? null,
    planets: parsedPlanets?.success ? parsedPlanets.data : saved ? [] : publicPlanets,
    houses: parsedHouses?.success ? parsedHouses.data : (reviewChart.data?.houses ?? []),
    standards: parsedStandards?.success
      ? parsedStandards.data
      : (reviewChart.data?.standards ?? []),
    ascendant: parsedAscendant?.success ? parsedAscendant.data : saved ? null : publicAscendant,
    transitPlanets:
      mode === "natal"
        ? []
        : (transit.data?.transit.planets ?? reviewTransit.data?.transit.planets ?? []),
    transitProvenance: transit.data?.provenance ?? reviewTransit.data?.provenance ?? null,
  };
}
