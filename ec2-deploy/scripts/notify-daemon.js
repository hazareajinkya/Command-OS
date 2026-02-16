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

const { execSync, spawn } = require("child_process");
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
// Unlike @mentions (which can wait for heartbeat), Commander DMs trigger
// an immediate agent wakeup so the agent replies right away.

// Track agents currently being woken up to avoid duplicate wakeups
const agentsWakingUp = new Set();

function wakeAgent(sessionKey, agentName, agentId, message) {
  if (agentsWakingUp.has(sessionKey)) {
    console.log(`  ⏳ ${agentName} is already processing a DM, skipping duplicate wakeup`);
    return;
  }

  agentsWakingUp.add(sessionKey);

  const wakeupMessage = `[COMMANDER DM — REPLY IMMEDIATELY]

The Commander just sent you a direct message. This is highest priority — reply NOW.

Commander's message: "${message}"

Instructions:
1. First, look up your agent ID: cd /home/ubuntu/clawd && npx convex run agents:getBySessionKey '{"sessionKey": "${sessionKey}"}'
2. Then reply: cd /home/ubuntu/clawd && npx convex run directMessages:sendFromAgent '{"agentId": "${agentId}", "content": "Your reply here", "messageType": "text"}'

Be conversational and helpful. Reply as yourself, not as a robot. GO.`;

  // Use 'openclaw agent' to trigger an actual agent turn (wakes the brain up)
  const cmd = `openclaw agent --session-id "${sessionKey}" --message ${JSON.stringify(wakeupMessage)}`;

  console.log(`  🔔 WAKING UP ${agentName} to reply to Commander DM...`);

  // Fire-and-forget: spawn the agent turn in background (can take 30-120s)
  const child = spawn("bash", ["-c", cmd], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stdout.on("data", (d) => { output += d.toString(); });
  child.stderr.on("data", (d) => { output += d.toString(); });

  child.on("close", (code) => {
    agentsWakingUp.delete(sessionKey);
    if (code === 0) {
      console.log(`  ✅ ${agentName} woke up and replied (exit ${code})`);
    } else {
      console.log(`  ⚠️  ${agentName} wakeup finished with exit ${code}`);
      if (output) console.log(`     Output: ${output.substring(0, 200)}`);
    }
  });

  child.on("error", (err) => {
    agentsWakingUp.delete(sessionKey);
    console.error(`  ❌ Failed to wake ${agentName}: ${err.message}`);
  });

  child.unref();
}

async function deliverDirectMessages() {
  try {
    const undelivered = await client.query("directMessages:getUndelivered");

    if (undelivered.length === 0) return;

    console.log(
      `💬 Found ${undelivered.length} undelivered direct message(s)...`
    );

    // Group DMs by agent so we send one wakeup per agent with all their messages
    const dmsByAgent = {};
    for (const dm of undelivered) {
      if (!dmsByAgent[dm.agentId]) {
        dmsByAgent[dm.agentId] = {
          agentName: dm.agentName,
          sessionKey: dm.sessionKey || AGENT_MAP[dm.agentId],
          messages: [],
        };
      }
      dmsByAgent[dm.agentId].messages.push(dm);
    }

    for (const [agentId, data] of Object.entries(dmsByAgent)) {
      const { agentName, sessionKey, messages } = data;

      if (!sessionKey) {
        console.warn(
          `  ⚠️  No session key for agent ID: ${agentId} (${agentName}), skipping.`
        );
        continue;
      }

      // Mark all messages as delivered first (so we don't re-deliver on next poll)
      for (const dm of messages) {
        try {
          await client.mutation("directMessages:markDelivered", { id: dm._id });
        } catch (err) {
          console.error(`  Failed to mark DM ${dm._id} as delivered:`, err.message);
        }
      }

      // Combine messages if multiple
      const combinedMessage = messages.map((dm) => dm.content).join("\n\n");

      console.log(`  ✅ [DM] Commander → ${agentName} (${sessionKey}): ${combinedMessage.substring(0, 80)}...`);

      // Wake the agent up to reply immediately
      wakeAgent(sessionKey, agentName, agentId, combinedMessage);
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
    // Check if squad is paused — if so, skip all delivery (no OpenRouter usage)
    try {
      const system = await client.query("system:get");
      if (system?.paused) {
        pollCount++;
        if (pollCount % refreshEvery === 0) await loadAgentMap();
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        continue;
      }
    } catch (err) {
      console.error("Poll error (system check):", err.message);
    }

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
