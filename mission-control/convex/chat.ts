import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** Get recent squad chat messages */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const messages = await ctx.db
      .query("chatMessages")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const agent = await ctx.db.get(msg.fromAgentId);
        return {
          ...msg,
          agentName: agent?.name ?? "Unknown",
          agentRole: agent?.role ?? "Unknown",
          agentAvatar: agent?.avatar,
        };
      })
    );

    return enriched.reverse(); // Chronological order
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Send a chat message */
export const send = mutation({
  args: {
    fromAgentId: v.id("agents"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.fromAgentId);
    if (!agent) throw new Error("Agent not found");

    const msgId = await ctx.db.insert("chatMessages", {
      fromAgentId: args.fromAgentId,
      content: args.content,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "chat_message",
      agentId: args.fromAgentId,
      message: `${agent.name} posted in Squad Chat`,
    });

    return msgId;
  },
});
