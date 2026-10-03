import "server-only";

import { embed, generateText, Output } from "ai";
import { createGoogle } from "@ai-sdk/google";
import { articleAnalysisSchema, type ArticleAnalysisOutput } from "./schema";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const google = createGoogle({
  apiKey,
});
//MODEL
const ANALYSIS_MODEL = "gemini-3.8-flash";
const EMBEDDING_MODEL = "embedding-001";
const MAX_ARTICLE_TEXT_LENGTH = 30_000;

export async function analyzeArticle(article: { title: string; rawText: string }): Promise<{
  analysis: ArticleAnalysisOutput;
  embedding: number[];
  model: string;
}> {
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY in process.env");
  }

  const analysisResult = await generateText({
    model: google(ANALYSIS_MODEL),
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
      "Classify the article into one of these 5 categories: 'Politics', 'Tech-Vibe', 'Economy', 'Pop Culture', or 'Social Change'.",
    ].join(" "),
    prompt: `Title: ${article.title}\n\nArticle text:\n${article.rawText.slice(0, MAX_ARTICLE_TEXT_LENGTH)}`,
  });

  if (!analysisResult.output) {
    throw new Error("The model returned no structured analysis output.");
  }

  let embedding: number[] = [];
  try {
    const embeddingResult = await embed({
      model: google.textEmbeddingModel(EMBEDDING_MODEL),
      value: `${article.title}\n\n${article.rawText.slice(0, MAX_ARTICLE_TEXT_LENGTH)}`,
    });
    embedding = embeddingResult.embedding;
  } catch (err) {
    console.warn("[analysis] embedding skipped/failed:", err instanceof Error ? err.message : err);
  }

  return {
    analysis: analysisResult.output,
    embedding,
    model: ANALYSIS_MODEL,
  };
}
