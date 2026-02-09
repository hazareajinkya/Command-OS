import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** List all documents */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").order("desc").collect();

    const enriched = await Promise.all(
      docs.map(async (doc) => {
        const agent = doc.createdBy
          ? await ctx.db.get(doc.createdBy)
          : null;
        const task = doc.taskId ? await ctx.db.get(doc.taskId) : null;
        return {
          ...doc,
          agentName: agent?.name,
          taskTitle: task?.title,
        };
      })
    );

    return enriched;
  },
});

/** Get a single document */
export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** Get documents for a specific task */
export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

/** Get documents by type */
export const listByType = query({
  args: {
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("notes"),
      v.literal("draft")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Create a new document */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("notes"),
      v.literal("draft")
    ),
    taskId: v.optional(v.id("tasks")),
    createdBy: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      type: args.type,
      taskId: args.taskId,
      createdBy: args.createdBy,
    });

    // Log activity
    const agent = args.createdBy
      ? await ctx.db.get(args.createdBy)
      : null;

    await ctx.db.insert("activities", {
      type: "document_created",
      agentId: args.createdBy,
      taskId: args.taskId,
      message: `${agent?.name ?? "System"} created document: "${args.title}"`,
    });

    return docId;
  },
});

/** Update a document */
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, cleanUpdates);
  },
});
