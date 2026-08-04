import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPublicReviewChart = createServerFn({ method: "GET" }).handler(async () => {
  const { calculatePublicReviewChart } = await import("./public-review.server");
  return calculatePublicReviewChart();
});

export const getPublicReviewReading = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ at: z.string().datetime().optional() }).parse(input))
  .handler(async ({ data }) => {
    const { calculatePublicReviewReading } = await import("./public-review.server");
    return calculatePublicReviewReading(data.at);
  });