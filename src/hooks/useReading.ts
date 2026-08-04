import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getReading } from "@/lib/astro.functions";
import { useProfile } from "@/store/useProfile";
import { PUBLIC_REVIEW_MODE } from "@/config/public-review";
import { useSession } from "@/hooks/useAuth";
import { getPublicReviewReading } from "@/lib/public-review.functions";

/** Fetches the authentic Suriyayart reading from the server engine. */
export function useReading(atIso?: string) {
  const birthDate = useProfile((s) => s.birthDate);
  const birthTime = useProfile((s) => s.birthTime);
  const province = useProfile((s) => s.province);
  const fetchReading = useServerFn(getReading);
  const fetchReviewReading = useServerFn(getPublicReviewReading);
  const { session, loading } = useSession();
  const publicReview = PUBLIC_REVIEW_MODE && !loading && !session;

  const ready = publicReview || Boolean(birthDate);
  const day = atIso ?? new Date().toISOString().slice(0, 13);

  return useQuery({
    queryKey: ["reading", publicReview ? "public-review" : birthDate, birthTime, province, day],
    enabled: ready,
    staleTime: 1000 * 60 * 30,
    queryFn: () => publicReview
      ? fetchReviewReading({ data: atIso ? { at: atIso } : {} })
      : fetchReading({
        data: {
          birthDate,
          birthTime: birthTime || "12:00",
          province,
          ...(atIso ? { at: atIso } : {}),
        },
      }),
  });
}
