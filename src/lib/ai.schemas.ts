import { z } from "zod";

export const AskAstrologerInput = z.object({
  question: z.string().min(1).max(600),
  facts: z.string().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(10)
    .default([]),
});

export type AskAstrologerData = z.infer<typeof AskAstrologerInput>;