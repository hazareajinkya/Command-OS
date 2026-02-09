import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Agent Profiles ───────────────────────────────────────
  agents: defineTable({
    name: v.string(), // "JARVIS", "FRIDAY", etc.
    role: v.string(), // "Squad Lead", "Developer", etc.
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("working"),
      v.literal("blocked")
    ),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(), // "agent:main:main"
    avatar: v.optional(v.string()), // emoji or URL
    level: v.union(
      v.literal("intern"),
      v.literal("specialist"),
      v.literal("lead")
    ),
    about: v.optional(v.string()), // Agent description/bio
    skills: v.optional(v.array(v.string())), // Skill tags
  }).index("by_session_key", ["sessionKey"]),

  // ─── Task Board ───────────────────────────────────────────
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assigneeIds: v.array(v.id("agents")),
    createdBy: v.optional(v.id("agents")),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())), // Task labels/tags
  }).index("by_status", ["status"])
    .index("by_assignee", ["assigneeIds"]),

  // ─── Messages (Comments on Tasks) ────────────────────────
  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.optional(v.array(v.id("documents"))),
  }).index("by_task", ["taskId"]),

  // ─── Squad Chat (General agent-to-agent chat) ─────────────
  chatMessages: defineTable({
    fromAgentId: v.id("agents"),
    content: v.string(),
  }),

  // ─── Broadcasts (Squad Announcements) ──────────────────────
  broadcasts: defineTable({
    title: v.optional(v.string()),
    message: v.string(),
    priority: v.union(v.literal("normal"), v.literal("urgent")),
    fromAgentId: v.optional(v.id("agents")), // null = from "You"/commander
  }),

  // ─── Activity Feed ────────────────────────────────────────
  activities: defineTable({
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
  }),

  // ─── Documents (Deliverables, Research, etc.) ─────────────
  documents: defineTable({
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
  }).index("by_task", ["taskId"])
    .index("by_type", ["type"]),

  // ─── Notifications (@mentions) ────────────────────────────
  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    fromAgentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    content: v.string(),
    delivered: v.boolean(),
  }).index("by_agent", ["mentionedAgentId"])
    .index("by_delivered", ["delivered"]),
});
