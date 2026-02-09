import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** Get recent activity feed */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(limit);

    // Enrich with agent info
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const agent = activity.agentId
          ? await ctx.db.get(activity.agentId)
          : null;
        const task = activity.taskId
          ? await ctx.db.get(activity.taskId)
          : null;
        return {
          ...activity,
          agentName: agent?.name,
          agentAvatar: agent?.avatar,
          taskTitle: task?.title,
        };
      })
    );

    return enriched;
  },
});

/** Get activity for a specific task */
export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .collect();

    return activities.filter((a) => a.taskId === args.taskId);
  },
});

/** Get activity for a specific agent */
export const listByAgent = query({
  args: { agentId: v.id("agents"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .collect();

    return activities
      .filter((a) => a.agentId === args.agentId)
      .slice(0, limit);
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Log a new activity */
export const create = mutation({
  args: {
    type: v.union(
      v.literal("task_created"),
      v.literal("task_updated"),
      v.literal("task_assigned"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("agent_status_changed"),
      v.literal("heartbeat"),
      v.literal("broadcast"),
      v.literal("chat_message")
    ),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      type: args.type,
      agentId: args.agentId,
      taskId: args.taskId,
      message: args.message,
    });
  },
});
