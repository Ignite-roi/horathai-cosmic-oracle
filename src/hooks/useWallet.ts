import { useQuery } from "@tanstack/react-query";

import { useLineAuth } from "@/context/LineAuthContext";
import { EMPTY_WALLET } from "@/lib/wallet";
import { getMyWallet } from "@/lib/wallet.functions";

export function useWallet() {
  const { isSignedIn } = useLineAuth();
  const query = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getMyWallet(),
    enabled: isSignedIn,
    staleTime: 15_000,
  });
  return { ...query, data: query.data ?? EMPTY_WALLET, isSignedIn };
}