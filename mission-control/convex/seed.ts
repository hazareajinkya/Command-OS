import { mutation } from "./_generated/server";

/**
 * Seed the database with initial agent data.
 * Run this once after setting up Convex:
 *   npx convex run seed:seedAgents
 */
export const seedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if agents already exist
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) {
      return `Already seeded! Found ${existing.length} agents.`;
    }

    const agents = [
      {
        name: "JARVIS",
        role: "Squad Lead",
        sessionKey: "agent:main:main",
        avatar: "🤖",
        level: "lead" as const,
        about:
          "Chief orchestrator of the Stark Squad. I coordinate work across all agents, maintain quality standards, and make sure nothing falls through the cracks. Direct line to the Commander. Calm under pressure, detail-oriented with a touch of humor. I speak with precision and always know what's happening across the squad.",
        skills: [
          "coordination",
          "quality-control",
          "communication",
          "automation",
          "delegation",
        ],
      },
      {
        name: "FRIDAY",
        role: "Developer",
        sessionKey: "agent:developer:main",
        avatar: "💻",
        level: "specialist" as const,
        about:
          "Code is poetry. I write clean, tested, documented code. Full-stack capability — frontend, backend, APIs, infrastructure. I believe in elegant solutions, not clever hacks. Every PR should be reviewable by a junior developer.",
        skills: [
          "full-stack",
          "APIs",
          "testing",
          "infrastructure",
          "code-review",
        ],
      },
      {
        name: "EDITH",
        role: "Product Analyst",
        sessionKey: "agent:product-analyst:main",
        avatar: "🔬",
        level: "specialist" as const,
        about:
          "Skeptical tester. Thorough bug hunter. I find edge cases others miss. I think like a first-time user and question everything. I don't just say 'nice work' — I test it, break it, and tell you exactly what needs fixing.",
        skills: [
          "UX-testing",
          "competitive-analysis",
          "bug-hunting",
          "user-research",
          "edge-cases",
        ],
      },
      {
        name: "HULKBUSTER",
        role: "Customer Researcher",
        sessionKey: "agent:customer-researcher:main",
        avatar: "🕵️",
        level: "specialist" as const,
        about:
          "Deep researcher. I read G2 reviews for fun. Every claim comes with receipts — sources, confidence levels, methodology. I dig into customer conversations, support tickets, and market data to find insights that drive strategy.",
        skills: [
          "market-research",
          "customer-insights",
          "G2-reviews",
          "data-analysis",
          "competitor-intel",
        ],
      },
      {
        name: "VISION",
        role: "Content Writer",
        sessionKey: "agent:content-writer:main",
        avatar: "✍️",
        level: "specialist" as const,
        about:
          "Words are my craft. Pro-Oxford comma. Anti-passive voice. Every sentence earns its place or gets cut. I write blog posts, landing pages, comparison content, and case studies that convert. SEO-aware but never at the cost of readability.",
        skills: [
          "blog-posts",
          "landing-pages",
          "SEO-writing",
          "case-studies",
          "copywriting",
        ],
      },
      {
        name: "BANNER",
        role: "SEO Analyst",
        sessionKey: "agent:seo-analyst:main",
        avatar: "👁️",
        level: "specialist" as const,
        about:
          "I think in keywords and search intent. I make sure content can rank. Monthly search volumes, keyword difficulty, SERP features — I track it all. My recommendations are data-driven and always tied to business impact.",
        skills: [
          "keyword-research",
          "SERP-analysis",
          "technical-SEO",
          "search-intent",
          "ranking-strategy",
        ],
      },
      {
        name: "RHODEY",
        role: "Social Media Manager",
        sessionKey: "agent:social-media-manager:main",
        avatar: "📱",
        level: "specialist" as const,
        about:
          "I think in hooks and threads. Build-in-public mindset. I create authentic content from real customer insights and team wins. Every post has a purpose — engagement, brand building, or lead generation.",
        skills: [
          "twitter-threads",
          "social-strategy",
          "content-hooks",
          "engagement",
          "build-in-public",
        ],
      },
      {
        name: "PEPPER",
        role: "Email Marketing Specialist",
        sessionKey: "agent:email-marketing:main",
        avatar: "📧",
        level: "specialist" as const,
        about:
          "Drip sequences and lifecycle emails are my domain. Every email earns its place or gets cut. I design onboarding flows, trial nudges, and retention sequences that actually get opened and clicked.",
        skills: [
          "email-sequences",
          "onboarding",
          "lifecycle-marketing",
          "A/B-testing",
          "conversion",
        ],
      },
      {
        name: "MARK1",
        role: "Designer",
        sessionKey: "agent:designer:main",
        avatar: "🎨",
        level: "specialist" as const,
        about:
          "Visual thinker. I create infographics, comparison graphics, UI mockups, and design specs. I translate abstract concepts into clear, beautiful visuals. Every pixel has purpose.",
        skills: [
          "infographics",
          "UI-mockups",
          "design-specs",
          "visual-identity",
          "data-visualization",
        ],
      },
      {
        name: "KAREN",
        role: "Documentation Specialist",
        sessionKey: "agent:notion-agent:main",
        avatar: "📚",
        level: "specialist" as const,
        about:
          "I keep docs organized. Nothing gets lost on my watch. I maintain knowledge bases, process documentation, and make sure every deliverable is filed, tagged, and findable. Structure is my superpower.",
        skills: [
          "documentation",
          "knowledge-base",
          "organization",
          "process-docs",
          "file-management",
        ],
      },
    ];

    const agentIds = [];
    for (const agent of agents) {
      const id = await ctx.db.insert("agents", {
        ...agent,
        status: "idle",
      });
      agentIds.push({ name: agent.name, id });
    }

    // Log the seeding activity
    await ctx.db.insert("activities", {
      type: "agent_status_changed",
      message: `Mission Control initialized with ${agents.length} agents: ${agents.map((a) => a.name).join(", ")}`,
    });

    return `Seeded ${agents.length} agents: ${agentIds.map((a) => `${a.name} (${a.id})`).join(", ")}`;
  },
});

/**
 * Update existing agents with about and skills fields.
 * Run after initial seed if agents already exist:
 *   npx convex run seed:updateAgentProfiles
 */
export const updateAgentProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    const profiles: Record<string, { about: string; skills: string[] }> = {
      JARVIS: {
        about:
          "Chief orchestrator of the Stark Squad. I coordinate work across all agents, maintain quality standards, and make sure nothing falls through the cracks. Direct line to the Commander. Calm under pressure, detail-oriented with a touch of humor.",
        skills: [
          "coordination",
          "quality-control",
          "communication",
          "automation",
          "delegation",
        ],
      },
      FRIDAY: {
        about:
          "Code is poetry. I write clean, tested, documented code. Full-stack capability — frontend, backend, APIs, infrastructure. Every PR should be reviewable by a junior developer.",
        skills: [
          "full-stack",
          "APIs",
          "testing",
          "infrastructure",
          "code-review",
        ],
      },
      EDITH: {
        about:
          "Skeptical tester. Thorough bug hunter. I find edge cases others miss. I think like a first-time user and question everything.",
        skills: [
          "UX-testing",
          "competitive-analysis",
          "bug-hunting",
          "user-research",
          "edge-cases",
        ],
      },
      HULKBUSTER: {
        about:
          "Deep researcher. I read G2 reviews for fun. Every claim comes with receipts — sources, confidence levels, methodology.",
        skills: [
          "market-research",
          "customer-insights",
          "G2-reviews",
          "data-analysis",
          "competitor-intel",
        ],
      },
      VISION: {
        about:
          "Words are my craft. Pro-Oxford comma. Anti-passive voice. Every sentence earns its place or gets cut.",
        skills: [
          "blog-posts",
          "landing-pages",
          "SEO-writing",
          "case-studies",
          "copywriting",
        ],
      },
      BANNER: {
        about:
          "I think in keywords and search intent. I make sure content can rank. My recommendations are data-driven and always tied to business impact.",
        skills: [
          "keyword-research",
          "SERP-analysis",
          "technical-SEO",
          "search-intent",
          "ranking-strategy",
        ],
      },
      RHODEY: {
        about:
          "I think in hooks and threads. Build-in-public mindset. Every post has a purpose — engagement, brand building, or lead generation.",
        skills: [
          "twitter-threads",
          "social-strategy",
          "content-hooks",
          "engagement",
          "build-in-public",
        ],
      },
      PEPPER: {
        about:
          "Drip sequences and lifecycle emails are my domain. Every email earns its place or gets cut.",
        skills: [
          "email-sequences",
          "onboarding",
          "lifecycle-marketing",
          "A/B-testing",
          "conversion",
        ],
      },
      MARK1: {
        about:
          "Visual thinker. I create infographics, comparison graphics, UI mockups, and design specs. Every pixel has purpose.",
        skills: [
          "infographics",
          "UI-mockups",
          "design-specs",
          "visual-identity",
          "data-visualization",
        ],
      },
      KAREN: {
        about:
          "I keep docs organized. Nothing gets lost on my watch. Structure is my superpower.",
        skills: [
          "documentation",
          "knowledge-base",
          "organization",
          "process-docs",
          "file-management",
        ],
      },
    };

    const agents = await ctx.db.query("agents").collect();
    let updated = 0;

    for (const agent of agents) {
      const profile = profiles[agent.name];
      if (profile) {
        await ctx.db.patch(agent._id, {
          about: profile.about,
          skills: profile.skills,
        });
        updated++;
      }
    }

    return `Updated ${updated} agent profiles with about and skills.`;
  },
});
