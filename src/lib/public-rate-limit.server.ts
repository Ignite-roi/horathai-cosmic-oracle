type WindowState = { count: number; resetAt: number };

const windows = new Map<string, WindowState>();

export function assertPublicRateLimit(
  scope: string,
  clientId: string,
  limit: number,
  windowMs = 60_000,
) {
  const now = Date.now();
  const key = `${scope}:${clientId}`;
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit) {
    throw new Error("ส่งคำขอถี่เกินไป กรุณารอหนึ่งนาทีแล้วลองใหม่");
  }
  current.count += 1;
}
