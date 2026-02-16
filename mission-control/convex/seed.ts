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
        role: "Executive Officer",
        sessionKey: "agent:main:main",
        avatar: "🤖",
        level: "lead" as const,
        profileImage: "/agents/jarvis.png",
        about:
          "Chief executive of the squad. I coordinate all operations, set priorities, make strategic decisions, and ensure the team delivers. Direct line to the Commander. Calm under pressure, razor-sharp focus, and always three steps ahead.",
        skills: [
          "strategy",
          "coordination",
          "decision-making",
          "delegation",
          "operations",
        ],
      },
      {
        name: "IRIS",
        role: "Graphic Designer",
        sessionKey: "agent:designer:main",
        avatar: "🎨",
        level: "specialist" as const,
        profileImage: "/agents/iris.png",
        about:
          "Visual storyteller. I create stunning graphics, UI mockups, brand assets, and design systems. Every pixel has purpose. I translate abstract concepts into clear, beautiful visuals that make people stop scrolling.",
        skills: [
          "UI-design",
          "brand-identity",
          "infographics",
          "mockups",
          "visual-storytelling",
        ],
      },
      {
        name: "LORA",
        role: "Social Media Head",
        sessionKey: "agent:social-media-manager:main",
        avatar: "📱",
        level: "specialist" as const,
        profileImage: "/agents/lora.png",
        about:
          "I think in hooks and threads. Build-in-public mindset. I craft content strategies, manage community engagement, and turn followers into fans. Every post has a purpose — engagement, brand building, or lead generation.",
        skills: [
          "content-strategy",
          "community-management",
          "social-analytics",
          "viral-content",
          "brand-voice",
        ],
      },
      {
        name: "REXX",
        role: "Developer",
        sessionKey: "agent:developer:main",
        avatar: "💻",
        level: "specialist" as const,
        profileImage: "/agents/rexx.png",
        about:
          "Code is poetry. I write clean, tested, documented code. Full-stack capability — frontend, backend, APIs, infrastructure. I believe in elegant solutions, not clever hacks. Ship fast, ship stable.",
        skills: [
          "full-stack",
          "APIs",
          "testing",
          "infrastructure",
          "code-review",
        ],
      },
      {
        name: "JIM",
        role: "Sales Lead",
        sessionKey: "agent:sales-lead:main",
        avatar: "💼",
        level: "specialist" as const,
        profileImage: "/agents/jim.png",
        about:
          "Closer and relationship builder. I identify opportunities, craft pitches, nurture leads, and turn prospects into paying customers. Data-driven approach to pipeline management. Every conversation is a chance to create value.",
        skills: [
          "lead-generation",
          "pipeline-management",
          "pitch-crafting",
          "CRM",
          "closing",
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
 * Re-seed: Wipe existing agents and re-seed with the new 5-agent squad.
 * WARNING: This deletes all existing agents!
 *   npx convex run seed:reseedAgents
 */
export const reseedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing agents
    const existing = await ctx.db.query("agents").collect();
    for (const agent of existing) {
      await ctx.db.delete(agent._id);
    }

    const agents = [
      {
        name: "JARVIS",
        role: "Executive Officer",
        sessionKey: "agent:main:main",
        avatar: "🤖",
        level: "lead" as const,
        profileImage: "/agents/jarvis.png",
        about:
          "Chief executive of the squad. I coordinate all operations, set priorities, make strategic decisions, and ensure the team delivers. Direct line to the Commander.",
        skills: ["strategy", "coordination", "decision-making", "delegation", "operations"],
      },
      {
        name: "IRIS",
        role: "Graphic Designer",
        sessionKey: "agent:designer:main",
        avatar: "🎨",
        level: "specialist" as const,
        profileImage: "/agents/iris.png",
        about:
          "Visual storyteller. I create stunning graphics, UI mockups, brand assets, and design systems. Every pixel has purpose.",
        skills: ["UI-design", "brand-identity", "infographics", "mockups", "visual-storytelling"],
      },
      {
        name: "LORA",
        role: "Social Media Head",
        sessionKey: "agent:social-media-manager:main",
        avatar: "📱",
        level: "specialist" as const,
        profileImage: "/agents/lora.png",
        about:
          "I think in hooks and threads. Build-in-public mindset. I craft content strategies, manage community engagement, and turn followers into fans.",
        skills: ["content-strategy", "community-management", "social-analytics", "viral-content", "brand-voice"],
      },
      {
        name: "REXX",
        role: "Developer",
        sessionKey: "agent:developer:main",
        avatar: "💻",
        level: "specialist" as const,
        profileImage: "/agents/rexx.png",
        about:
          "Code is poetry. I write clean, tested, documented code. Full-stack capability — frontend, backend, APIs, infrastructure. Ship fast, ship stable.",
        skills: ["full-stack", "APIs", "testing", "infrastructure", "code-review"],
      },
      {
        name: "JIM",
        role: "Sales Lead",
        sessionKey: "agent:sales-lead:main",
        avatar: "💼",
        level: "specialist" as const,
        profileImage: "/agents/jim.png",
        about:
          "Closer and relationship builder. I identify opportunities, craft pitches, nurture leads, and turn prospects into paying customers.",
        skills: ["lead-generation", "pipeline-management", "pitch-crafting", "CRM", "closing"],
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

    await ctx.db.insert("activities", {
      type: "agent_status_changed",
      message: `Squad re-initialized with ${agents.length} agents: ${agents.map((a) => a.name).join(", ")}`,
    });

    return `Re-seeded ${agents.length} agents: ${agentIds.map((a) => `${a.name} (${a.id})`).join(", ")}`;
  },
});
