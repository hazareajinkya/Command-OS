import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** Get all broadcasts */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const broadcasts = await ctx.db
      .query("broadcasts")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      broadcasts.map(async (b) => {
        const agent = b.fromAgentId
          ? await ctx.db.get(b.fromAgentId)
          : null;
        return {
          ...b,
          agentName: agent?.name ?? "Commander",
          agentAvatar: agent?.avatar ?? "👤",
        };
      })
    );

    return enriched;
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Send a broadcast to the entire squad */
export const send = mutation({
  args: {
    title: v.optional(v.string()),
    message: v.string(),
    priority: v.union(v.literal("normal"), v.literal("urgent")),
    fromAgentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const broadcastId = await ctx.db.insert("broadcasts", {
      title: args.title,
      message: args.message,
      priority: args.priority,
      fromAgentId: args.fromAgentId,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "broadcast",
      agentId: args.fromAgentId,
      message: `Squad Announcement: ${args.title ?? args.message.slice(0, 60)}`,
    });

    // Notify all agents
    const allAgents = await ctx.db.query("agents").collect();
    for (const agent of allAgents) {
      if (agent._id !== args.fromAgentId) {
        await ctx.db.insert("notifications", {
          mentionedAgentId: agent._id,
          fromAgentId: args.fromAgentId,
          content: `📢 Squad Announcement${args.priority === "urgent" ? " [URGENT]" : ""}: ${args.title ?? ""} — ${args.message}`,
          delivered: false,
        });
      }
    }

    return broadcastId;
  },
});
