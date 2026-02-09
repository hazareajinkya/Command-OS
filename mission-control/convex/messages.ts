import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Queries ────────────────────────────────────────────────

/** Get all messages for a task (comment thread) */
export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    // Enrich with agent info
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

    return enriched;
  },
});

/** Get recent messages across all tasks */
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("messages")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const agent = await ctx.db.get(msg.fromAgentId);
        const task = await ctx.db.get(msg.taskId);
        return {
          ...msg,
          agentName: agent?.name ?? "Unknown",
          agentRole: agent?.role ?? "Unknown",
          taskTitle: task?.title ?? "Unknown Task",
        };
      })
    );

    return enriched;
  },
});

// ─── Mutations ──────────────────────────────────────────────

/** Post a comment on a task */
export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.optional(v.array(v.id("documents"))),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.fromAgentId);
    const task = await ctx.db.get(args.taskId);
    if (!agent) throw new Error("Agent not found");
    if (!task) throw new Error("Task not found");

    const messageId = await ctx.db.insert("messages", {
      taskId: args.taskId,
      fromAgentId: args.fromAgentId,
      content: args.content,
      attachments: args.attachments,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "message_sent",
      agentId: args.fromAgentId,
      taskId: args.taskId,
      message: `${agent.name} commented on "${task.title}"`,
    });

    // Parse @mentions from content and create notifications
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(args.content)) !== null) {
      const mentionedName = match[1];

      if (mentionedName.toLowerCase() === "all") {
        // @all — notify everyone except the sender
        const allAgents = await ctx.db.query("agents").collect();
        for (const a of allAgents) {
          if (a._id !== args.fromAgentId) {
            await ctx.db.insert("notifications", {
              mentionedAgentId: a._id,
              fromAgentId: args.fromAgentId,
              taskId: args.taskId,
              content: `${agent.name} mentioned @all on "${task.title}": ${args.content}`,
              delivered: false,
            });
          }
        }
      } else {
        // Find agent by name (case-insensitive)
        const allAgents = await ctx.db.query("agents").collect();
        const mentioned = allAgents.find(
          (a) => a.name.toLowerCase() === mentionedName.toLowerCase()
        );
        if (mentioned && mentioned._id !== args.fromAgentId) {
          await ctx.db.insert("notifications", {
            mentionedAgentId: mentioned._id,
            fromAgentId: args.fromAgentId,
            taskId: args.taskId,
            content: `${agent.name} mentioned you on "${task.title}": ${args.content}`,
            delivered: false,
          });
        }
      }
    }

    // Also notify all task assignees (thread subscription behavior)
    for (const assigneeId of task.assigneeIds) {
      if (assigneeId !== args.fromAgentId) {
        // Check if we already notified them via @mention
        const existingNotifs = await ctx.db
          .query("notifications")
          .withIndex("by_agent", (q) => q.eq("mentionedAgentId", assigneeId))
          .collect();

        const alreadyNotified = existingNotifs.some(
          (n) =>
            n.taskId === args.taskId &&
            n.content.includes(args.content) &&
            !n.delivered
        );

        if (!alreadyNotified) {
          await ctx.db.insert("notifications", {
            mentionedAgentId: assigneeId,
            fromAgentId: args.fromAgentId,
            taskId: args.taskId,
            content: `${agent.name} commented on "${task.title}": ${args.content}`,
            delivered: false,
          });
        }
      }
    }

    return messageId;
  },
});
