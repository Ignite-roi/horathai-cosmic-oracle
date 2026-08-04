import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import { GuestBirthInputSchema } from "./guest-birth";

export const calculateGuestBirthChart = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GuestBirthInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { assertPublicRateLimit } = await import("./public-rate-limit.server");
    assertPublicRateLimit("guest-birth", getRequestIP({ xForwardedFor: true }) ?? "unknown", 6);
    const { calculateGuestBirthChartOnServer } = await import("./guest-birth.server");
    return calculateGuestBirthChartOnServer(data);
  });