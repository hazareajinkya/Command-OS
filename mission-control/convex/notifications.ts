import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** Get undelivered notifications (used by the notification daemon on EC2) */
export const getUndelivered = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_delivered", (q) => q.eq("delivered", false))
      .collect();
  },
});

/** Get notifications for a specific agent */
export const getForAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .order("desc")
      .collect();
  },
});

/** Get undelivered notifications for a specific agent */
export const getUndeliveredForAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .collect();

    return all.filter((n) => !n.delivered);
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Create a notification */
export const create = mutation({
  args: {
    mentionedAgentId: v.id("agents"),
    fromAgentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      mentionedAgentId: args.mentionedAgentId,
      fromAgentId: args.fromAgentId,
      taskId: args.taskId,
      content: args.content,
      delivered: false,
    });
  },
});

/** Mark a notification as delivered */
export const markDelivered = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { delivered: true });
  },
});

/** Mark all notifications for an agent as delivered */
export const markAllDelivered = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const undelivered = await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .collect();

    for (const notif of undelivered) {
      if (!notif.delivered) {
        await ctx.db.patch(notif._id, { delivered: true });
      }
    }
  },
});
