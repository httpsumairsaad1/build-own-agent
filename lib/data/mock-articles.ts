export type BiasBreakdown = {
  left: number;
  center: number;
  right: number;
};

export type Sentiment = {
  label: "Positive" | "Neutral" | "Negative";
  score: number; // -1.0 to +1.0
};

export type Article = {
  id: string;
  source: string;
  sourceUrl?: string;
  category: "Politics" | "Tech-Vibe" | "Social Change" | "Economy" | "Pop Culture";
  title: string;
  summary: string;
  fullText: string[];
  keyTakeaways: string[];
  publishedAt: string;
  readTime: string;
  author: string;
  imageTheme: "politics" | "tech" | "social" | "economy" | "climate" | "culture";
  bias: BiasBreakdown;
  biasLabel: "Left" | "Center" | "Right" | "Mixed" | "Unclear";
  derivedBiasScore: number; // (right - left) / 100 -> -1 to +1
  sentiment: Sentiment;
  confidence: number; // 0 to 1
  framingNotes: string;
  loadedTerms: { term: string; context: string; biasWeight: "left" | "right" | "emotive" | "center" }[];
  model: string;
  disclaimer: string;
  isFeatured?: boolean;
};

export const MOCK_ARTICLES: Article[] = [
  {
    id: "gen-z-media-views",
    source: "VibeXnews",
    sourceUrl: "https://vibexnews.internal/analysis/gen-z-data",
    category: "Politics",
    title: "Gen Z Views on Data in Media: A VibeX Analysis",
    summary:
      "This comprehensive analysis explores shifting generational perspectives on media polarization, data sovereignty, and algorithmic transparency across global news reporting.",
    fullText: [
      "In a landscape saturated by hyper-targeted content streams and algorithmic echo chambers, younger news consumers are forging a distinctly pragmatic relationship with digital media. Rather than adhering to conventional partisan broadcast affiliations, Gen Z audiences increasingly interrogate the data pipelines and monetization models underpinning modern newsrooms.",
      "Our multi-outlet media audit reveals that 74% of respondents under age 28 express skepticism toward sensationalized headline framing, favoring raw transcripts, cross-source comparison tools, and transparent bias indicators. This transition reflects a deeper demand for epistemic sovereignty in the digital public square.",
      "Furthermore, the proliferation of AI-generated summaries and synthesized narrative feeds has heightened concerns regarding implicit corporate or political alignment. As legacy institutions grapple with declining subscriber loyalty, publishers that prioritize methodology disclosures, open-access citation trails, and multi-perspective framing metrics are demonstrating the highest retention among emerging civic leaders.",
      "The ultimate takeaway is clear: the future of news literacy hinges not on enforcing an artificial consensus, but on equipping readers with the analytical instruments needed to detect narrative architecture in real time."
    ],
    keyTakeaways: [
      "74% of emerging readers prefer cross-source bias auditing over single-outlet loyalty.",
      "Algorithmic transparency and open citation trails drive highest civic engagement.",
      "Subtle headline framing is scrutinized more heavily than explicit editorial op-eds."
    ],
    publishedAt: "2 hours ago",
    readTime: "12 min read",
    author: "Elena Rostova • Lead Media Analyst",
    imageTheme: "politics",
    bias: { left: 15, center: 70, right: 15 },
    biasLabel: "Center",
    derivedBiasScore: 0.00,
    sentiment: { label: "Neutral", score: 0.08 },
    confidence: 0.94,
    framingNotes:
      "Balanced empirical tone prioritizing statistical survey findings and generational media habit studies. Diction avoids partisan advocacy while highlighting broad technological transparency.",
    loadedTerms: [
      { term: "epistemic sovereignty", context: "used to describe reader autonomy over information intake", biasWeight: "emotive" },
      { term: "algorithmic echo chambers", context: "describes commercial recommendation pipelines", biasWeight: "emotive" }
    ],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer:
      "AI-Estimated framing scores evaluate linguistic syntax, perspective distribution, and framing balance. Scores do not represent objective moral or factual verdicts.",
    isFeatured: true
  },
  {
    id: "clean-energy-transition",
    source: "Reuters",
    sourceUrl: "https://reuters.com/business/energy-transition-2026",
    category: "Tech-Vibe",
    title: "Global Clean Energy Transition Accelerates as Grid Investments Reach Historic Highs",
    summary:
      "Public and private capital commitments toward next-generation battery storage and continental grid resilience have surpassed benchmark targets for the third consecutive quarter.",
    fullText: [
      "Global investments in renewable energy infrastructure and smart power grids surged to record levels this quarter, driven by breakthroughs in utility-scale solid-state storage and coordinated cross-border power sharing agreements.",
      "International energy consortiums reported that solar and offshore wind now comprise over 38% of newly installed capacity worldwide, substantially reducing fossil fuel baseline dependency during peak seasonal load periods.",
      "While supply chain bottlenecks for critical rare earth minerals remain a focal point for trade negotiators, decentralized grid management systems powered by predictive load algorithms have mitigated brownout risks across several industrial hubs.",
      "Industry analysts anticipate capital allocations will expand further as municipal green bonds and private equity funds deploy over $450 billion into high-voltage direct current (HVDC) transmission lines through the remainder of the decade."
    ],
    keyTakeaways: [
      "Renewable grid allocations surpassed $450B benchmark worldwide.",
      "Decentralized power storage algorithms stabilized seasonal industrial demand peaks.",
      "Supply chain diversification for rare-earth components remains key strategic focus."
    ],
    publishedAt: "3 hours ago",
    readTime: "6 min read",
    author: "Marcus Vance • Energy Correspondent",
    imageTheme: "climate",
    bias: { left: 20, center: 65, right: 15 },
    biasLabel: "Center",
    derivedBiasScore: -0.05,
    sentiment: { label: "Positive", score: 0.45 },
    confidence: 0.96,
    framingNotes:
      "Predominantly objective financial and technical reporting with factual statistics on capital allocation and industrial grid deployment.",
    loadedTerms: [
      { term: "breakthroughs", context: "describing utility storage efficiency gains", biasWeight: "emotive" }
    ],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  },
  {
    id: "federal-reserve-rate-outlook",
    source: "Associated Press",
    sourceUrl: "https://apnews.com/economy/fed-rate-policy-2026",
    category: "Economy",
    title: "Federal Reserve Maintains Steady Rate Outlook Amid Balanced Labor and Inflation Metrics",
    summary:
      "Central bank officials signaled a patient posture following composite economic data indicating stable wage expansion alongside moderating consumer price pressures.",
    fullText: [
      "Federal Reserve governors voted unanimously to maintain baseline target lending rates, pointing to dual indicators of resilient job growth and orderly deceleration in core consumer expenditure indices.",
      "During the post-meeting press briefing, policymakers highlighted that while services inflation has proven somewhat persistent, manufacturing input costs and container shipping rates have stabilized near pre-shock baselines.",
      "Economists widely interpreted the guidance as neutral, reflecting an institutional desire to avoid premature easing while guarding against unwarranted credit contraction across small-business lending markets.",
      "Bond markets reacted with measured gains, with the 10-year Treasury yield easing four basis points as equity indices reflected steady confidence in the economic soft-landing consensus."
    ],
    keyTakeaways: [
      "Target benchmark lending rate held steady by unanimous committee vote.",
      "Core consumer price expansion cooled toward targeted 2% annualized corridor.",
      "Credit spreads across small business lending remain stable."
    ],
    publishedAt: "4 hours ago",
    readTime: "5 min read",
    author: "Sarah Jenkins • Financial Markets Desk",
    imageTheme: "economy",
    bias: { left: 10, center: 80, right: 10 },
    biasLabel: "Center",
    derivedBiasScore: 0.00,
    sentiment: { label: "Neutral", score: -0.02 },
    confidence: 0.98,
    framingNotes:
      "Highly neutral, factual reporting with institutional quotes and balanced economic indicator citations.",
    loadedTerms: [],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  },
  {
    id: "urban-housing-affordability",
    source: "The Guardian",
    sourceUrl: "https://theguardian.com/society/housing-crisis-tenant-mobilization",
    category: "Social Change",
    title: "Urban Housing Affordability Crisis Prompts Nationwide Tenant Union Mobilizations",
    summary:
      "Grassroots advocacy coalitions are organizing rent stabilization ballots across metropolitan hubs, demanding stricter rent caps and progressive municipal zoning reform.",
    fullText: [
      "Rising rent burdens across tier-one metropolitan areas have sparked one of the largest coordinated tenant organizing drives in decades, as working-class families and young renters push back against speculative corporate landlords.",
      "Coalition organizers across ten major cities have qualified municipal referendums designed to limit annual rent hikes, close eviction loopholes, and mandate community land trust development on surplus public property.",
      "Housing policy advocates emphasize that unchecked institutional acquisition of single-family housing portfolios has distorted local markets, squeezing middle-income workers into prolonged economic precarity.",
      "While property owner associations contend that rent stabilization measures disincentivize private residential construction, grassroots organizers argue that shelter must be treated as a fundamental public right rather than an asset class."
    ],
    keyTakeaways: [
      "Ten major metro centers qualify rent stabilization ballot initiatives.",
      "Tenant unions highlight institutional landlord consolidation as primary affordability barrier.",
      "Debate centers on public social housing versus market-driven supply incentives."
    ],
    publishedAt: "5 hours ago",
    readTime: "8 min read",
    author: "Kofi Mensah • Urban Affairs Bureau",
    imageTheme: "social",
    bias: { left: 68, center: 22, right: 10 },
    biasLabel: "Left",
    derivedBiasScore: -0.58,
    sentiment: { label: "Negative", score: -0.52 },
    confidence: 0.93,
    framingNotes:
      "Strong emphasis on systemic inequality, grassroots labor/tenant advocacy, and structural critique of corporate real estate ownership. Gives primary voice to affected tenants.",
    loadedTerms: [
      { term: "speculative corporate landlords", context: "characterizing institutional real estate funds", biasWeight: "left" },
      { term: "economic precarity", context: "describing financial state of working renters", biasWeight: "left" },
      { term: "fundamental public right", context: "framing housing as a human entitlement", biasWeight: "left" }
    ],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  },
  {
    id: "enterprise-ai-productivity",
    source: "Wall Street Journal",
    sourceUrl: "https://wsj.com/tech/enterprise-ai-manufacturing-efficiency",
    category: "Tech-Vibe",
    title: "Enterprise AI Adoption Delivers Record Productivity Gains Across Manufacturing Sector",
    summary:
      "Capital expenditures in autonomous factory robotics and edge compute frameworks have yielded 22% operational cost reductions for major industrial manufacturers.",
    fullText: [
      "Heavy industrial manufacturers that spearheaded investments in machine vision and autonomous supply chain automation are reporting substantial bottom-line margin expansion, according to recent quarterly earnings filings.",
      "Factory floors equipped with self-optimizing robotic assembly cells have reduced scrap rates by 34% while enabling round-the-clock throughput without proportional overhead inflation.",
      "Corporate executives credit deregulatory tax incentives and expedited capital depreciation rules with accelerating equipment modernization schedules, outperforming European competitors constrained by rigid bureaucratic compliance.",
      "While labor representatives caution against potential displacement of legacy shop-floor technicians, management consultancies project that newly created robotics maintenance and systems engineering roles will offset transitional adjustments."
    ],
    keyTakeaways: [
      "22% average operational cost reductions achieved through automated machine vision.",
      "Capital depreciation incentives highlighted as primary catalyst for US manufacturing expansion.",
      "High-value technical engineering roles projected to outpace low-skill labor adjustments."
    ],
    publishedAt: "6 hours ago",
    readTime: "7 min read",
    author: "Bradley Sterling • Industrial Tech Desk",
    imageTheme: "tech",
    bias: { left: 12, center: 28, right: 60 },
    biasLabel: "Right",
    derivedBiasScore: 0.48,
    sentiment: { label: "Positive", score: 0.62 },
    confidence: 0.91,
    framingNotes:
      "Framed through free-market competitiveness, corporate profitability, tax incentive efficacy, and deregulation. Focuses heavily on executive perspectives and bottom-line margin expansion.",
    loadedTerms: [
      { term: "rigid bureaucratic compliance", context: "contrasting foreign regulatory frameworks", biasWeight: "right" },
      { term: "deregulatory tax incentives", context: "framing tax policy as positive growth driver", biasWeight: "right" },
      { term: "transitional adjustments", context: "minimizing workforce displacement concerns", biasWeight: "right" }
    ],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  },
  {
    id: "digital-creators-distribution",
    source: "BBC News",
    sourceUrl: "https://bbc.com/culture/creators-independent-streaming",
    category: "Pop Culture",
    title: "Digital Creators Challenge Traditional Studio Distribution Models with Direct Micro-Streaming",
    summary:
      "Independent cinema and documentary creators are bypassing heritage streaming platforms in favor of community-funded decentralized distribution hubs.",
    fullText: [
      "A growing cohort of independent filmmakers, investigative journalists, and creative artists is abandoning traditional Hollywood distribution contracts in favor of direct-to-audience micro-streaming ecosystems.",
      "By integrating decentralized ledger micro-payments with direct community patronage, creators retain 90% of gross viewer revenues compared to the fractional royalties typical of legacy subscription streamers.",
      "Industry veterans observe that this model is reshaping cinematic aesthetics, enabling niche, experimental, and culturally diverse narratives to achieve financial viability without catering to algorithmically optimized mass-market formulas.",
      "While issues of piracy mitigation and marketing discovery remain persistent hurdles, collective creator guilds are successfully pooling promotional resources to build resilient audience followings."
    ],
    keyTakeaways: [
      "Creators retain up to 90% revenue through direct community streaming infrastructure.",
      "Niche and experimental story formats flourish outside algorithmic studio constraints.",
      "Collaborative creator guilds challenge studio oligopolies in international markets."
    ],
    publishedAt: "8 hours ago",
    readTime: "4 min read",
    author: "Amara Okonjo • Arts & Media Correspondent",
    imageTheme: "culture",
    bias: { left: 35, center: 55, right: 10 },
    biasLabel: "Center",
    derivedBiasScore: -0.25,
    sentiment: { label: "Positive", score: 0.31 },
    confidence: 0.89,
    framingNotes:
      "Focuses on creator autonomy and cultural pluralism with balanced scrutiny of discovery and copyright hurdles.",
    loadedTerms: [
      { term: "studio oligopolies", context: "describing legacy media conglomerate dominance", biasWeight: "left" }
    ],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  },
  {
    id: "community-solar-cooperatives",
    source: "NPR",
    sourceUrl: "https://npr.org/sections/energy/rural-solar-cooperatives",
    category: "Social Change",
    title: "Community Solar Initiatives Expand Energy Access for Underserved Rural Cooperatives",
    summary:
      "Regional agricultural cooperatives are pooling federal grants and local bonds to build resilient micro-grids that lower recurring monthly utility costs.",
    fullText: [
      "In farming communities across the Midwest and Appalachia, farmer-owned electric cooperatives are transforming fallow land into community-shared solar arrays that deliver clean, discounted power directly to local residents.",
      "Financed through USDA rural electrification grants and community credit unions, the cooperative model allows members to purchase solar subscription shares, offsetting their monthly utility bills without requiring upfront rooftop installations.",
      "Local cooperative leaders emphasize that decentralized power generation protects vulnerable agricultural operations from volatile wholesale grid price spikes during severe weather events.",
      "The program serves as a scalable template for just energy transition models, ensuring that the economic dividends of technological modernization remain anchored within local rural communities."
    ],
    keyTakeaways: [
      "Community solar shares eliminate upfront capital costs for rural households.",
      "Local cooperative ownership insulates agricultural regions from energy price spikes.",
      "Combines federal grant financing with grassroots municipal ownership."
    ],
    publishedAt: "9 hours ago",
    readTime: "6 min read",
    author: "Daniel Craig • Rural Affairs Correspondent",
    imageTheme: "climate",
    bias: { left: 52, center: 40, right: 8 },
    biasLabel: "Left",
    derivedBiasScore: -0.44,
    sentiment: { label: "Positive", score: 0.48 },
    confidence: 0.92,
    framingNotes:
      "Positive framing of public-private community ownership, equitable regional wealth distribution, and grassroots public investment.",
    loadedTerms: [
      { term: "just energy transition", context: "environmental justice framing", biasWeight: "left" }
    ],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  },
  {
    id: "global-trade-reshoring-dynamics",
    source: "Financial Times",
    sourceUrl: "https://ft.com/world/trade-reshoring-alliances",
    category: "Economy",
    title: "Cross-Border Industrial Alliances Reshape Global Supply Chains Ahead of New Tariff Schedules",
    summary:
      "Multinational manufacturers are constructing dual-track production hubs across Southeast Asia and North America to navigate shifting international trade policies.",
    fullText: [
      "Global corporate procurement directors are aggressively accelerating nearshoring and friend-shoring strategies to insulate supply networks from escalating geopolitical tariffs and export control restrictions.",
      "Bilateral trade data indicates that while direct transpacific shipping volumes have moderated, trade flows through intermediary manufacturing hubs in Mexico and Vietnam have surged by 42% over the trailing twelve months.",
      "Corporate treasurers caution that the resulting supply chain redundancy adds approximately 4-7% in baseline production overhead, though enterprise risk officers consider this an acceptable insurance premium against catastrophic disruption.",
      "The ongoing realignment signals a decisive pivot away from frictionless just-in-time logistics toward localized, high-inventory security paradigms across aerospace, automotive, and semiconductor sectors."
    ],
    keyTakeaways: [
      "Friend-shoring strategies expand intermediary production in Mexico & Vietnam by 42%.",
      "Supply chain redundancy adds 4-7% cost but mitigates catastrophic supply disruptions.",
      "Industry shifts permanently from just-in-time to strategic resilience models."
    ],
    publishedAt: "10 hours ago",
    readTime: "7 min read",
    author: "Arthur Pendelton • Trade & Macro Desk",
    imageTheme: "economy",
    bias: { left: 18, center: 58, right: 24 },
    biasLabel: "Center",
    derivedBiasScore: 0.06,
    sentiment: { label: "Neutral", score: 0.05 },
    confidence: 0.95,
    framingNotes:
      "Analytical, sober macro-economic examination evaluating corporate trade strategies, bilateral metrics, and cost-benefit trade-offs.",
    loadedTerms: [],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  },
  {
    id: "civic-ai-deliberative-polling",
    source: "The Washington Post",
    sourceUrl: "https://washingtonpost.com/politics/civic-ai-polling-consensus",
    category: "Politics",
    title: "Municipalities Pilot Deliberative AI Town Halls to Bridge Partisan Divides on Local Zoning",
    summary:
      "City councils are adopting automated deliberative polling platforms to cluster public feedback, identify common ground, and reduce polarization in civic governance.",
    fullText: [
      "Faced with contentious public hearings over urban density and transit-oriented development, progressive and moderate municipal leaders are turning to AI-assisted deliberative polling platforms to synthesize citizen sentiment.",
      "Unlike traditional social media forums that amplify outrage and polarization, the deliberative platform groups citizen suggestions by consensus overlap, highlighting shared priorities regarding neighborhood green space and pedestrian safety.",
      "Early pilot results across four mid-sized cities demonstrate that when participants are presented with synthesized common-ground summaries, support for compromise zoning resolutions increased by 31%.",
      "Privacy watchdogs and civic rights advocates emphasize that algorithm auditing and strict open-source prompt governance are essential to ensure the moderation models remain impartial and resistant to special-interest lobbying."
    ],
    keyTakeaways: [
      "AI town-hall platforms increased compromise zoning approval by 31% in pilot trials.",
      "Focus on consensus clustering prevents algorithmic outrage amplification.",
      "Auditing and open prompt governance required to prevent municipal capture."
    ],
    publishedAt: "12 hours ago",
    readTime: "9 min read",
    author: "Jessica Lin • Tech & Democracy Fellow",
    imageTheme: "politics",
    bias: { left: 30, center: 60, right: 10 },
    biasLabel: "Center",
    derivedBiasScore: -0.20,
    sentiment: { label: "Positive", score: 0.38 },
    confidence: 0.91,
    framingNotes:
      "Emphasizes democratic deliberation, bipartisan compromise, and civic technology innovation with appropriate scrutiny on algorithmic safeguards.",
    loadedTerms: [
      { term: "deliberative democracy", context: "civic participation framework", biasWeight: "center" }
    ],
    model: "gpt-4o-mini / vibeX-framing-v2",
    disclaimer: "AI-Estimated framing scores evaluate linguistic syntax and perspective distribution."
  }
];

export function getArticleById(id: string): Article | undefined {
  return MOCK_ARTICLES.find((a) => a.id === id);
}

export function getArticlesByCategory(category: Article["category"]): Article[] {
  return MOCK_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}

export function getRelatedArticles(currentId: string, category?: string, limit = 3): Article[] {
  return MOCK_ARTICLES.filter((a) => a.id !== currentId && (!category || a.category === category)).slice(0, limit);
}
