import "server-only";

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { CandidateLink, ParsedArticle } from "./types";

const REJECTED_PATH_PARTS = [
  "category", "categories", "section", "sections", "topic", "topics", "tag", "tags", "author", "authors",
  "search", "newsletter", "subscribe", "subscription", "account", "support", "help", "contact", "about",
  "podcast", "podcasts", "program", "programs", "show", "shows", "live", "game", "games", "shopping",
  "shop", "review", "reviews", "product", "products", "video",
];
const TRACKING_PARAMETERS = ["fbclid", "gclid", "mc_cid", "mc_eid", "output", "ref", "utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term"];
const BOILERPLATE_PATTERN = /newsletter|subscribe|sign up|related (stories|content)|most read|most viewed|advertisement|advertising|share this|follow us|cookie settings|all rights reserved/i;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeUrl(value: string, baseUrl: string): string | null {
  try {
    const url = new URL(value, baseUrl);
    const base = new URL(baseUrl);
    if (url.protocol !== "https:" || url.hostname !== base.hostname) return null;
    url.hash = "";
    TRACKING_PARAMETERS.forEach((parameter) => url.searchParams.delete(parameter));
    return url.toString();
  } catch {
    return null;
  }
}

function hasArticleShape(url: URL, sourceName: string): boolean {
  const path = url.pathname.toLowerCase().replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0 || REJECTED_PATH_PARTS.some((part) => segments.includes(part))) return false;

  const source = sourceName.toLowerCase();
  if (source.includes("npr")) return /^\/\d{4}\/\d{2}\/\d{2}\/.+/.test(path);
  if (source.includes("guardian")) return /^\/[^/]+\/\d{4}\/[a-z]{3}\/\d{1,2}\/.+/.test(path);
  if (source.includes("fox")) return /^\/[^/]+\/\d{4}\/.+/.test(path);
  if (source.includes("bbc")) return /^\/news\/articles\//.test(path) || /^\/news\/[^/]+-\d+/.test(path);
  if (source.includes("reuters")) return segments.length >= 2 && (/-\d{4}-\d{2}-\d{2}|[a-z]{12,}/.test(path));

  return segments.length >= 2 && path.length >= 30;
}

function isVisibleStoryLink($: cheerio.CheerioAPI, element: Element): boolean {
  const link = $(element);
  if (link.closest("header, footer, nav, aside, [role=navigation], [aria-label*=navigation i]").length) return false;
  const text = normalizeText(link.text());
  return text.length >= 20 && !BOILERPLATE_PATTERN.test(text);
}

export function extractHomepageCandidates(html: string, sourceName: string, homepageUrl: string): { candidates: CandidateLink[]; rejected: number } {
  let rejected = 0;
  const $ = cheerio.load(html);
  const candidates = new Map<string, CandidateLink>();

  $("a[href]").each((_index, element) => {
    if (!isVisibleStoryLink($, element)) return;
    const url = normalizeUrl($(element).attr("href") ?? "", homepageUrl);
    if (!url) { rejected += 1; return; }
    const parsed = new URL(url);
    if (!hasArticleShape(parsed, sourceName)) { rejected += 1; return; }
    candidates.set(url, { url });
  });

  return { candidates: [...candidates.values()], rejected };
}

function metaContent($: cheerio.CheerioAPI, selectors: string[]): string | null {
  for (const selector of selectors) {
    const value = $(selector).attr("content")?.trim() ?? $(selector).attr("datetime")?.trim();
    if (value) return value;
  }
  return null;
}

function cleanArticleParagraphs($: cheerio.CheerioAPI): string[] {
  $("script, style, noscript, svg, iframe, nav, header, footer, aside, form, [role=navigation], [class*=newsletter i], [class*=subscribe i], [class*=related i], [class*=advert i], [class*=social i], [class*=share i]").remove();
  const roots = $("article").first().length ? $("article").first() : $("main").first().length ? $("main").first() : $("body").first();
  const unique = new Set<string>();
  roots.find("p, li").each((_index, element) => {
    const text = normalizeText($(element).text());
    if (text.length >= 80 && !BOILERPLATE_PATTERN.test(text)) unique.add(text);
  });
  return [...unique];
}

function validTitle(title: string): boolean {
  return title.length >= 15 && title.length <= 300 && !/^(home|news|world|business|politics|sport|live|video|podcasts?)$/i.test(title);
}

export function parseArticleDetail(html: string, originalUrl: string, sourceName: string): { article?: ParsedArticle; reason?: string } {
  const $ = cheerio.load(html);
  const canonicalUrl = normalizeUrl($("link[rel=canonical]").attr("href") ?? originalUrl, originalUrl);
  if (!canonicalUrl || !hasArticleShape(new URL(canonicalUrl), sourceName)) return { reason: "invalid_canonical_url" };

  const title = normalizeText(metaContent($, ["meta[property='og:title']", "meta[name='twitter:title']"]) ?? $("h1").first().text());
  if (!validTitle(title)) return { reason: "generic_or_missing_title" };

  const imageUrl = metaContent($, ["meta[property='og:image']", "meta[name='twitter:image']"]);
  if (!imageUrl) return { reason: "missing_image" };
  const normalizedImageUrl = normalizeUrl(imageUrl, canonicalUrl);
  if (!normalizedImageUrl) return { reason: "invalid_image_url" };

  const publishedValue = metaContent($, ["meta[property='article:published_time']", "meta[name='date']", "meta[name='publish-date']", "time[datetime]"]);
  const publishedAt = publishedValue ? new Date(publishedValue) : null;
  if (!publishedAt || Number.isNaN(publishedAt.getTime())) return { reason: "missing_published_date" };

  const paragraphs = cleanArticleParagraphs($);
  const rawText = paragraphs.join("\n\n");
  if (!((paragraphs.length >= 3) || rawText.length >= 900)) return { reason: "insufficient_article_body" };

  const category = normalizeText($("meta[property='article:section']").attr("content") ?? "") || null;
  return { article: { canonicalUrl, title, imageUrl: normalizedImageUrl, publishedAt: publishedAt.toISOString(), rawText, category } };
}


