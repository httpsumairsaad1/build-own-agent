import "server-only";

import { z } from "zod";

export const articleAnalysisSchema = z
  .object({
    summary: z.string().trim().min(40).max(2_000),
    sentimentScore: z.number().min(-1).max(1),
    sentimentLabel: z.enum(["positive", "neutral", "negative"]),
    politicalFramingLabel: z.enum(["left", "center", "right", "mixed", "unclear"]),
    leftPercentage: z.number().int().min(0).max(100),
    centerPercentage: z.number().int().min(0).max(100),
    rightPercentage: z.number().int().min(0).max(100),
    confidence: z.number().min(0).max(1),
    framingNotes: z.string().trim().min(20).max(2_000),
    loadedTerms: z.array(z.string().trim().min(1).max(160)).max(20),
    disclaimer: z.string().trim().min(20).max(1_000),
  })
  .superRefine((value, context) => {
    if (value.leftPercentage + value.centerPercentage + value.rightPercentage !== 100) {
      context.addIssue({
        code: "custom",
        message: "Framing percentages must total exactly 100.",
        path: ["leftPercentage"],
      });
    }
  });

export type ArticleAnalysisOutput = z.infer<typeof articleAnalysisSchema>;
