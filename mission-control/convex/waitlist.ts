import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Add an email to the waitlist. Skips if already subscribed.
 */
export const join = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", trimmed))
      .first();

    if (existing) {
      return { ok: true, message: "Thank you for joining the waitlist!" };
    }

    await ctx.db.insert("waitlist", {
      email: trimmed,
      createdAt: Date.now(),
    });

    return { ok: true, message: "Thank you for joining the waitlist!" };
  },
});
