import { createFileRoute, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { LoadingSky } from "@/components/AppShell";
import { useAccount } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

/** Signed-in users without a completed birth profile always land on onboarding. */
function AuthedLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: account, isLoading } = useAccount();
  const needsOnboarding = Boolean(account?.profile && !account.profile.onboarding_completed);

  useEffect(() => {
    if (needsOnboarding && pathname !== "/onboarding") {
      void navigate({ to: "/onboarding", replace: true });
    }
  }, [needsOnboarding, pathname, navigate]);

  if (isLoading && !account) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-16">
        <LoadingSky label="กำลังเตรียมดวงของคุณ…" />
      </div>
    );
  }

  return <Outlet />;
}