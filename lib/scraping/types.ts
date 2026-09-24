import "server-only";

export type ScrapeSummary = {
  status: "completed" | "failed";
  sourcesChecked: number;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  durationMs: number;
  rejectionReasons: Record<string, number>;
};

export type ScrapeRequest = {
  sourceIds?: string[];
  perSourceLimit?: number;
};

export type ParsedArticle = {
  canonicalUrl: string | null;
  title: string;
  imageUrl: string;
  publishedAt: string;
  rawText: string;
  category: string | null;
};

export type CandidateLink = {
  url: string;
  rejectedReason?: string;
};
