import { createServerFn } from "@tanstack/react-start";

import { GuestBirthInputSchema } from "./guest-birth";

export const calculateGuestBirthChart = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GuestBirthInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { calculateGuestBirthChartOnServer } = await import("./guest-birth.server");
    return calculateGuestBirthChartOnServer(data);
  });