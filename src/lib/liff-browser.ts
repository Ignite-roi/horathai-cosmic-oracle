/** Browser-only LIFF helpers. Never import from SSR-evaluated module scope. */

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string | undefined;
};

/** Sanitized LIFF failure. Never carries tokens, secrets or raw SDK objects. */
export type LiffError = {
  code: string;
  message: string;
  isConfigurationError: boolean;
  isOutsideLine: boolean;
  timestamp: string;
};

const MSG_MISSING_ID = "ยังไม่ได้ตั้งค่า LIFF ID ในระบบ กรุณาติดต่อผู้ดูแล";
const MSG_APP_NOT_FOUND =
  "ไม่พบ LIFF App นี้ — LIFF ID อาจไม่ถูกต้อง หรือไม่ตรงกับ LINE Login Channel ที่ตั้งค่าไว้";
const MSG_ENDPOINT_MISMATCH =
  "URL ของเว็บไม่ตรงกับ Endpoint URL ที่ตั้งค่าไว้ใน LIFF กรุณาเปิดผ่านลิงก์ LIFF อย่างเป็นทางการ";
const MSG_GENERIC = "เริ่มต้น LIFF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

function makeError(
  code: string,
  message: string,
  opts: { configuration?: boolean; outsideLine?: boolean } = {},
): LiffError {
  return {
    code,
    message,
    isConfigurationError: opts.configuration ?? false,
    isOutsideLine: opts.outsideLine ?? false,
    timestamp: new Date().toISOString(),
  };
}

/** Maps an SDK exception onto a sanitized, user-safe Thai error. */
function classify(err: unknown): LiffError {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const code =
    (typeof err === "object" && err && "code" in err && String((err as { code: unknown }).code)) ||
    "INIT_FAILED";

  if (/was not found|invalid liff id|liff id/i.test(raw)) {
    return makeError("LIFF_APP_NOT_FOUND", MSG_APP_NOT_FOUND, { configuration: true });
  }
  if (/endpoint|domain|origin|url/i.test(raw)) {
    return makeError("LIFF_ENDPOINT_MISMATCH", MSG_ENDPOINT_MISMATCH, { configuration: true });
  }
  return makeError(code, MSG_GENERIC);
}

export function missingLiffIdError(): LiffError {
  return makeError("LIFF_ID_MISSING", MSG_MISSING_ID, { configuration: true });
}

let initPromise: Promise<{ ok: true } | { ok: false; error: LiffError }> | null = null;
let initializedWith: string | null = null;

/** Drops the cached init result so the next initLiff() is a true fresh init. */
export function resetLiffInitialization() {
  initPromise = null;
  initializedWith = null;
}

export function isLiffInitialized() {
  return initializedWith !== null;
}

async function liffModule() {
  const mod = await import("@line/liff");
  return mod.default;
}

/**
 * Initialises LIFF exactly once. Parallel callers share the same promise; a
 * failed attempt clears the cache so a retry really re-initialises.
 */
export function initLiff(
  liffId: string | null,
): Promise<{ ok: true } | { ok: false; error: LiffError }> {
  if (typeof window === "undefined") {
    return Promise.resolve({ ok: false as const, error: makeError("SSR", MSG_GENERIC) });
  }
  if (!liffId) return Promise.resolve({ ok: false as const, error: missingLiffIdError() });
  if (initPromise && initializedWith === liffId) return initPromise;

  initPromise = (async () => {
    try {
      const liff = await liffModule();
      await liff.init({ liffId });
      initializedWith = liffId;
      return { ok: true as const };
    } catch (err) {
      const error = classify(err);
      console.error(`[liff] init failed: ${error.code}`);
      initPromise = null;
      initializedWith = null;
      return { ok: false as const, error };
    }
  })();
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

/** Query params that must never survive into a LIFF redirect URI. */
const STRIPPED_PARAMS = [
  "code",
  "state",
  "liffClientId",
  "liffRedirectUri",
  "liff.state",
  "liffReferrer",
  "access_token",
  "id_token",
  "error",
  "error_description",
  "forceRedirect",
];

/**
 * Builds a safe same-origin redirect URI: preview/transient auth parameters are
 * dropped so LINE never receives an URL it cannot match to the LIFF endpoint.
 */
export function sanitizeRedirectUrl(href: string = window.location.href): string {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return window.location.origin + "/";
    for (const key of [...url.searchParams.keys()]) {
      if (STRIPPED_PARAMS.includes(key) || key.startsWith("__lovable") || key.startsWith("liff")) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    return url.origin + url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "");
  } catch {
    return window.location.origin + "/";
  }
}

/** Redirects to the LINE consent screen; the page reloads on return. */
export async function liffLogin(redirectUri?: string) {
  const liff = await liffModule();
  const target = sanitizeRedirectUrl(redirectUri ?? window.location.href);
  liff.login({ redirectUri: target });
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
