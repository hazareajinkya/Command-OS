import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** Get all cost entries (recent first) */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    return await ctx.db.query("costs").order("desc").take(limit);
  },
});

/** Get cost entries for a specific task */
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("costs")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

/** Get cost entries for a specific agent */
export const getByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("costs")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
  },
});

/** Get aggregated cost stats for a task */
export const taskStats = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("costs")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    const totalTokens = entries.reduce((sum, e) => sum + e.totalTokens, 0);
    const totalCost = entries.reduce((sum, e) => sum + e.costUsd, 0);
    const promptTokens = entries.reduce((sum, e) => sum + e.promptTokens, 0);
    const completionTokens = entries.reduce(
      (sum, e) => sum + e.completionTokens,
      0
    );

    // Group by agent
    const byAgent: Record<
      string,
      { tokens: number; cost: number; agentId: string }
    > = {};
    for (const entry of entries) {
      const key = entry.agentId;
      if (!byAgent[key]) {
        byAgent[key] = { tokens: 0, cost: 0, agentId: key };
      }
      byAgent[key].tokens += entry.totalTokens;
      byAgent[key].cost += entry.costUsd;
    }

    return {
      totalTokens,
      totalCost,
      promptTokens,
      completionTokens,
      entries: entries.length,
      byAgent: Object.values(byAgent),
    };
  },
});

/** Get aggregated cost stats for an agent */
export const agentStats = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("costs")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    const totalTokens = entries.reduce((sum, e) => sum + e.totalTokens, 0);
    const totalCost = entries.reduce((sum, e) => sum + e.costUsd, 0);
    const promptTokens = entries.reduce((sum, e) => sum + e.promptTokens, 0);
    const completionTokens = entries.reduce(
      (sum, e) => sum + e.completionTokens,
      0
    );

    // Group by model
    const byModel: Record<string, { tokens: number; cost: number }> = {};
    for (const entry of entries) {
      if (!byModel[entry.model]) {
        byModel[entry.model] = { tokens: 0, cost: 0 };
      }
      byModel[entry.model].tokens += entry.totalTokens;
      byModel[entry.model].cost += entry.costUsd;
    }

    // Group by action type
    const byAction: Record<string, { tokens: number; cost: number }> = {};
    for (const entry of entries) {
      if (!byAction[entry.action]) {
        byAction[entry.action] = { tokens: 0, cost: 0 };
      }
      byAction[entry.action].tokens += entry.totalTokens;
      byAction[entry.action].cost += entry.costUsd;
    }

    return {
      totalTokens,
      totalCost,
      promptTokens,
      completionTokens,
      entries: entries.length,
      byModel: Object.entries(byModel).map(([model, data]) => ({
        model,
        ...data,
      })),
      byAction: Object.entries(byAction).map(([action, data]) => ({
        action,
        ...data,
      })),
    };
  },
});

/** Global cost stats across all agents */
export const globalStats = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("costs").collect();

    const totalTokens = entries.reduce((sum, e) => sum + e.totalTokens, 0);
    const totalCost = entries.reduce((sum, e) => sum + e.costUsd, 0);

    // Group by agent
    const byAgent: Record<
      string,
      { agentId: string; tokens: number; cost: number }
    > = {};
    for (const entry of entries) {
      const key = entry.agentId;
      if (!byAgent[key]) {
        byAgent[key] = { agentId: key, tokens: 0, cost: 0 };
      }
      byAgent[key].tokens += entry.totalTokens;
      byAgent[key].cost += entry.costUsd;
    }

    // Enrich with agent names (fetch all agents once)
    const allAgents = await ctx.db.query("agents").collect();
    const agentBreakdown = Object.values(byAgent).map((item) => {
      const agent = allAgents.find((a) => a._id === item.agentId);
      return {
        ...item,
        agentName: agent?.name ?? "Unknown",
        agentAvatar: agent?.avatar ?? "🤖",
      };
    });

    // Sort by cost descending
    agentBreakdown.sort((a, b) => b.cost - a.cost);

    // Today's cost
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEntries = entries.filter(
      (e) => e._creationTime >= todayStart.getTime()
    );
    const todayCost = todayEntries.reduce((sum, e) => sum + e.costUsd, 0);
    const todayTokens = todayEntries.reduce(
      (sum, e) => sum + e.totalTokens,
      0
    );

    return {
      totalTokens,
      totalCost,
      todayCost,
      todayTokens,
      entries: entries.length,
      agentBreakdown,
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Log a cost entry (called by agents after each action) */
export const log = mutation({
  args: {
    agentId: v.id("agents"),
    taskId: v.optional(v.id("tasks")),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    costUsd: v.number(),
    action: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("costs", {
      agentId: args.agentId,
      taskId: args.taskId,
      model: args.model,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens: args.totalTokens,
      costUsd: args.costUsd,
      action: args.action,
      note: args.note,
    });
  },
});
