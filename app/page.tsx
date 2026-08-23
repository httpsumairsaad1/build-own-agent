"use client";

import React, { useState, useMemo } from "react";

// --- Types ---
type BiasBreakdown = {
  left: number;
  center: number;
  right: number;
};

type Sentiment = {
  label: "Positive" | "Neutral" | "Negative";
  score: number; // -1 to +1
};

type Article = {
  id: string;
  source: string;
  sourceLogoText?: string;
  category: string;
  title: string;
  summary: string;
  publishedAt: string;
  readTime: string;
  imageTheme: "politics" | "tech" | "social" | "economy" | "climate" | "culture";
  bias: BiasBreakdown;
  biasLabel: "Left" | "Center" | "Right" | "Mixed" | "Unclear";
  sentiment: Sentiment;
  confidence: number; // 0 to 1
  isFeatured?: boolean;
  loadedTermsCount?: number;
};

// --- Mock Data matching Supabase schema & VibeXnews specs ---
const INITIAL_ARTICLES: Article[] = [
  {
    id: "art-1",
    source: "VibeXnews",
    sourceLogoText: "VXN",
    category: "Politics",
    title: "Gen Z Views on Data in Media: A VibeX Analysis",
    summary:
      "This text is punchy and relevant. It is short and clean in Inter Regular, examining how emerging generations navigate algorithmic feeds, media polarization, and data transparency across contemporary news outlets.",
    publishedAt: "2h ago",
    readTime: "12 min read",
    imageTheme: "politics",
    bias: { left: 15, center: 70, right: 15 },
    biasLabel: "Center",
    sentiment: { label: "Neutral", score: 0.08 },
    confidence: 0.94,
    isFeatured: true,
    loadedTermsCount: 2,
  },
  {
    id: "art-2",
    source: "Reuters",
    category: "Technology",
    title: "Global Clean Energy Transition Accelerates as Grid Investments Reach Historic Highs",
    summary:
      "Public and private capital commitments toward next-generation battery storage and continental grid resilience have surpassed benchmark targets for the third consecutive quarter.",
    publishedAt: "3h ago",
    readTime: "6 min read",
    imageTheme: "climate",
    bias: { left: 20, center: 65, right: 15 },
    biasLabel: "Center",
    sentiment: { label: "Positive", score: 0.45 },
    confidence: 0.96,
    loadedTermsCount: 1,
  },
  {
    id: "art-3",
    source: "Associated Press",
    category: "Economy",
    title: "Federal Reserve Maintains Steady Rate Outlook Amid Balanced Labor and Inflation Metrics",
    summary:
      "Central bank officials signaled a patient posture following composite economic data indicating stable wage expansion alongside moderating consumer price pressures.",
    publishedAt: "4h ago",
    readTime: "5 min read",
    imageTheme: "economy",
    bias: { left: 10, center: 80, right: 10 },
    biasLabel: "Center",
    sentiment: { label: "Neutral", score: -0.02 },
    confidence: 0.98,
    loadedTermsCount: 0,
  },
  {
    id: "art-4",
    source: "The Guardian",
    category: "Social Change",
    title: "Urban Housing Affordability Crisis Prompts Nationwide Tenant Union Mobilizations",
    summary:
      "Grassroots advocacy coalitions are organizing rent stabilization ballots across metropolitan hubs, demanding stricter rent caps and progressive municipal zoning reform.",
    publishedAt: "5h ago",
    readTime: "8 min read",
    imageTheme: "social",
    bias: { left: 68, center: 22, right: 10 },
    biasLabel: "Left",
    sentiment: { label: "Negative", score: -0.52 },
    confidence: 0.93,
    loadedTermsCount: 5,
  },
  {
    id: "art-5",
    source: "Wall Street Journal",
    category: "Tech-Vibe",
    title: "Enterprise AI Adoption Delivers Record Productivity Gains Across Manufacturing Sector",
    summary:
      "Capital expenditures in autonomous factory robotics and edge compute frameworks have yielded 22% operational cost reductions for major industrial manufacturers.",
    publishedAt: "6h ago",
    readTime: "7 min read",
    imageTheme: "tech",
    bias: { left: 12, center: 28, right: 60 },
    biasLabel: "Right",
    sentiment: { label: "Positive", score: 0.62 },
    confidence: 0.91,
    loadedTermsCount: 3,
  },
  {
    id: "art-6",
    source: "BBC News",
    category: "Pop Culture",
    title: "Digital Creators Challenge Traditional Studio Distribution Models with Direct Micro-Streaming",
    summary:
      "Independent cinema and documentary creators are bypassing heritage streaming platforms in favor of community-funded decentralized distribution hubs.",
    publishedAt: "8h ago",
    readTime: "4 min read",
    imageTheme: "culture",
    bias: { left: 35, center: 55, right: 10 },
    biasLabel: "Center",
    sentiment: { label: "Positive", score: 0.31 },
    confidence: 0.89,
    loadedTermsCount: 2,
  },
  {
    id: "art-7",
    source: "NPR",
    category: "Social Change",
    title: "Community Solar Initiatives Expand Energy Access for Underserved Rural Cooperatives",
    summary:
      "Regional agricultural cooperatives are pooling federal grants and local bonds to build resilient micro-grids that lower recurring monthly utility costs.",
    publishedAt: "9h ago",
    readTime: "6 min read",
    imageTheme: "climate",
    bias: { left: 52, center: 40, right: 8 },
    biasLabel: "Left",
    sentiment: { label: "Positive", score: 0.48 },
    confidence: 0.92,
    loadedTermsCount: 2,
  },
];

const CATEGORIES = [
  "All",
  "Pop Culture",
  "Social Change",
  "Tech-Vibe",
  "Politics",
  "Economy",
  "More +",
];

// --- Line-Style 2px Stroke SVG Icons ---
function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconBookmark({
  className = "w-4 h-4",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconClock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTrending({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconSparkles({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
    </svg>
  );
}

function IconSliders({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function IconShare({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconMenu({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconShieldCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}



// --- Stylized Monogram Brand Logo ---
function VXNLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const height = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  return (
    <div className={`flex items-center gap-2.5 select-none ${height}`}>
      {/* Stylized VXN Monogram Icon */}
      <div className="relative flex items-center justify-center">
        <svg
          className={`${size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10"}`}
          viewBox="0 0 48 48"
          fill="none"
        >
          {/* Outer glow aura */}
          <circle cx="24" cy="24" r="22" fill="url(#vxn-glow)" opacity="0.15" />

          {/* Main VXN Geometry */}
          <path d="M8 12L18 36H24L14 12H8Z" fill="url(#vxn-grad-1)" />
          <path d="M20 20L28 36H34L26 20H20Z" fill="url(#vxn-grad-2)" />
          <path d="M32 12L40 36H44L36 12H32Z" fill="url(#vxn-grad-3)" />
          {/* Floating Ember Accent */}
          <circle cx="28" cy="14" r="3.5" fill="#FFD54F" />

          <defs>
            <radialGradient id="vxn-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E64A19" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="vxn-grad-1"
              x1="8"
              y1="12"
              x2="24"
              y2="36"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D32F2F" />
              <stop offset="1" stopColor="#E64A19" />
            </linearGradient>
            <linearGradient
              id="vxn-grad-2"
              x1="20"
              y1="20"
              x2="34"
              y2="36"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E64A19" />
              <stop offset="1" stopColor="#FF9800" />
            </linearGradient>
            <linearGradient
              id="vxn-grad-3"
              x1="32"
              y1="12"
              x2="44"
              y2="36"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FF9800" />
              <stop offset="1" stopColor="#FFD54F" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="font-bold text-[var(--v-text-primary)] tracking-tight text-xl leading-none">
            Vibe
          </span>
          <span className="font-bold text-[#FF9800] tracking-tight text-xl leading-none">
            X
          </span>
          <span className="font-bold text-[var(--v-text-primary)] tracking-tight text-xl leading-none">
            news
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-[var(--v-text-muted)] font-medium leading-tight mt-0.5">
          Perspectives &amp; AI
        </span>
      </div>
    </div>
  );
}

// --- Visual Abstract Image Generator ---
function ArticleImageThumbnail({
  theme,
  className = "w-full h-44",
}: {
  theme: Article["imageTheme"];
  className?: string;
}) {
  const gradientsDark = {
    politics: "from-[#2C1810] via-[#1E1E1E] to-[#121212]",
    tech: "from-[#101E2C] via-[#1E1E1E] to-[#121212]",
    social: "from-[#2C101C] via-[#1E1E1E] to-[#121212]",
    economy: "from-[#252C10] via-[#1E1E1E] to-[#121212]",
    climate: "from-[#102C26] via-[#1E1E1E] to-[#121212]",
    culture: "from-[#2A102C] via-[#1E1E1E] to-[#121212]",
  };

  const accentColors = {
    politics: "#E64A19",
    tech: "#0288D1",
    social: "#D32F2F",
    economy: "#FF9800",
    climate: "#00897B",
    culture: "#AB47BC",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${gradientsDark[theme]} border border-[var(--v-border)] flex items-center justify-center ${className}`}
    >
      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-15 dark:opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #606060 1px, transparent 1px), linear-gradient(to bottom, #606060 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Radar Silhouette */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
        <div className="relative w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mb-1.5 shadow-inner">
          <div
            className="w-8 h-8 rounded-full opacity-35 animate-pulse"
            style={{ backgroundColor: accentColors[theme] }}
          />
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-50 animate-spin"
            style={{
              borderColor: accentColors[theme],
              animationDuration: "20s",
            }}
          />
          <IconTrending className="w-4 h-4 text-white z-10" />
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider text-white/80">
          Perspective Stream
        </span>
      </div>

      <div
        className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-30"
        style={{ backgroundColor: accentColors[theme] }}
      />
    </div>
  );
}

// --- THICK 3-WAY SEGMENTED BIAS METER (User request: make line thick) ---
function BiasMeter({
  bias,
  showLabels = true,
  size = "md",
}: {
  bias: BiasBreakdown;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  // Thicker bar heights: sm = 12px (h-3), md = 16px (h-4), lg = 22px (h-[22px])
  const barHeight =
    size === "sm" ? "h-3" : size === "lg" ? "h-6" : "h-4";

  return (
    <div className="w-full space-y-2">
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-semibold tracking-tight">
          {/* Left indicator */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C62828] shadow-sm shadow-[#C62828]/50" />
            <span className="text-[#C62828] font-bold">Left {bias.left}%</span>
          </div>

          {/* Center indicator */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#757575] dark:bg-[#8E8E8E]" />
            <span className="text-[var(--v-text-muted)] font-medium">Center {bias.center}%</span>
          </div>

          {/* Right indicator */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D97706] dark:bg-[#FFD54F] shadow-sm shadow-[#FF9800]/50" />
            <span className="text-[#D97706] dark:text-[#FFD54F] font-bold">Right {bias.right}%</span>
          </div>
        </div>
      )}

      {/* Prominent, Thick Segmented Bar */}
      <div
        className={`w-full ${barHeight} rounded-full bg-black/10 dark:bg-[#121212] overflow-hidden flex p-0.5 border-2 border-[var(--v-border)] shadow-inner gap-0.5`}
      >
        {/* Left Segment */}
        <div
          style={{ width: `${bias.left}%` }}
          className="h-full bg-gradient-to-r from-[#B71C1C] to-[#C62828] rounded-l-full vxn-meter-seg flex items-center justify-center overflow-hidden"
          title={`Left Framing: ${bias.left}%`}
        >
          {size === "lg" && bias.left >= 15 && (
            <span className="text-[10px] font-bold text-white tracking-tight drop-shadow">
              {bias.left}%
            </span>
          )}
        </div>

        {/* Center Segment */}
        <div
          style={{ width: `${bias.center}%` }}
          className="h-full bg-gradient-to-r from-[#6B7280] to-[#757575] dark:from-[#5A5A5A] dark:to-[#757575] vxn-meter-seg flex items-center justify-center overflow-hidden"
          title={`Center Neutral: ${bias.center}%`}
        >
          {size === "lg" && bias.center >= 20 && (
            <span className="text-[10px] font-bold text-white tracking-tight drop-shadow">
              {bias.center}%
            </span>
          )}
        </div>

        {/* Right Segment */}
        <div
          style={{ width: `${bias.right}%` }}
          className="h-full bg-gradient-to-r from-[#D97706] to-[#FF9800] dark:from-[#FFB300] dark:to-[#FFD54F] rounded-r-full vxn-meter-seg flex items-center justify-center overflow-hidden"
          title={`Right Framing: ${bias.right}%`}
        >
          {size === "lg" && bias.right >= 15 && (
            <span className="text-[10px] font-bold text-black tracking-tight drop-shadow">
              {bias.right}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sentiment Badge Component ---
function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const isPositive = sentiment.score > 0.15;
  const isNegative = sentiment.score < -0.15;

  const bgStyle = isPositive
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    : isNegative
    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
    : "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${bgStyle}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPositive
            ? "bg-emerald-500"
            : isNegative
            ? "bg-rose-500"
            : "bg-slate-400"
        }`}
      />
      {sentiment.label}{" "}
      <span className="opacity-75 font-mono text-[10px]">
        ({sentiment.score >= 0 ? `+${sentiment.score.toFixed(2)}` : sentiment.score.toFixed(2)})
      </span>
    </span>
  );
}

// --- Framing Label Badge ---
function FramingBadge({ label }: { label: Article["biasLabel"] }) {
  const styles = {
    Left: "bg-[#C62828]/15 text-[#C62828] dark:text-[#EF5350] border-[#C62828]/40",
    Center: "bg-slate-500/15 text-slate-700 dark:text-[#E0E0E0] border-slate-400/40",
    Right: "bg-[#FF9800]/15 text-[#D97706] dark:text-[#FFD54F] border-[#FF9800]/40",
    Mixed: "bg-amber-500/15 text-amber-600 dark:text-[#FF9800] border-amber-500/40",
    Unclear: "bg-neutral-500/15 text-neutral-600 dark:text-[#9E9E9E] border-neutral-400/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[label]}`}
    >
      {label} Bias
    </span>
  );
}

export default function VibeXnewsHome() {
  const [articles] = useState<Article[]>(INITIAL_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(["art-1"]));
  const [sortOption, setSortOption] = useState<"latest" | "polarized" | "balanced">("latest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleBookmark = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from saved perspectives");
      } else {
        next.add(id);
        showToast("Saved to your reading list");
      }
      return next;
    });
  };

  // Filter & Sort logic
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        const matchesCat =
          selectedCategory === "All" ||
          selectedCategory === "More +" ||
          art.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesSearch =
          searchQuery.trim() === "" ||
          art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.source.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOption === "polarized") {
          const polA = Math.abs(a.bias.left - a.bias.right);
          const polB = Math.abs(b.bias.left - b.bias.right);
          return polB - polA;
        }
        if (sortOption === "balanced") {
          return b.bias.center - a.bias.center;
        }
        return 0; // default latest order
      });
  }, [articles, selectedCategory, searchQuery, sortOption]);

  const featuredArticle = filteredArticles.find((a) => a.isFeatured) || filteredArticles[0];
  const gridArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-[var(--v-background)] text-[var(--v-text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* --- Toast Alert --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--v-panel)] text-[#E64A19] dark:text-[#FF9800] border border-[#E64A19]/30 dark:border-[#FF9800]/40 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <IconShieldCheck className="w-4 h-4 text-[#E64A19] dark:text-[#FF9800]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- TOP STICKY HEADER --- */}
      <header className="sticky top-0 z-40 bg-[var(--v-background)]/90 backdrop-blur-md border-b border-[var(--v-border)] px-4 lg:px-8 py-3 transition-colors">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <VXNLogo size="md" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[var(--v-text-muted)]">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedCategory === "All"
                    ? "text-[var(--v-text-primary)] bg-[var(--v-elevated)] border border-[var(--v-border)] font-semibold"
                    : "hover:text-[var(--v-text-primary)] hover:bg-[var(--v-elevated)]"
                }`}
              >
                All Feeds
              </button>
              {["Politics", "Tech-Vibe", "Social Change", "Economy", "Pop Culture"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    selectedCategory === cat
                      ? "text-[var(--v-text-primary)] bg-[var(--v-elevated)] border border-[var(--v-border)] font-semibold"
                      : "hover:text-[var(--v-text-primary)] hover:bg-[var(--v-elevated)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Input Bar */}
            <div className="relative hidden sm:flex items-center">
              <IconSearch className="absolute left-3 w-4 h-4 text-[var(--v-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perspectives & topics..."
                className="w-52 lg:w-68 pl-9 pr-8 py-1.5 text-xs bg-[var(--v-elevated)] text-[var(--v-text-primary)] placeholder-[var(--v-text-muted)] border border-[var(--v-border)] rounded-full focus:outline-none focus:border-[#E64A19] focus:ring-1 focus:ring-[#E64A19] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-xs text-[var(--v-text-muted)] hover:text-[var(--v-text-primary)]"
                >
                  ✕
                </button>
              )}
            </div>



            {/* Sign In button */}
            <button
              onClick={() => showToast("Clerk authentication is ready for setup.")}
              className="px-3.5 py-1.5 text-xs font-medium text-[var(--v-text-primary)] bg-[var(--v-panel)] hover:bg-[var(--v-elevated)] border border-[var(--v-border)] rounded-md transition-colors"
            >
              Sign In
            </button>

            {/* Subscribe / Live Alerts Button */}
            <button
              onClick={() => showToast("Live alert subscription enabled.")}
              className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#D32F2F] via-[#E64A19] to-[#FF9800] hover:opacity-95 rounded-md shadow-sm transition-all"
            >
              <IconSparkles className="w-3.5 h-3.5" />
              <span>Stay Vibe</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[var(--v-text-muted)] hover:text-[var(--v-text-primary)] bg-[var(--v-elevated)] rounded-md border border-[var(--v-border)]"
            >
              <IconMenu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[var(--v-border)] space-y-2">
            <div className="relative mb-2">
              <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-[var(--v-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perspectives & topics..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--v-elevated)] text-[var(--v-text-primary)] border border-[var(--v-border)] rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-xs text-left rounded-md ${
                    selectedCategory === cat
                      ? "bg-[#E64A19] text-white font-semibold"
                      : "bg-[var(--v-elevated)] text-[var(--v-text-muted)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* --- HERO TAGLINE & PERSPECTIVE TICKER --- */}
      <section className="border-b border-[var(--v-border)] bg-gradient-to-b from-[var(--v-elevated)] to-[var(--v-background)] px-4 lg:px-8 py-8 lg:py-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--v-panel)] border border-[var(--v-border)] text-[11px] font-semibold text-[#E64A19] dark:text-[#FF9800]">
                <span className="w-2 h-2 rounded-full bg-[#E64A19] animate-ping" />
                <span>Live AI News Analysis Engine</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--v-text-primary)] leading-tight">
                Vibrancy in perspectives. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#D32F2F] via-[#E64A19] to-[#FF9800] bg-clip-text text-transparent">
                  Data-driven clarity.
                </span>
              </h1>
              <p className="text-sm text-[var(--v-text-muted)] leading-relaxed">
                Real news articles collected from verified global publishers, parsed, and analyzed with AI to reveal political framing, sentiment, and narrative balance.
              </p>
            </div>

            {/* Quick Metrics Dashboard Bar */}
            <div className="grid grid-cols-3 gap-3 bg-[var(--v-panel)] p-3 rounded-xl border border-[var(--v-border)] shadow-sm">
              <div className="text-center px-2">
                <span className="block text-lg font-bold text-[var(--v-text-primary)] font-mono">14</span>
                <span className="text-[10px] text-[var(--v-text-muted)] uppercase tracking-wider">Sources</span>
              </div>
              <div className="text-center px-2 border-x border-[var(--v-border)]">
                <span className="block text-lg font-bold text-[#E64A19] dark:text-[#FF9800] font-mono">100%</span>
                <span className="text-[10px] text-[var(--v-text-muted)] uppercase tracking-wider">AI Scored</span>
              </div>
              <div className="text-center px-2">
                <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">94.2%</span>
                <span className="text-[10px] text-[var(--v-text-muted)] uppercase tracking-wider">Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FILTER CHIPS & CONTROLS BAR --- */}
      <section className="px-4 lg:px-8 py-4 border-b border-[var(--v-border)] bg-[var(--v-background)]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-[var(--v-text-muted)] font-semibold uppercase tracking-wider mr-1 hidden sm:inline">
              Topics:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#E64A19] text-white shadow-md shadow-[#E64A19]/25 border border-[#E64A19]"
                      : "bg-[var(--v-panel)] text-[var(--v-text-muted)] hover:text-[var(--v-text-primary)] hover:bg-[var(--v-elevated)] border border-[var(--v-border)]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort & Perspective Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <IconSliders className="w-3.5 h-3.5 text-[var(--v-text-muted)]" />
            <span className="text-[var(--v-text-muted)] font-medium hidden sm:inline">View:</span>
            <button
              onClick={() => setSortOption("latest")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "latest"
                  ? "bg-[var(--v-panel)] text-[var(--v-text-primary)] font-semibold border border-[var(--v-border)] shadow-sm"
                  : "text-[var(--v-text-muted)] hover:text-[var(--v-text-primary)]"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortOption("polarized")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "polarized"
                  ? "bg-[var(--v-panel)] text-[var(--v-text-primary)] font-semibold border border-[var(--v-border)] shadow-sm"
                  : "text-[var(--v-text-muted)] hover:text-[var(--v-text-primary)]"
              }`}
            >
              Polarized
            </button>
            <button
              onClick={() => setSortOption("balanced")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "balanced"
                  ? "bg-[var(--v-panel)] text-[var(--v-text-primary)] font-semibold border border-[var(--v-border)] shadow-sm"
                  : "text-[var(--v-text-muted)] hover:text-[var(--v-text-primary)]"
              }`}
            >
              Consensus
            </button>
          </div>
        </div>
      </section>

      {/* --- MAIN FEED CONTENT --- */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8 space-y-10">
        {/* --- FEATURED SPOTLIGHT CARD --- */}
        {featuredArticle && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E64A19]" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--v-text-primary)]">
                  Featured Perspective Spotlight
                </h2>
              </div>
              <span className="text-xs text-[var(--v-text-muted)] font-mono">
                Model: text-analysis-v4
              </span>
            </div>

            <div className="bg-[var(--v-panel)] rounded-xl border border-[var(--v-border)] p-5 lg:p-7 shadow-xl hover:border-[#E64A19]/50 transition-all vxn-card-glow">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Media Thumbnail */}
                <div className="lg:col-span-4">
                  <ArticleImageThumbnail
                    theme={featuredArticle.imageTheme}
                    className="w-full h-56 lg:h-64"
                  />
                </div>

                {/* Article Info & AI Analysis */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Category & Source Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#E64A19] dark:text-[#FF9800] uppercase tracking-wider">
                        {featuredArticle.source}
                      </span>
                      <span className="text-[var(--v-text-dim)]">•</span>
                      <span className="text-[var(--v-text-muted)] font-medium">
                        {featuredArticle.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FramingBadge label={featuredArticle.biasLabel} />
                      <SentimentBadge sentiment={featuredArticle.sentiment} />
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl lg:text-2xl font-bold text-[var(--v-text-primary)] hover:text-[#E64A19] dark:hover:text-[#FF9800] transition-colors leading-snug cursor-pointer">
                    {featuredArticle.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-[var(--v-text-secondary)] leading-relaxed">
                    {featuredArticle.summary}
                  </p>

                  {/* THICK Bias Meter Container */}
                  <div className="bg-[var(--v-elevated)] p-4 rounded-xl border border-[var(--v-border)] space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[var(--v-text-muted)]">
                      <span className="font-semibold text-[var(--v-text-primary)] flex items-center gap-1.5">
                        <IconSparkles className="w-4 h-4 text-[#E64A19] dark:text-[#FF9800]" />
                        AI-Estimated Framing Distribution
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {Math.round(featuredArticle.confidence * 100)}% Confidence
                      </span>
                    </div>
                    {/* Thick Bias Meter */}
                    <BiasMeter bias={featuredArticle.bias} size="lg" />
                  </div>

                  {/* Metadata & Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--v-border)] text-xs text-[var(--v-text-muted)]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <IconClock className="w-3.5 h-3.5 text-[var(--v-text-muted)]" />
                        {featuredArticle.publishedAt}
                      </span>
                      <span>•</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleBookmark(featuredArticle.id)}
                        className="p-1.5 hover:text-[var(--v-text-primary)] text-[var(--v-text-muted)] transition-colors rounded-md hover:bg-[var(--v-elevated)]"
                        title="Bookmark"
                      >
                        <IconBookmark
                          className="w-4 h-4"
                          filled={savedIds.has(featuredArticle.id)}
                        />
                      </button>
                      <button
                        onClick={() => showToast("Perspective link copied to clipboard")}
                        className="p-1.5 hover:text-[var(--v-text-primary)] text-[var(--v-text-muted)] transition-colors rounded-md hover:bg-[var(--v-elevated)]"
                        title="Share"
                      >
                        <IconShare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- ARTICLE FEED GRID --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-[var(--v-text-primary)] flex items-center gap-2">
              <span>Latest News Stream</span>
              <span className="text-xs font-normal text-[var(--v-text-muted)]">
                ({filteredArticles.length} perspectives found)
              </span>
            </h2>
            <div className="text-xs text-[var(--v-text-muted)]">
              Updated live from Supabase pipeline
            </div>
          </div>

          {gridArticles.length === 0 ? (
            <div className="bg-[var(--v-panel)] rounded-xl border border-[var(--v-border)] p-12 text-center space-y-3">
              <IconSearch className="w-8 h-8 text-[var(--v-text-muted)] mx-auto" />
              <h4 className="text-base font-semibold text-[var(--v-text-primary)]">
                No articles match your filter
              </h4>
              <p className="text-xs text-[var(--v-text-muted)]">
                Try adjusting your search query or selecting &quot;All&quot; topics.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#E64A19] rounded-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map((article) => {
                const isSaved = savedIds.has(article.id);

                return (
                  <article
                    key={article.id}
                    className="bg-[var(--v-panel)] rounded-xl border border-[var(--v-border)] p-4 flex flex-col justify-between space-y-4 vxn-card-glow shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      {/* Image Preview */}
                      <ArticleImageThumbnail
                        theme={article.imageTheme}
                        className="w-full h-36"
                      />

                      {/* Header: Source & Badges */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-[#E64A19] dark:text-[#FF9800] font-semibold">
                            {article.source}
                          </span>
                          <span className="text-[var(--v-text-dim)]">•</span>
                          <span className="text-[var(--v-text-muted)]">{article.category}</span>
                        </div>
                        <FramingBadge label={article.biasLabel} />
                      </div>

                      {/* Headline */}
                      <h4 className="text-base font-bold text-[var(--v-text-primary)] leading-snug line-clamp-2 hover:text-[#E64A19] dark:hover:text-[#FF9800] transition-colors cursor-pointer">
                        {article.title}
                      </h4>

                      {/* Summary Snippet */}
                      <p className="text-xs text-[var(--v-text-muted)] line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    {/* Footer analysis and THICK meter */}
                    <div className="space-y-3 pt-3 border-t border-[var(--v-border)]">
                      {/* Sentiment readout */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[var(--v-text-muted)] font-semibold">
                          Sentiment:
                        </span>
                        <SentimentBadge sentiment={article.sentiment} />
                      </div>

                      {/* Thick Bias Meter */}
                      <BiasMeter bias={article.bias} size="md" />

                      {/* Metadata & Actions */}
                      <div className="flex items-center justify-between text-[11px] text-[var(--v-text-muted)] pt-1">
                        <span className="flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {article.publishedAt}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-mono">{article.readTime}</span>
                          <button
                            onClick={() => toggleBookmark(article.id)}
                            className={`p-1 rounded hover:bg-[var(--v-elevated)] transition-colors ${
                              isSaved ? "text-[#E64A19]" : "text-[var(--v-text-muted)] hover:text-[var(--v-text-primary)]"
                            }`}
                            title="Save"
                          >
                            <IconBookmark className="w-3.5 h-3.5" filled={isSaved} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* --- DESIGN SYSTEM COLOR & BIAS ARCHITECTURE KEY --- */}
        <section className="bg-[var(--v-panel)] rounded-xl border border-[var(--v-border)] p-6 lg:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--v-border)] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--v-text-primary)] flex items-center gap-2">
                <IconShieldCheck className="w-5 h-5 text-[#E64A19] dark:text-[#FF9800]" />
                vibeXnews Methodology &amp; AI Framing Architecture
              </h3>
              <p className="text-xs text-[var(--v-text-muted)] mt-0.5">
                Transparent breakdown of political perspective ratios and sentiment computation.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[var(--v-elevated)] text-[#E64A19] dark:text-[#FF9800] border border-[var(--v-border)] self-start sm:self-auto font-semibold">
              Design System v1.1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Bias card */}
            <div className="bg-[var(--v-elevated)] p-4 rounded-lg border border-[var(--v-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C62828]" />
                  <h4 className="text-sm font-bold text-[var(--v-text-primary)]">Left Framing</h4>
                </div>
                <span className="text-[10px] font-mono text-[#C62828] bg-[#C62828]/10 px-1.5 py-0.5 rounded font-bold">
                  #C62828
                </span>
              </div>
              <p className="text-xs text-[var(--v-text-muted)] leading-relaxed">
                Highlights labor rights, structural inequality, regulatory governance, progressive policy frameworks, and public sector solutions.
              </p>
            </div>

            {/* Center Neutral card */}
            <div className="bg-[var(--v-elevated)] p-4 rounded-lg border border-[var(--v-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#757575]" />
                  <h4 className="text-sm font-bold text-[var(--v-text-primary)]">Center Neutral</h4>
                </div>
                <span className="text-[10px] font-mono text-[var(--v-text-muted)] bg-slate-500/10 px-1.5 py-0.5 rounded font-bold">
                  #757575
                </span>
              </div>
              <p className="text-xs text-[var(--v-text-muted)] leading-relaxed">
                Represents factual data reporting, consensus summaries, multi-perspective balance, and neutral non-emotive journalistic diction.
              </p>
            </div>

            {/* Right Bias card */}
            <div className="bg-[var(--v-elevated)] p-4 rounded-lg border border-[var(--v-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#D97706] dark:bg-[#FFD54F]" />
                  <h4 className="text-sm font-bold text-[var(--v-text-primary)]">Right Framing</h4>
                </div>
                <span className="text-[10px] font-mono text-[#D97706] dark:text-[#FFD54F] bg-[#FF9800]/10 px-1.5 py-0.5 rounded font-bold">
                  #FFD54F
                </span>
              </div>
              <p className="text-xs text-[var(--v-text-muted)] leading-relaxed">
                Highlights free-market incentives, individual liberties, fiscal restraint, traditional institutional authority, and corporate competitiveness.
              </p>
            </div>
          </div>

          {/* AI Estimation Disclaimer */}
          <div className="bg-[var(--v-elevated)] p-4 rounded-lg border border-[var(--v-border)] flex items-start gap-3 text-xs text-[var(--v-text-muted)]">
            <span className="text-[#E64A19] font-bold text-sm">ⓘ</span>
            <p className="leading-relaxed">
              <strong className="text-[var(--v-text-primary)]">AI-Estimated Framing Disclaimer:</strong> Political perspective ratios (Left, Center, Right) are computed through natural language processing of article body text, rhetoric structure, and loaded phrasing. They represent algorithmic estimates, not objective truth, and are never inferred from source names alone.
            </p>
          </div>
        </section>
      </main>

      {/* --- BRAND FOOTER --- */}
      <footer className="border-t border-[var(--v-border)] bg-[var(--v-background)] px-4 lg:px-8 py-8 mt-12">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-1">
            <VXNLogo size="sm" />
            <p className="text-xs text-[var(--v-text-muted)]">
              Stay Vibe. Data-driven. Stay consistent. Stay un-biased.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--v-text-muted)]">
            <button
              onClick={() => showToast("Documentation & methodology loaded.")}
              className="hover:text-[var(--v-text-primary)] transition-colors"
            >
              Methodology
            </button>
            <button
              onClick={() => showToast("Scraped news sources: Reuters, AP, BBC, Guardian, WSJ, NPR.")}
              className="hover:text-[var(--v-text-primary)] transition-colors"
            >
              Verified Sources
            </button>
            <button
              onClick={() => showToast("API documentation is under /api routes.")}
              className="hover:text-[var(--v-text-primary)] transition-colors"
            >
              API Reference
            </button>
            <button
              onClick={() => showToast("Privacy-preserving AI processing.")}
              className="hover:text-[var(--v-text-primary)] transition-colors"
            >
              Privacy Policy
            </button>
          </div>

          <div className="text-xs text-[var(--v-text-muted)] font-mono">
            Design System v1.1 • August 23, 2026
          </div>
        </div>
      </footer>
    </div>
  );
}