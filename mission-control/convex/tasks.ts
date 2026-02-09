import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** List all tasks */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

/** Get a single task by ID */
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** List tasks by status (for Kanban columns) */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/** Get tasks assigned to a specific agent */
export const getByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const allTasks = await ctx.db.query("tasks").collect();
    return allTasks.filter((task) =>
      task.assigneeIds.includes(args.agentId)
    );
  },
});

/** Task stats */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return {
      total: tasks.length,
      inbox: tasks.filter((t) => t.status === "inbox").length,
      assigned: tasks.filter((t) => t.status === "assigned").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      review: tasks.filter((t) => t.status === "review").length,
      done: tasks.filter((t) => t.status === "done").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Create a new task */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    createdBy: v.optional(v.id("agents")),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done"),
        v.literal("blocked")
      )
    ),
  },
  handler: async (ctx, args) => {
    const assigneeIds = args.assigneeIds ?? [];
    const status = args.status ?? (assigneeIds.length > 0 ? "assigned" : "inbox");

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status,
      priority: args.priority ?? "medium",
      assigneeIds,
      createdBy: args.createdBy,
      dueDate: args.dueDate,
      tags: args.tags,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: args.createdBy,
      taskId,
      message: `Task created: "${args.title}"`,
    });

    // Notify assigned agents
    for (const agentId of assigneeIds) {
      const agent = await ctx.db.get(agentId);
      if (agent) {
        await ctx.db.insert("notifications", {
          mentionedAgentId: agentId,
          fromAgentId: args.createdBy,
          taskId,
          content: `You've been assigned to task: "${args.title}"`,
          delivered: false,
        });
      }
    }

    return taskId;
  },
});

/** Update task status */
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, { status: args.status });

    await ctx.db.insert("activities", {
      type: "task_updated",
      taskId: args.id,
      message: `Task "${task.title}" moved to ${args.status}`,
    });
  },
});

/** Update task details */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done"),
        v.literal("blocked")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found");

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, cleanUpdates);

    await ctx.db.insert("activities", {
      type: "task_updated",
      taskId: id,
      message: `Task "${task.title}" was updated`,
    });
  },
});

/** Assign agents to a task */
export const assign = mutation({
  args: {
    id: v.id("tasks"),
    assigneeIds: v.array(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      assigneeIds: args.assigneeIds,
      status: args.assigneeIds.length > 0 ? "assigned" : task.status,
    });

    // Notify new assignees
    for (const agentId of args.assigneeIds) {
      if (!task.assigneeIds.includes(agentId)) {
        const agent = await ctx.db.get(agentId);
        if (agent) {
          await ctx.db.insert("notifications", {
            mentionedAgentId: agentId,
            taskId: args.id,
            content: `You've been assigned to task: "${task.title}"`,
            delivered: false,
          });

          await ctx.db.insert("activities", {
            type: "task_assigned",
            agentId,
            taskId: args.id,
            message: `${agent.name} assigned to "${task.title}"`,
          });
        }
      }
    }
  },
});
