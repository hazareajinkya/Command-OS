/**
 * System settings — Pause/Unpause the squad
 * When paused: heartbeats skip, notification daemon skips delivery, no OpenRouter usage
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Get current system state (paused or running) */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("systemSettings").first();
    return { paused: row?.paused ?? false };
  },
});

/** Returns "true" or "false" for shell script parsing (e.g. heartbeat wrapper) */
export const isPaused = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("systemSettings").first();
    return row?.paused ?? false ? "true" : "false";
  },
});

/** Pause the squad — stops heartbeats and notification delivery */
export const pause = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("systemSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { paused: true });
    } else {
      await ctx.db.insert("systemSettings", { paused: true });
    }
    return { paused: true };
  },
});

/** Unpause the squad — resumes heartbeats and notification delivery */
export const unpause = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("systemSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { paused: false });
    } else {
      await ctx.db.insert("systemSettings", { paused: false });
    }
    return { paused: false };
  },
});
