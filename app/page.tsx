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
          <path
            d="M8 12L18 36H24L14 12H8Z"
            fill="url(#vxn-grad-1)"
          />
          <path
            d="M20 20L28 36H34L26 20H20Z"
            fill="url(#vxn-grad-2)"
          />
          <path
            d="M32 12L40 36H44L36 12H32Z"
            fill="url(#vxn-grad-3)"
          />
          {/* Floating Ember Accent */}
          <circle cx="28" cy="14" r="3.5" fill="#FFD54F" />
          
          <defs>
            <radialGradient id="vxn-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E64A19" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="vxn-grad-1" x1="8" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D32F2F" />
              <stop offset="1" stopColor="#E64A19" />
            </linearGradient>
            <linearGradient id="vxn-grad-2" x1="20" y1="20" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E64A19" />
              <stop offset="1" stopColor="#FF9800" />
            </linearGradient>
            <linearGradient id="vxn-grad-3" x1="32" y1="12" x2="44" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF9800" />
              <stop offset="1" stopColor="#FFD54F" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="font-bold text-white tracking-tight text-xl leading-none">
            Vibe
          </span>
          <span className="font-bold text-[#FF9800] tracking-tight text-xl leading-none">
            X
          </span>
          <span className="font-bold text-white tracking-tight text-xl leading-none">
            news
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-[#9E9E9E] font-medium leading-tight mt-0.5">
          Perspectives & AI
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
  const gradients = {
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
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${gradients[theme]} border border-[#2C2C2C] flex items-center justify-center ${className}`}
    >
      {/* Decorative Grid Lines */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `linear-gradient(to right, #404040 1px, transparent 1px), linear-gradient(to bottom, #404040 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Abstract Editorial Silhouette & Data Visual */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
        {/* Subtle circular data radar */}
        <div className="relative w-16 h-16 rounded-full border border-[#333] flex items-center justify-center mb-2">
          <div
            className="w-10 h-10 rounded-full opacity-30 animate-pulse"
            style={{ backgroundColor: accentColors[theme] }}
          />
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-40 animate-spin"
            style={{
              borderColor: accentColors[theme],
              animationDuration: "20s",
            }}
          />
          <IconTrending className="w-5 h-5 text-white/90 z-10" />
        </div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#9E9E9E]">
          AI Perspective Stream
        </span>
      </div>

      {/* Corner Glow */}
      <div
        className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-25"
        style={{ backgroundColor: accentColors[theme] }}
      />
    </div>
  );
}

// --- 3-Way Segmented Bias Meter Component ---
function BiasMeter({
  bias,
  showLabels = true,
  size = "md",
}: {
  bias: BiasBreakdown;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const barHeight = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className="w-full space-y-1.5">
      {showLabels && (
        <div className="flex items-center justify-between text-[11px] font-medium tracking-tight">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C62828]" />
            <span className="text-[#C62828]">Left {bias.left}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#757575]" />
            <span className="text-[#9E9E9E]">Center {bias.center}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FFD54F]" />
            <span className="text-[#FFD54F]">Right {bias.right}%</span>
          </div>
        </div>
      )}

      {/* Segmented Progress Bar */}
      <div
        className={`w-full ${barHeight} rounded-full bg-[#121212] overflow-hidden flex p-0.5 border border-[#2C2C2C]`}
      >
        <div
          style={{ width: `${bias.left}%` }}
          className="h-full bg-[#C62828] rounded-l-full transition-all duration-500 ease-out"
          title={`Left Framing: ${bias.left}%`}
        />
        <div
          style={{ width: `${bias.center}%` }}
          className="h-full bg-[#757575] transition-all duration-500 ease-out"
          title={`Center Neutral: ${bias.center}%`}
        />
        <div
          style={{ width: `${bias.right}%` }}
          className="h-full bg-[#FFD54F] rounded-r-full transition-all duration-500 ease-out"
          title={`Right Framing: ${bias.right}%`}
        />
      </div>
    </div>
  );
}

// --- Sentiment Badge Component ---
function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const isPositive = sentiment.score > 0.15;
  const isNegative = sentiment.score < -0.15;

  const bgStyle = isPositive
    ? "bg-[#1E2E1E] text-[#66BB6A] border-[#2E7D32]/40"
    : isNegative
    ? "bg-[#2E1A1A] text-[#EF5350] border-[#C62828]/40"
    : "bg-[#1E1E1E] text-[#B0BEC5] border-[#455A64]/40";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${bgStyle}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPositive
            ? "bg-[#66BB6A]"
            : isNegative
            ? "bg-[#EF5350]"
            : "bg-[#B0BEC5]"
        }`}
      />
      {sentiment.label}{" "}
      <span className="opacity-70 font-mono text-[10px]">
        ({sentiment.score >= 0 ? `+${sentiment.score.toFixed(2)}` : sentiment.score.toFixed(2)})
      </span>
    </span>
  );
}

// --- Framing Label Badge ---
function FramingBadge({ label }: { label: Article["biasLabel"] }) {
  const styles = {
    Left: "bg-[#C62828]/15 text-[#EF5350] border-[#C62828]/40",
    Center: "bg-[#757575]/15 text-[#E0E0E0] border-[#757575]/40",
    Right: "bg-[#FFD54F]/15 text-[#FFD54F] border-[#FFD54F]/40",
    Mixed: "bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/40",
    Unclear: "bg-[#424242]/15 text-[#9E9E9E] border-[#424242]/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${styles[label]}`}
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
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#E64A19] selection:text-white">
      {/* --- Toast Alert --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E1E] text-[#FF9800] border border-[#FF9800]/40 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <IconShieldCheck className="w-4 h-4 text-[#FF9800]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- TOP STICKY HEADER --- */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2C2C2C] px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <VXNLogo size="md" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#9E9E9E]">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedCategory === "All"
                    ? "text-white bg-[#1E1E1E] border border-[#2C2C2C]"
                    : "hover:text-white hover:bg-[#1A1A1A]"
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
                      ? "text-white bg-[#1E1E1E] border border-[#2C2C2C]"
                      : "hover:text-white hover:bg-[#1A1A1A]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            {/* Search Input Bar */}
            <div className="relative hidden sm:flex items-center">
              <IconSearch className="absolute left-3 w-4 h-4 text-[#757575]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perspectives & topics..."
                className="w-56 lg:w-72 pl-9 pr-8 py-1.5 text-xs bg-[#1E1E1E] text-white placeholder-[#757575] border border-[#2C2C2C] rounded-full focus:outline-none focus:border-[#E64A19] focus:ring-1 focus:ring-[#E64A19] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-xs text-[#757575] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sign In button */}
            <button
              onClick={() => showToast("Clerk authentication is ready for setup.")}
              className="px-4 py-1.5 text-xs font-medium text-[#E0E0E0] bg-[#1E1E1E] hover:bg-[#2C2C2C] border border-[#2C2C2C] rounded-md transition-colors"
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
              className="md:hidden p-2 text-[#9E9E9E] hover:text-white bg-[#1E1E1E] rounded-md border border-[#2C2C2C]"
            >
              <IconMenu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[#2C2C2C] space-y-2">
            <div className="relative mb-2">
              <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-[#757575]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perspectives & topics..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#1E1E1E] text-white border border-[#2C2C2C] rounded-md"
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
                      : "bg-[#1E1E1E] text-[#9E9E9E]"
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
      <section className="border-b border-[#2C2C2C] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-4 lg:px-8 py-8 lg:py-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-[11px] font-medium text-[#FF9800]">
                <span className="w-2 h-2 rounded-full bg-[#E64A19] animate-ping" />
                <span>Live AI News Analysis Engine</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                Vibrancy in perspectives. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#E64A19] via-[#FF9800] to-[#FFD54F] bg-clip-text text-transparent">
                  Data-driven clarity.
                </span>
              </h1>
              <p className="text-sm text-[#9E9E9E] leading-relaxed">
                Real news articles collected from verified global publishers, parsed, and analyzed with AI to reveal political framing, sentiment, and narrative balance.
              </p>
            </div>

            {/* Quick Metrics Dashboard Bar */}
            <div className="grid grid-cols-3 gap-3 bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C]">
              <div className="text-center px-2">
                <span className="block text-lg font-bold text-white font-mono">14</span>
                <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">Sources</span>
              </div>
              <div className="text-center px-2 border-x border-[#2C2C2C]">
                <span className="block text-lg font-bold text-[#FF9800] font-mono">100%</span>
                <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">AI Scored</span>
              </div>
              <div className="text-center px-2">
                <span className="block text-lg font-bold text-[#66BB6A] font-mono">94.2%</span>
                <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FILTER CHIPS & CONTROLS BAR --- */}
      <section className="px-4 lg:px-8 py-4 border-b border-[#2C2C2C] bg-[#0E0E0E]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Category Chips (matches UI element reference) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-[#757575] font-semibold uppercase tracking-wider mr-1 hidden sm:inline">
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
                      : "bg-[#1E1E1E] text-[#9E9E9E] hover:text-white hover:bg-[#2C2C2C] border border-[#2C2C2C]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort & Perspective Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <IconSliders className="w-3.5 h-3.5 text-[#757575]" />
            <span className="text-[#757575] font-medium hidden sm:inline">View:</span>
            <button
              onClick={() => setSortOption("latest")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "latest"
                  ? "bg-[#2C2C2C] text-white font-medium border border-[#333]"
                  : "text-[#9E9E9E] hover:text-white"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortOption("polarized")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "polarized"
                  ? "bg-[#2C2C2C] text-white font-medium border border-[#333]"
                  : "text-[#9E9E9E] hover:text-white"
              }`}
            >
              Polarized
            </button>
            <button
              onClick={() => setSortOption("balanced")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sortOption === "balanced"
                  ? "bg-[#2C2C2C] text-white font-medium border border-[#333]"
                  : "text-[#9E9E9E] hover:text-white"
              }`}
            >
              Consensus
            </button>
          </div>
        </div>
      </section>

      {/* --- MAIN FEED CONTENT --- */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8 space-y-10">
        {/* --- FEATURED SPOTLIGHT CARD (CARD EXAMPLE from UI reference) --- */}
        {featuredArticle && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E64A19]" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-[#E0E0E0]">
                  Featured Perspective Spotlight
                </h2>
              </div>
              <span className="text-xs text-[#757575] font-mono">
                Model: text-analysis-v4
              </span>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-5 lg:p-7 shadow-2xl hover:border-[#E64A19]/50 transition-all vxn-card-glow">
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
                      <span className="font-semibold text-[#FF9800] uppercase tracking-wider">
                        {featuredArticle.source}
                      </span>
                      <span className="text-[#616161]">•</span>
                      <span className="text-[#9E9E9E]">{featuredArticle.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FramingBadge label={featuredArticle.biasLabel} />
                      <SentimentBadge sentiment={featuredArticle.sentiment} />
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl lg:text-2xl font-bold text-white hover:text-[#FF9800] transition-colors leading-snug cursor-pointer">
                    {featuredArticle.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-[#BDBDBD] leading-relaxed">
                    {featuredArticle.summary}
                  </p>

                  {/* Bias Meter Block (exact UI reference styling) */}
                  <div className="bg-[#121212] p-3.5 rounded-lg border border-[#2C2C2C] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#9E9E9E]">
                      <span className="font-medium text-white flex items-center gap-1.5">
                        <IconSparkles className="w-3.5 h-3.5 text-[#FF9800]" />
                        AI-Estimated Framing Distribution
                      </span>
                      <span className="text-[11px] font-mono text-[#66BB6A]">
                        {Math.round(featuredArticle.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <BiasMeter bias={featuredArticle.bias} size="lg" />
                  </div>

                  {/* Metadata & Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2C]/60 text-xs text-[#9E9E9E]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <IconClock className="w-3.5 h-3.5 text-[#757575]" />
                        {featuredArticle.publishedAt}
                      </span>
                      <span>•</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleBookmark(featuredArticle.id)}
                        className="p-1.5 hover:text-white text-[#9E9E9E] transition-colors rounded-md hover:bg-[#2C2C2C]"
                        title="Bookmark"
                      >
                        <IconBookmark
                          className="w-4 h-4"
                          filled={savedIds.has(featuredArticle.id)}
                        />
                      </button>
                      <button
                        onClick={() => showToast("Perspective link copied to clipboard")}
                        className="p-1.5 hover:text-white text-[#9E9E9E] transition-colors rounded-md hover:bg-[#2C2C2C]"
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
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Latest News Stream</span>
              <span className="text-xs font-normal text-[#9E9E9E]">
                ({filteredArticles.length} perspectives found)
              </span>
            </h2>
            <div className="text-xs text-[#9E9E9E]">
              Updated live from Supabase pipeline
            </div>
          </div>

          {gridArticles.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-12 text-center space-y-3">
              <IconSearch className="w-8 h-8 text-[#757575] mx-auto" />
              <h4 className="text-base font-semibold text-white">No articles match your filter</h4>
              <p className="text-xs text-[#9E9E9E]">
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
                    className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-4 flex flex-col justify-between space-y-4 vxn-card-glow shadow-lg transition-all"
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
                          <span className="text-[#FF9800]">{article.source}</span>
                          <span className="text-[#616161]">•</span>
                          <span className="text-[#9E9E9E]">{article.category}</span>
                        </div>
                        <FramingBadge label={article.biasLabel} />
                      </div>

                      {/* Headline */}
                      <h4 className="text-base font-bold text-white leading-snug line-clamp-2 hover:text-[#FF9800] transition-colors cursor-pointer">
                        {article.title}
                      </h4>

                      {/* Summary Snippet */}
                      <p className="text-xs text-[#9E9E9E] line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    {/* Footer analysis and meter */}
                    <div className="space-y-3 pt-3 border-t border-[#2C2C2C]">
                      {/* Sentiment readout */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#757575] font-medium">
                          Sentiment:
                        </span>
                        <SentimentBadge sentiment={article.sentiment} />
                      </div>

                      {/* Bias Meter */}
                      <BiasMeter bias={article.bias} size="sm" />

                      {/* Metadata & Actions */}
                      <div className="flex items-center justify-between text-[11px] text-[#757575] pt-1">
                        <span className="flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {article.publishedAt}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-mono">{article.readTime}</span>
                          <button
                            onClick={() => toggleBookmark(article.id)}
                            className={`p-1 rounded hover:bg-[#2C2C2C] transition-colors ${
                              isSaved ? "text-[#E64A19]" : "text-[#757575] hover:text-white"
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

        {/* --- DESIGN SYSTEM COLOR & BIAS ARCHITECTURE KEY (From UI Reference) --- */}
        <section className="bg-[#121212] rounded-xl border border-[#2C2C2C] p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C2C2C] pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <IconShieldCheck className="w-5 h-5 text-[#FF9800]" />
                vibeXnews Methodology &amp; AI Framing Architecture
              </h3>
              <p className="text-xs text-[#9E9E9E] mt-0.5">
                Transparent breakdown of political perspective ratios and sentiment computation.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#1E1E1E] text-[#FF9800] border border-[#2C2C2C] self-start sm:self-auto">
              Design System v1.1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Bias card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C62828]" />
                  <h4 className="text-sm font-bold text-white">Left Framing</h4>
                </div>
                <span className="text-[10px] font-mono text-[#C62828] bg-[#C62828]/10 px-1.5 py-0.5 rounded">
                  #C62828
                </span>
              </div>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Highlights labor rights, structural inequality, regulatory governance, progressive policy frameworks, and public sector solutions.
              </p>
            </div>

            {/* Center Neutral card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#757575]" />
                  <h4 className="text-sm font-bold text-white">Center Neutral</h4>
                </div>
                <span className="text-[10px] font-mono text-[#9E9E9E] bg-[#757575]/10 px-1.5 py-0.5 rounded">
                  #757575
                </span>
              </div>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Represents factual data reporting, consensus summaries, multi-perspective balance, and neutral non-emotive journalistic diction.
              </p>
            </div>

            {/* Right Bias card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFD54F]" />
                  <h4 className="text-sm font-bold text-white">Right Framing</h4>
                </div>
                <span className="text-[10px] font-mono text-[#FFD54F] bg-[#FFD54F]/10 px-1.5 py-0.5 rounded">
                  #FFD54F
                </span>
              </div>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Highlights free-market incentives, individual liberties, fiscal restraint, traditional institutional authority, and corporate competitiveness.
              </p>
            </div>
          </div>

          {/* AI Estimation Disclaimer */}
          <div className="bg-[#181818] p-4 rounded-lg border border-[#2C2C2C] flex items-start gap-3 text-xs text-[#9E9E9E]">
            <span className="text-[#E64A19] font-bold text-sm">ⓘ</span>
            <p className="leading-relaxed">
              <strong className="text-white">AI-Estimated Framing Disclaimer:</strong> Political perspective ratios (Left, Center, Right) are computed through natural language processing of article body text, rhetoric structure, and loaded phrasing. They represent algorithmic estimates, not objective truth, and are never inferred from source names alone.
            </p>
          </div>
        </section>
      </main>

      {/* --- BRAND FOOTER --- */}
      <footer className="border-t border-[#2C2C2C] bg-[#0A0A0A] px-4 lg:px-8 py-8 mt-12">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-1">
            <VXNLogo size="sm" />
            <p className="text-xs text-[#757575]">
              Stay Vibe. Data-driven. Stay consistent. Stay un-biased.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9E9E9E]">
            <button
              onClick={() => showToast("Documentation & methodology loaded.")}
              className="hover:text-white transition-colors"
            >
              Methodology
            </button>
            <button
              onClick={() => showToast("Scraped news sources: Reuters, AP, BBC, Guardian, WSJ, NPR.")}
              className="hover:text-white transition-colors"
            >
              Verified Sources
            </button>
            <button
              onClick={() => showToast("API documentation is under /api routes.")}
              className="hover:text-white transition-colors"
            >
              API Reference
            </button>
            <button
              onClick={() => showToast("Privacy-preserving AI processing.")}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
          </div>

          <div className="text-xs text-[#616161] font-mono">
            Design System v1.1 • August 23, 2026
          </div>
        </div>
      </footer>
    </div>
  );
}