import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getReading } from "@/lib/astro.functions";
import { useProfile } from "@/store/useProfile";
import { PUBLIC_REVIEW_MODE } from "@/config/public-review";
import { useSession } from "@/hooks/useAuth";
import { getPublicReviewReading } from "@/lib/public-review.functions";
import { readGuestBirthContext } from "@/lib/guest-birth";
import { useEffect, useState } from "react";

/** Fetches a reading from the versioned deterministic Lahiri model. */
export function useReading(atIso?: string) {
  const birthDate = useProfile((s) => s.birthDate);
  const birthTime = useProfile((s) => s.birthTime);
  const province = useProfile((s) => s.province);
  const fetchReading = useServerFn(getReading);
  const fetchReviewReading = useServerFn(getPublicReviewReading);
  const { session, loading } = useSession();
  const [guestBirth, setGuestBirth] = useState<ReturnType<typeof readGuestBirthContext>>(null);
  useEffect(() => {
    if (!loading && !session) setGuestBirth(readGuestBirthContext());
  }, [loading, session]);
  const temporary = guestBirth?.birthProfile;
  const publicReview = PUBLIC_REVIEW_MODE && !loading && !session && !temporary;

  const ready = publicReview || Boolean(temporary ?? birthDate);
  const day = atIso ?? new Date().toISOString().slice(0, 13);

  return useQuery({
    queryKey: [
      "reading",
      publicReview ? "public-review" : (temporary?.birth_date ?? birthDate),
      temporary?.birth_time ?? birthTime,
      temporary?.province ?? province,
      day,
    ],
    enabled: ready,
    staleTime: 1000 * 60 * 30,
    queryFn: () =>
      publicReview
        ? fetchReviewReading({ data: atIso ? { at: atIso } : {} })
        : fetchReading({
            data: {
              birthDate: temporary?.birth_date ?? birthDate,
              birthTime: (temporary?.birth_time ?? birthTime) || "12:00",
              province: temporary?.province ?? province,
              ...(atIso ? { at: atIso } : {}),
            },
          }),
  });
}
