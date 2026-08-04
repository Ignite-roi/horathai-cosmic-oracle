import { getRequestHost } from "@tanstack/react-start/server";

export type MockCheckoutMode = "development" | "review";

type MockCheckoutEnvironment = Record<string, string | undefined>;

export type MockCheckoutAccess =
  | { allowed: true; mode: MockCheckoutMode; host: string }
  | { allowed: false; reason: "disabled" | "invalid_mode" | "missing_allowlist" | "host_denied" };

function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/:\d+$/, "");
}

export function evaluateMockCheckoutAccess(
  environment: MockCheckoutEnvironment,
  requestHost: string,
): MockCheckoutAccess {
  const rawMode = environment["HORATHAI_MOCK_CHECKOUT_MODE"]?.trim().toLowerCase();
  if (!rawMode || rawMode === "disabled") return { allowed: false, reason: "disabled" };
  if (rawMode !== "development" && rawMode !== "review") {
    return { allowed: false, reason: "invalid_mode" };
  }

  const allowedHosts = (environment["HORATHAI_MOCK_CHECKOUT_ALLOWED_HOSTS"] ?? "")
    .split(",")
    .map(normalizeHost)
    .filter(Boolean);
  if (allowedHosts.length === 0) return { allowed: false, reason: "missing_allowlist" };

  const host = normalizeHost(requestHost);
  if (!host || !allowedHosts.includes(host)) return { allowed: false, reason: "host_denied" };
  return { allowed: true, mode: rawMode, host };
}

export function assertMockCheckoutAllowed(): MockCheckoutMode {
  const access = evaluateMockCheckoutAccess(process.env, getRequestHost());
  if (!access.allowed) {
    const error = new Error("ระบบชำระเงินจำลองไม่เปิดใช้งานในสภาพแวดล้อมนี้");
    Object.assign(error, { statusCode: 403 });
    throw error;
  }
  return access.mode;
}

export async function executeIfMockCheckoutAllowed<T>(
  environment: MockCheckoutEnvironment,
  requestHost: string,
  operation: () => Promise<T>,
): Promise<T> {
  const access = evaluateMockCheckoutAccess(environment, requestHost);
  if (!access.allowed) {
    const error = new Error("ระบบชำระเงินจำลองไม่เปิดใช้งานในสภาพแวดล้อมนี้");
    Object.assign(error, { statusCode: 403 });
    throw error;
  }
  return operation();
}

export async function withMockCheckoutAccess<T>(operation: () => Promise<T>): Promise<T> {
  return executeIfMockCheckoutAllowed(process.env, getRequestHost(), operation);
}
