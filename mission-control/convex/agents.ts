import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** List all agents */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

/** Get a single agent by ID */
export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** Get agent by session key (used by OpenClaw to identify itself) */
export const getBySessionKey = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_session_key", (q) => q.eq("sessionKey", args.sessionKey))
      .first();
  },
});

/** Get stats: active count, total count */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const active = agents.filter(
      (a) => a.status === "active" || a.status === "working"
    ).length;
    return {
      total: agents.length,
      active,
      idle: agents.filter((a) => a.status === "idle").length,
      blocked: agents.filter((a) => a.status === "blocked").length,
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Create a new agent */
export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    sessionKey: v.string(),
    avatar: v.optional(v.string()),
    level: v.union(
      v.literal("intern"),
      v.literal("specialist"),
      v.literal("lead")
    ),
    about: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      status: "idle",
      sessionKey: args.sessionKey,
      avatar: args.avatar,
      level: args.level,
      about: args.about,
      skills: args.skills,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "agent_status_changed",
      agentId,
      message: `${args.name} (${args.role}) joined Mission Control`,
    });

    return agentId;
  },
});

/** Update agent status */
export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("working"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.id, { status: args.status });

    await ctx.db.insert("activities", {
      type: "agent_status_changed",
      agentId: args.id,
      message: `${agent.name} is now ${args.status}`,
    });
  },
});

/** Assign an agent to a task */
export const assignToTask = mutation({
  args: {
    id: v.id("agents"),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { currentTaskId: args.taskId });
  },
});

/** Clear agent's current task */
export const clearTask = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { currentTaskId: undefined });
  },
});
