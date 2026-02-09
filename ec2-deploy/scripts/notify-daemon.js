#!/usr/bin/env node

/**
 * Notification Daemon for Mission Control
 * ----------------------------------------
 * Runs 24/7 via pm2 on EC2.
 * Polls Convex every 2 seconds for undelivered notifications.
 * Delivers them to the correct Clawdbot agent session.
 *
 * Usage:
 *   pm2 start notify-daemon.js --name "notification-daemon"
 *   pm2 save
 *
 * Environment:
 *   CONVEX_URL - Your Convex deployment URL (from .env.local)
 */

const { execSync } = require("child_process");
const { ConvexHttpClient } = require("convex/browser");

// ─── Config ──────────────────────────────────────────────────
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("ERROR: CONVEX_URL environment variable is required.");
  console.error("Set it to your Convex deployment URL from .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Map agent session keys to Convex agent IDs
// These get populated on first run by querying the agents table
let AGENT_MAP = {}; // { agentId: sessionKey }

const POLL_INTERVAL = 2000; // 2 seconds

// ─── Functions ───────────────────────────────────────────────

async function loadAgentMap() {
  console.log("📋 Loading agent roster from Convex...");
  try {
    const agents = await client.query("agents:list");
    for (const agent of agents) {
      AGENT_MAP[agent._id] = agent.sessionKey;
      console.log(`  ✅ ${agent.name} → ${agent.sessionKey}`);
    }
    console.log(`\n🦾 Loaded ${agents.length} agents.\n`);
  } catch (err) {
    console.error("Failed to load agents:", err.message);
    process.exit(1);
  }
}

async function deliverNotifications() {
  try {
    const undelivered = await client.query("notifications:getUndelivered");

    if (undelivered.length === 0) return;

    console.log(
      `📬 Found ${undelivered.length} undelivered notification(s)...`
    );

    for (const notif of undelivered) {
      const sessionKey = AGENT_MAP[notif.mentionedAgentId];

      if (!sessionKey) {
        console.warn(
          `  ⚠️  Unknown agent ID: ${notif.mentionedAgentId}, skipping.`
        );
        continue;
      }

      try {
        // Send message to the agent's Clawdbot session
        const cmd = `openclaw sessions send --session "${sessionKey}" --message ${JSON.stringify(notif.content)}`;
        execSync(cmd, { timeout: 10000 });

        // Mark as delivered in Convex
        await client.mutation("notifications:markDelivered", {
          id: notif._id,
        });

        console.log(`  ✅ Delivered to ${sessionKey}: ${notif.content.substring(0, 60)}...`);
      } catch (err) {
        // Agent might be asleep (no active session) — notification stays queued
        console.log(`  💤 ${sessionKey} is asleep, notification queued.`);
      }
    }
  } catch (err) {
    console.error("Poll error:", err.message);
  }
}

// ─── Main Loop ───────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  🚀 MISSION CONTROL — Notification Daemon");
  console.log("  Polling every 2 seconds for @mentions...");
  console.log("═══════════════════════════════════════════════\n");

  await loadAgentMap();

  // Poll loop
  while (true) {
    await deliverNotifications();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
