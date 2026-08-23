# vibeXnews

> **Vibrancy in perspectives. Data-driven clarity.**

**vibeXnews** is a production-style AI-powered news analysis platform that collects real news articles from verified sources, analyzes political framing and sentiment using AI, stores them in Supabase, and presents reader-friendly visual insights.

## Features

- **Obsidian Dark Design System**: High-contrast dark theme with warm flame accents and clear visual hierarchy.
- **AI Framing & Perspective Meters**: Multi-dimensional political framing analysis (Left, Center, Right percentages) with confidence metrics.
- **Sentiment Analysis**: Neutral, positive, and negative scoring based on NLP linguistic evaluation.
- **Verified Multi-Source Aggregation**: News cards with category tagging, read time, and direct source attribution.
- **Responsive Architecture**: Fluid 12-column desktop and 4-column mobile interface.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Typography**: Inter via `next/font/google`
- **Auth**: Clerk
- **Database & Vectors**: Supabase & pgvector
- **Scraping**: Oxylabs Web Scraper API & Scheduler
- **AI & Embeddings**: Vercel AI SDK & OpenAI provider

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## Checks

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Production build
npm run build
```
