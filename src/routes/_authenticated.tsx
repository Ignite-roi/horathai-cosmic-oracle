import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { LoadingSky } from "@/components/AppShell";
import { APP_ACCESS_MODE } from "@/config/access";
import { isPublicReviewRoute } from "@/config/public-review";
import { useAccount, useSession } from "@/hooks/useAuth";
import { useBirthContext } from "@/hooks/useHomeReading";
import { supabase } from "@/integrations/supabase/client";
import { NOINDEX_META } from "@/lib/seo";
import { useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/_authenticated")({
  // App screens are client-only and personalised: never index them (SEO OS hard gate).
  head: () => ({ meta: [NOINDEX_META] }),
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      const guestAllowed =
        isPublicReviewRoute(location.pathname) ||
        (APP_ACCESS_MODE === "development_unlocked" && location.pathname === "/transits");
      if (!guestAllowed) throw redirect({ to: "/" });
      return { user: null };
    }
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { session, loading: sessionLoading } = useSession();
  const { data: account, isLoading } = useAccount();
  useSyncSavedBirth();
  const needsOnboarding = Boolean(account?.profile && !account.profile.onboarding_completed);

  useEffect(() => {
    if (needsOnboarding && pathname !== "/onboarding") {
      void navigate({ to: "/onboarding", replace: true });
    }
  }, [needsOnboarding, pathname, navigate]);

  if (!sessionLoading && !session) return <Outlet />;
  if (isLoading && !account) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-16">
        <LoadingSky label="กำลังเตรียมดวงของคุณ…" />
      </div>
    );
  }
  return <Outlet />;
}

function useSyncSavedBirth() {
  const { data } = useBirthContext();
  const setProfile = useProfile((state) => state.setProfile);
  const saved = data?.birthProfile ?? null;

  useEffect(() => {
    if (!saved) return;
    setProfile({
      birthDate: saved.birth_date,
      birthTime: (saved.birth_time ?? "12:00").slice(0, 5),
      province: saved.province,
      country: saved.country,
      onboarded: true,
    });
  }, [saved, setProfile]);
}
