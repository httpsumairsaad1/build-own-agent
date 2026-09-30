import "server-only";

import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { articleAnalysisSchema, type ArticleAnalysisOutput } from "./schema";

const ANALYSIS_MODEL = "gpt-5.4-mini";
const MAX_ARTICLE_TEXT_LENGTH = 30_000;

export async function analyzeArticle(article: { title: string; rawText: string }): Promise<{
  analysis: ArticleAnalysisOutput;
  model: string;
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const result = await generateText({
    model: openai(ANALYSIS_MODEL),
    output: Output.object({
      name: "article_analysis",
      description: "A neutral article sentiment and AI-estimated political framing analysis.",
      schema: articleAnalysisSchema,
    }),
    system: [
      "Analyze only the supplied article text.",
      "Write a neutral factual summary without adding unsupported claims.",
      "Political framing is an AI estimate of wording and perspective, not objective truth.",
      "Do not infer political framing from a publisher, source name, author, or missing context.",
      "Use unclear with low confidence when text evidence is weak or percentages are close.",
      "The framing percentages must be integers that total exactly 100.",
      "Return loaded terms only when they are materially loaded or framing-relevant.",
      "Include a concise disclaimer that framing is AI-estimated and based on article text only.",
    ].join(" "),
    prompt: `Title: ${article.title}\n\nArticle text:\n${article.rawText.slice(0, MAX_ARTICLE_TEXT_LENGTH)}`,
  });

  if (!result.output) {
    throw new Error("The model returned no structured analysis output.");
  }

  return { analysis: result.output, model: ANALYSIS_MODEL };
}
