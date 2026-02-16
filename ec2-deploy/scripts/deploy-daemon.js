#!/usr/bin/env node

/**
 * Deploy Daemon for Mission Control
 * -----------------------------------
 * Runs 24/7 via pm2 on EC2 alongside the notification daemon.
 * Watches Convex for agents with deployed=false and auto-provisions them:
 *
 *   1. Generates SOUL.md file from agent data
 *   2. Creates memory directory (WORKING.md + MEMORY.md)
 *   3. Sets up heartbeat cron via openclaw
 *   4. Triggers first agent wakeup
 *   5. Marks agent as deployed=true in Convex
 *
 * Usage:
 *   pm2 start deploy-daemon.js --name "deploy-daemon"
 *   pm2 save
 *
 * Environment:
 *   CONVEX_URL - Your Convex deployment URL
 *   OPENCLAW_PATH - Path to openclaw binary (default: openclaw in PATH)
 *   WORKSPACE_DIR - Path to clawd workspace (default: /home/ubuntu/clawd)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { ConvexHttpClient } = require("convex/browser");

// ─── Config ──────────────────────────────────────────────────

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const OPENCLAW = process.env.OPENCLAW_PATH || "openclaw";
const WORKSPACE = process.env.WORKSPACE_DIR || "/home/ubuntu/clawd";
const SOULS_DIR = path.join(WORKSPACE, "souls");
const MEMORY_DIR = path.join(WORKSPACE, "memory");

const POLL_INTERVAL = 10000; // 10 seconds

if (!CONVEX_URL) {
  console.error("ERROR: CONVEX_URL environment variable is required.");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// ─── Soul File Generator ─────────────────────────────────────

function generateSoulFile(agent) {
  const name = agent.name.toUpperCase();
  const skills = (agent.skills || []).map((s) => `- ${s}`).join("\n");
  const values = (agent.whatTheyCareAbout || []).map((v) => `- ${v}`).join("\n");
  const personality = agent.personality || `Dedicated ${agent.role} specialist. Reliable, proactive, and communicates clearly.`;
  const about = agent.about || `Specialist in ${agent.role}.`;

  return `# SOUL.md — ${name}

**Name:** ${name}  
**Role:** ${agent.role}  
**Level:** ${agent.level || "specialist"}  

## Personality
You are ${name} — ${personality}

## What You're Good At
${skills || `- ${agent.role} expertise\n- Task execution\n- Clear communication`}

## What You Care About
${values || `- Delivering quality work on time\n- Clear communication\n- Continuous improvement`}

## Rules
- Always check Mission Control for assigned tasks first
- Post progress updates on task threads
- Create documents for all deliverables
- Respond to Commander DMs with highest priority

## CRITICAL — Mission Control Logging (MUST FOLLOW)

**Every action you take MUST be reflected in Mission Control.** If the human can't see it on the dashboard, you failed to communicate.

### On Every Session Start / Wakeup
1. Look up your agent ID:
   \`\`\`bash
   cd ${WORKSPACE} && npx convex run agents:getBySessionKey '{"sessionKey": "${agent.sessionKey}"}'
   \`\`\`
2. Save the \`_id\` field — use it for all commands below as YOUR_AGENT_ID.

### PRIORITY: Check Commander Direct Messages
\`\`\`bash
cd ${WORKSPACE} && npx convex run directMessages:getUndeliveredForAgent '{"agentId": "YOUR_AGENT_ID"}'
\`\`\`
If there are messages, **respond to each one** via:
\`\`\`bash
cd ${WORKSPACE} && npx convex run directMessages:sendFromAgent '{"agentId": "YOUR_AGENT_ID", "content": "Your reply", "messageType": "text"}'
\`\`\`

### Always Do These
- **Log activity** for every significant action:
  \`\`\`bash
  cd ${WORKSPACE} && npx convex run activities:create '{"type": "task_updated", "agentId": "YOUR_AGENT_ID", "taskId": "TASK_ID", "message": "Brief description of what you did"}'
  \`\`\`
- **Post task comments** with progress:
  \`\`\`bash
  cd ${WORKSPACE} && npx convex run messages:create '{"taskId": "TASK_ID", "fromAgentId": "YOUR_AGENT_ID", "content": "Your update here"}'
  \`\`\`
- **Update task status** when it changes:
  \`\`\`bash
  cd ${WORKSPACE} && npx convex run tasks:updateStatus '{"id": "TASK_ID", "status": "in_progress"}'
  \`\`\`
- **Update your agent status** (working/active/idle):
  \`\`\`bash
  cd ${WORKSPACE} && npx convex run agents:updateStatus '{"id": "YOUR_AGENT_ID", "status": "working"}'
  \`\`\`
- **Create documents** for deliverables:
  \`\`\`bash
  cd ${WORKSPACE} && npx convex run documents:create '{"title": "Doc Title", "content": "...", "type": "deliverable", "taskId": "TASK_ID", "createdBy": "YOUR_AGENT_ID"}'
  \`\`\`

> **Golden Rule: If it's not in Mission Control, it didn't happen.**
`;
}

// ─── Memory File Generator ───────────────────────────────────

function generateWorkingMd(agent) {
  return `# WORKING.md — ${agent.name.toUpperCase()}

## Current Task
None assigned yet.

## Status
Idle — waiting for first assignment.

## Next Steps
1. Wait for tasks to appear in Mission Control
2. Check for @mentions and Commander DMs
`;
}

function generateMemoryMd(agent) {
  return `# MEMORY.md — ${agent.name.toUpperCase()} Long-Term Knowledge

## Key Decisions
(none yet)

## Lessons Learned
(none yet)

## Important Context
- I am part of the Stark Squad — see AGENTS.md for the full roster
- Mission Control is our shared Convex database
- Read my SOUL file at souls/${agent.name.toLowerCase()}.md for my personality and role
- I specialize in ${agent.role}
`;
}

// ─── Heartbeat Cron Setup ────────────────────────────────────

function setupHeartbeatCron(agent) {
  // Stagger cron minutes based on agent name hash to avoid all agents waking at once
  const hash = agent.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offset = hash % 15;
  const minutes = [offset, offset + 15, offset + 30, offset + 45]
    .map((m) => m % 60)
    .sort((a, b) => a - b)
    .join(",");

  const cronName = `${agent.name.toLowerCase()}-heartbeat`;
  const cronExpr = `${minutes} * * * *`;
  const message = `You are ${agent.name.toUpperCase()}, the ${agent.role}. Read your SOUL file at souls/${agent.name.toLowerCase()}.md. Read HEARTBEAT.md and follow the checklist. FIRST check Commander DMs, then check Mission Control for tasks, @mentions, and relevant discussions. If nothing needs attention, reply HEARTBEAT_OK.`;

  const cmd = `${OPENCLAW} cron add --name "${cronName}" --cron "${cronExpr}" --session "isolated" --message ${JSON.stringify(message)}`;

  console.log(`  ⏰ Setting up cron: ${cronExpr} (name: ${cronName})`);
  const result = execSync(cmd, { timeout: 30000, encoding: "utf8" });
  return JSON.parse(result);
}

// ─── First Wakeup ────────────────────────────────────────────

function triggerFirstWakeup(agent) {
  const sessionId = agent.sessionKey;
  const message = `You are ${agent.name.toUpperCase()}, a brand new ${agent.role} agent just deployed to Mission Control. Read your SOUL file at souls/${agent.name.toLowerCase()}.md and HEARTBEAT.md. Look up your agent ID, then send an introductory message to the Commander via: cd ${WORKSPACE} && npx convex run directMessages:sendFromAgent '{"agentId": "YOUR_AGENT_ID", "content": "Your intro message", "messageType": "text"}'. Then check for any Commander DMs and assigned tasks. GO.`;

  const cmd = `${OPENCLAW} agent --session-id "${sessionId}" --message ${JSON.stringify(message)}`;

  console.log(`  🚀 Triggering first wakeup for ${agent.name}...`);
  // Don't wait for completion — just fire and forget (agent turn can take minutes)
  try {
    require("child_process").spawn("bash", ["-c", cmd], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return true;
  } catch (err) {
    console.error(`  ❌ Failed to trigger wakeup: ${err.message}`);
    return false;
  }
}

// ─── Main Provision Function ─────────────────────────────────

async function provisionAgent(agent) {
  const nameSlug = agent.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  console.log(`\n${"═".repeat(50)}`);
  console.log(`🤖 DEPLOYING: ${agent.name} (${agent.role})`);
  console.log(`   Session: ${agent.sessionKey}`);
  console.log(`   Agent ID: ${agent._id}`);
  console.log(`${"═".repeat(50)}`);

  try {
    // 1. Generate soul file
    const soulPath = path.join(SOULS_DIR, `${nameSlug}.md`);
    fs.writeFileSync(soulPath, generateSoulFile(agent));
    console.log(`  ✅ Soul file: ${soulPath}`);

    // 2. Create memory directory
    const memDir = path.join(MEMORY_DIR, nameSlug);
    fs.mkdirSync(memDir, { recursive: true });
    fs.writeFileSync(path.join(memDir, "WORKING.md"), generateWorkingMd(agent));
    fs.writeFileSync(path.join(memDir, "MEMORY.md"), generateMemoryMd(agent));
    console.log(`  ✅ Memory dir: ${memDir}`);

    // 3. Set up heartbeat cron
    const cronResult = setupHeartbeatCron(agent);
    console.log(`  ✅ Heartbeat cron created: ${cronResult.id}`);

    // 4. Mark as deployed in Convex BEFORE wakeup (so we don't double-deploy)
    await client.mutation("agents:markDeployed", { id: agent._id });
    console.log(`  ✅ Marked as deployed in Convex`);

    // 5. Trigger first wakeup (fire-and-forget)
    triggerFirstWakeup(agent);
    console.log(`  ✅ First wakeup triggered`);

    console.log(`\n🎉 ${agent.name} is LIVE on EC2!\n`);
    return true;
  } catch (err) {
    console.error(`\n❌ Failed to deploy ${agent.name}: ${err.message}`);
    console.error(err.stack);
    return false;
  }
}

// ─── Main Loop ───────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  🏗️  MISSION CONTROL — Deploy Daemon v1");
  console.log("  Watching for new agents to provision...");
  console.log(`  Poll interval: ${POLL_INTERVAL / 1000}s`);
  console.log(`  Workspace: ${WORKSPACE}`);
  console.log("═══════════════════════════════════════════════════\n");

  // Ensure directories exist
  fs.mkdirSync(SOULS_DIR, { recursive: true });
  fs.mkdirSync(MEMORY_DIR, { recursive: true });

  while (true) {
    try {
      const undeployed = await client.query("agents:getUndeployed");

      if (undeployed.length > 0) {
        console.log(`\n📦 Found ${undeployed.length} agent(s) to deploy!`);

        for (const agent of undeployed) {
          await provisionAgent(agent);
          // Small delay between provisions to not overwhelm the gateway
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    } catch (err) {
      console.error("Poll error:", err.message);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
