#!/usr/bin/env node

/**
 * Notification Daemon for Mission Control
 * ----------------------------------------
 * Runs 24/7 via pm2 on EC2.
 * Polls Convex every 2 seconds for:
 *   1. Undelivered @mention notifications
 *   2. Undelivered Commander → Agent direct messages
 * Delivers them to the correct OpenClaw agent session.
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
const AGENT_REFRESH_INTERVAL = 60000; // Refresh agent map every 60s (for newly created agents)

// ─── Functions ───────────────────────────────────────────────

async function loadAgentMap() {
  console.log("📋 Loading agent roster from Convex...");
  try {
    const agents = await client.query("agents:list");
    const prevCount = Object.keys(AGENT_MAP).length;
    AGENT_MAP = {};
    for (const agent of agents) {
      AGENT_MAP[agent._id] = agent.sessionKey;
    }
    if (prevCount > 0 && agents.length > prevCount) {
      console.log(`  🆕 New agent(s) detected! Roster: ${prevCount} → ${agents.length}`);
    }
    for (const agent of agents) {
      console.log(`  ✅ ${agent.name} → ${agent.sessionKey}`);
    }
    console.log(`\n🦾 Loaded ${agents.length} agents.\n`);
  } catch (err) {
    console.error("Failed to load agents:", err.message);
  }
}

// ─── Deliver @mention notifications ──────────────────────────

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
        // Send message to the agent's OpenClaw session
        const cmd = `openclaw sessions send --session "${sessionKey}" --message ${JSON.stringify(notif.content)}`;
        execSync(cmd, { timeout: 10000 });

        // Mark as delivered in Convex
        await client.mutation("notifications:markDelivered", {
          id: notif._id,
        });

        console.log(`  ✅ [NOTIF] Delivered to ${sessionKey}: ${notif.content.substring(0, 60)}...`);
      } catch (err) {
        // Agent might be asleep (no active session) — notification stays queued
        console.log(`  💤 ${sessionKey} is asleep, notification queued.`);
      }
    }
  } catch (err) {
    console.error("Poll error (notifications):", err.message);
  }
}

// ─── Deliver Commander → Agent direct messages ───────────────

async function deliverDirectMessages() {
  try {
    const undelivered = await client.query("directMessages:getUndelivered");

    if (undelivered.length === 0) return;

    console.log(
      `💬 Found ${undelivered.length} undelivered direct message(s)...`
    );

    for (const dm of undelivered) {
      const sessionKey = dm.sessionKey || AGENT_MAP[dm.agentId];

      if (!sessionKey) {
        console.warn(
          `  ⚠️  No session key for agent ID: ${dm.agentId} (${dm.agentName}), skipping.`
        );
        continue;
      }

      try {
        // Format message with Commander prefix so agent knows it's from the human
        const formattedMessage = `[COMMANDER DM] ${dm.content}

---
Reply to the Commander by running:
cd /home/ubuntu/clawd && npx convex run directMessages:sendFromAgent '{"agentId": "YOUR_AGENT_ID", "content": "Your reply here", "messageType": "text"}'

If you want to suggest a task, use messageType "task_suggestion" instead.`;

        // Send to the agent's OpenClaw session
        const cmd = `openclaw sessions send --session "${sessionKey}" --message ${JSON.stringify(formattedMessage)}`;
        execSync(cmd, { timeout: 10000 });

        // Mark as delivered in Convex
        await client.mutation("directMessages:markDelivered", {
          id: dm._id,
        });

        console.log(`  ✅ [DM] Commander → ${dm.agentName} (${sessionKey}): ${dm.content.substring(0, 60)}...`);
      } catch (err) {
        // Agent might be asleep — message stays queued for next heartbeat
        console.log(`  💤 ${dm.agentName} (${sessionKey}) is asleep, DM queued.`);
      }
    }
  } catch (err) {
    console.error("Poll error (direct messages):", err.message);
  }
}

// ─── Main Loop ───────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  🚀 MISSION CONTROL — Notification Daemon v2");
  console.log("  Polling every 2s for @mentions + DMs...");
  console.log("═══════════════════════════════════════════════\n");

  await loadAgentMap();

  let pollCount = 0;
  const refreshEvery = Math.floor(AGENT_REFRESH_INTERVAL / POLL_INTERVAL);

  // Poll loop
  while (true) {
    // Deliver both notification types
    await deliverNotifications();
    await deliverDirectMessages();

    // Periodically refresh agent map (picks up newly created agents)
    pollCount++;
    if (pollCount % refreshEvery === 0) {
      await loadAgentMap();
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
