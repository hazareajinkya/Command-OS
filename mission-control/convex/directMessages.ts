import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** Get direct messages between commander and a specific agent */
export const listByAgent = query({
  args: {
    agentId: v.id("agents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const messages = await ctx.db
      .query("directMessages")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("asc")
      .take(limit);

    return messages;
  },
});

/** Get recent direct messages across all agents (for activity overview) */
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("directMessages")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const agent = await ctx.db.get(msg.agentId);
        return {
          ...msg,
          agentName: agent?.name ?? "Unknown",
          agentAvatar: agent?.avatar ?? "🤖",
          agentRole: agent?.role ?? "Unknown",
        };
      })
    );

    return enriched.reverse();
  },
});

/** Count unread messages from agents (messages from agent, not commander) */
export const unreadCount = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("directMessages")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
    // Count agent-sent messages (not from commander) as "unread" indicator
    return messages.filter((m) => !m.isFromCommander).length;
  },
});

/** Get undelivered commander→agent messages (used by notification daemon on EC2) */
export const getUndelivered = query({
  args: {},
  handler: async (ctx) => {
    // Get messages explicitly marked delivered: false
    const explicitFalse = await ctx.db
      .query("directMessages")
      .withIndex("by_delivered", (q) => q.eq("delivered", false))
      .collect();

    // Also get messages with no delivered field (legacy/undefined)
    // These won't show up in the index, so scan all and filter
    const allMessages = await ctx.db
      .query("directMessages")
      .collect();
    const missingField = allMessages.filter(
      (m) => m.isFromCommander && m.delivered === undefined
    );

    // Combine and deduplicate
    const combined = [...explicitFalse, ...missingField];
    const seen = new Set<string>();
    const toDeliver = combined.filter((m) => {
      if (!m.isFromCommander) return false;
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    });

    // Enrich with agent info for the daemon
    const enriched = await Promise.all(
      toDeliver.map(async (msg) => {
        const agent = await ctx.db.get(msg.agentId);
        return {
          ...msg,
          agentName: agent?.name ?? "Unknown",
          sessionKey: agent?.sessionKey ?? "",
        };
      })
    );

    return enriched;
  },
});

/** Get undelivered DMs for a specific agent (used by heartbeat) */
export const getUndeliveredForAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("directMessages")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    // Catch messages where delivered is false OR undefined (legacy messages without the field)
    return messages.filter((m) => m.isFromCommander && m.delivered !== true);
  },
});

/** Reset delivered status on messages (used to re-queue failed deliveries) */
export const resetDelivered = mutation({
  args: { id: v.id("directMessages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { delivered: false });
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Send a message from the commander to an agent */
export const sendFromCommander = mutation({
  args: {
    agentId: v.id("agents"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    const msgId = await ctx.db.insert("directMessages", {
      agentId: args.agentId,
      isFromCommander: true,
      content: args.content,
      messageType: "text",
      delivered: false, // daemon will deliver to OpenClaw agent
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "chat_message",
      agentId: args.agentId,
      message: `Commander sent a direct message to ${agent.name}`,
    });

    return msgId;
  },
});

/** Send a message from an agent to the commander */
export const sendFromAgent = mutation({
  args: {
    agentId: v.id("agents"),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("task_suggestion"),
        v.literal("status_update"),
        v.literal("system")
      )
    ),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    const msgId = await ctx.db.insert("directMessages", {
      agentId: args.agentId,
      isFromCommander: false,
      content: args.content,
      messageType: args.messageType ?? "text",
    });

    return msgId;
  },
});

/** Mark a direct message as delivered (used by notification daemon) */
export const markDelivered = mutation({
  args: { id: v.id("directMessages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { delivered: true });
  },
});

/** Send a system message (used during agent creation/onboarding) */
export const sendSystem = mutation({
  args: {
    agentId: v.id("agents"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("directMessages", {
      agentId: args.agentId,
      isFromCommander: false,
      content: args.content,
      messageType: "system",
    });
  },
});
