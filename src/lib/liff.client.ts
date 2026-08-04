/** Browser-only LIFF helpers. Never import from SSR-evaluated module scope. */
let initPromise: Promise<boolean> | null = null;

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string | undefined;
};

async function liffModule() {
  const mod = await import("@line/liff");
  return mod.default;
}

/** Initialises LIFF once. Resolves false when no LIFF id is configured. */
export function initLiff(liffId: string | null): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (!liffId) return Promise.resolve(false);
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const liff = await liffModule();
        await liff.init({ liffId });
        return true;
      } catch (err) {
        console.error("[liff] init failed", err);
        initPromise = null;
        return false;
      }
    })();
  }
  return initPromise;
}

export async function isInsideLine(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const liff = await liffModule();
    return liff.isInClient();
  } catch {
    return false;
  }
}

export async function isLiffLoggedIn(): Promise<boolean> {
  try {
    const liff = await liffModule();
    return liff.isLoggedIn();
  } catch {
    return false;
  }
}

/** Redirects to the LINE consent screen; the page reloads on return. */
export async function liffLogin(redirectUri?: string) {
  const liff = await liffModule();
  liff.login(redirectUri ? { redirectUri } : {});
}

export async function liffLogout() {
  try {
    const liff = await liffModule();
    if (liff.isLoggedIn()) liff.logout();
  } catch {
    /* ignore */
  }
}

/** The signed ID token proving who the LINE user is. Verified server-side. */
export async function getLiffIdToken(): Promise<string | null> {
  try {
    const liff = await liffModule();
    if (!liff.isLoggedIn()) return null;
    return liff.getIDToken();
  } catch {
    return null;
  }
}

export async function getLiffProfile(): Promise<LineProfile | null> {
  try {
    const liff = await liffModule();
    if (!liff.isLoggedIn()) return null;
    const p = await liff.getProfile();
    return { userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl ?? undefined };
  } catch {
    return null;
  }
}
