-- vibeXnews Active Sources Seed File
-- Standalone seed file inserting 5 active news sources with their homepage listing_urls.
-- Kept strictly separate from schema.sql per AGENTS.md Section 7 & 8.

INSERT INTO public.sources (name, listing_url, parser_strategy, is_active, logo_url)
VALUES
  ('Reuters', 'https://www.reuters.com', 'reuters', true, 'https://www.reuters.com/pf/resources/images/reuters/logo-vertical-default-512x512.png'),
  ('BBC News', 'https://www.bbc.com/news', 'bbc', true, 'https://static.files.bbci.co.uk/core/website-m/6.0.0-10/img/logos/bbc_news_black.svg'),
  ('NPR', 'https://www.npr.org', 'npr', true, 'https://media.npr.org/images/logo-black.svg'),
  ('The Guardian', 'https://www.theguardian.com/us', 'guardian', true, 'https://assets.guim.co.uk/images/guardian-logo-160.png'),
  ('Fox News', 'https://www.foxnews.com', 'fox', true, 'https://static.foxnews.com/static/orion/styles/img/fox-news/logos/fox-news-desktop.svg')
ON CONFLICT (name) DO UPDATE
SET
  listing_url = EXCLUDED.listing_url,
  parser_strategy = EXCLUDED.parser_strategy,
  is_active = EXCLUDED.is_active,
  logo_url = EXCLUDED.logo_url,
  updated_at = now();
