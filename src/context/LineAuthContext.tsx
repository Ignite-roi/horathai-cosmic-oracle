import { createContext, useContext, type ReactNode } from "react";

import { useLineAuthMachine, type LineAuthState } from "@/hooks/useAuth";

const LineAuthContext = createContext<LineAuthState | null>(null);

/**
 * Boots LIFF and owns the Cloud session for the whole app. Mounted once in the
 * root route so LIFF init / token verification never runs more than once.
 */
export function LineAuthProvider({ children }: { children: ReactNode }) {
  const value = useLineAuthMachine();
  return <LineAuthContext.Provider value={value}>{children}</LineAuthContext.Provider>;
}

/** Shared LINE auth state. Must be used under <LineAuthProvider>. */
export function useLineAuth(): LineAuthState {
  const ctx = useContext(LineAuthContext);
  if (!ctx) throw new Error("useLineAuth must be used within <LineAuthProvider>");
  return ctx;
}