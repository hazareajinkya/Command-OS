#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  MISSION CONTROL — Heartbeat Cron Setup Script
#  Run this on EC2 to register all agent heartbeat crons.
#  Each agent wakes every 15 minutes, staggered by 3 min.
#  Respects PAUSE from Command OS dashboard — when paused,
#  no heartbeats fire (no OpenRouter usage).
# ═══════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MSGS_DIR="$CLAWD_DIR/scripts/heartbeat-msgs"
WRAPPER="$CLAWD_DIR/scripts/heartbeat-wrapper.sh"

echo "🦾 Setting up heartbeat crons for The Stark Squad..."
echo "   (Uses system crontab + pause-aware wrapper)"
echo ""

# ─── Remove old OpenClaw crons (if any) ───────────────────
echo "🧹 Removing old openclaw heartbeat crons..."
for name in jarvis-heartbeat iris-heartbeat lora-heartbeat rexx-heartbeat jim-heartbeat friday-heartbeat edith-heartbeat hulkbuster-heartbeat vision-heartbeat banner-heartbeat rhodey-heartbeat pepper-heartbeat mark1-heartbeat karen-heartbeat jarvis-daily-standup; do
  openclaw cron remove --name "$name" 2>/dev/null || true
done
echo "   Done."
echo ""

# ─── Create heartbeat message files ──────────────────────
mkdir -p "$MSGS_DIR"

cat > "$MSGS_DIR/jarvis.msg" << 'MSG'
You are JARVIS, the Executive Officer. Read HEARTBEAT.md and follow the checklist. Check Mission Control for new tasks, @mentions, and activity. Delegate work to the right agent. If nothing needs attention, reply HEARTBEAT_OK.
MSG

cat > "$MSGS_DIR/iris.msg" << 'MSG'
You are IRIS, the Graphic Designer. Read HEARTBEAT.md and follow the checklist. Check Mission Control for design tasks assigned to you, @mentions, and anything needing graphics, UI mockups, or brand assets. If nothing needs attention, reply HEARTBEAT_OK.
MSG

cat > "$MSGS_DIR/lora.msg" << 'MSG'
You are LORA, the Social Media Head. Read HEARTBEAT.md and follow the checklist. Check Mission Control for social media tasks, @mentions, and content ready to be promoted or community engagement opportunities. If nothing needs attention, reply HEARTBEAT_OK.
MSG

cat > "$MSGS_DIR/rexx.msg" << 'MSG'
You are REXX, the Developer. Read HEARTBEAT.md and follow the checklist. Check Mission Control for development tasks assigned to you, @mentions, and code-related discussions. If nothing needs attention, reply HEARTBEAT_OK.
MSG

cat > "$MSGS_DIR/jim.msg" << 'MSG'
You are JIM, the Sales Lead. Read HEARTBEAT.md and follow the checklist. Check Mission Control for sales tasks, @mentions, and anything needing lead generation, outreach, or deal pipeline management. If nothing needs attention, reply HEARTBEAT_OK.
MSG

cat > "$MSGS_DIR/jarvis-standup.msg" << 'MSG'
You are JARVIS. It's DAILY STANDUP time. Compile a comprehensive status report and send it to the operator via Telegram.

DO THIS:
1. Run: cd /home/ubuntu/clawd && npx convex run tasks:list '{}'
2. Run: cd /home/ubuntu/clawd && npx convex run activities:list '{}'
3. Run: cd /home/ubuntu/clawd && npx convex run agents:list '{}'

Then compile a standup report in this EXACT format and send it as your response:

📊 DAILY STANDUP — [Today's Date]

✅ COMPLETED TODAY
• [Agent]: [Task title] — [brief summary]

🔄 IN PROGRESS
• [Agent]: [Task title] — [current status]

📋 ASSIGNED (Not Started)
• [Agent]: [Task title]

🚫 BLOCKED
• [Agent]: [Task title] — [what's needed]

👀 NEEDS REVIEW
• [Task title] — [who should review]

💬 KEY SQUAD CHAT HIGHLIGHTS
• [Any notable discussions from today]

📝 KEY DECISIONS
• [Important decisions made today]

📈 SQUAD STATS
• Agents Active: X/5
• Tasks Completed Today: X
• Tasks In Progress: X
• Tasks Blocked: X

Also post this standup as a broadcast to Mission Control:
cd /home/ubuntu/clawd && npx convex run broadcasts:send '{"message": "Daily Standup compiled. Check Telegram for full report.", "priority": "normal", "fromAgentId": "YOUR_AGENT_ID"}'

This is a daily ritual. Be thorough. The operator relies on this to know what happened.
MSG

echo "✅ Heartbeat message files created in $MSGS_DIR"
chmod +x "$WRAPPER"
echo ""

# ─── Add system crontab entries ───────────────────────────
# These run the wrapper, which checks Convex system:isPaused before sending.
# When paused from Command OS dashboard, no agent wakeups = no OpenRouter usage.

CRON_MARKER="# MISSION CONTROL HEARTBEATS (pause-aware)"
CRON_ENTRIES="
$CRON_MARKER
0,15,30,45 * * * * $WRAPPER \"agent:main:main\" $MSGS_DIR/jarvis.msg
3,18,33,48 * * * * $WRAPPER \"agent:designer:main\" $MSGS_DIR/iris.msg
6,21,36,51 * * * * $WRAPPER \"agent:social-media-manager:main\" $MSGS_DIR/lora.msg
9,24,39,54 * * * * $WRAPPER \"agent:developer:main\" $MSGS_DIR/rexx.msg
12,27,42,57 * * * * $WRAPPER \"agent:sales-lead:main\" $MSGS_DIR/jim.msg
55 16 * * * $WRAPPER \"agent:main:main\" $MSGS_DIR/jarvis-standup.msg
"

# Backup and update crontab
TMP_CRON=$(mktemp)
crontab -l 2>/dev/null | grep -v "$CRON_MARKER" | grep -v "heartbeat-wrapper.sh" | grep -v "heartbeat-msgs" > "$TMP_CRON" || true
echo "$CRON_ENTRIES" >> "$TMP_CRON"
crontab "$TMP_CRON"
rm -f "$TMP_CRON"

echo "✅ System crontab updated (pause-aware heartbeats)"
echo ""
echo "═══════════════════════════════════════════════"
echo "  🎯 All 5 heartbeat crons + Daily Standup registered!"
echo "  Schedule (staggered every 3 minutes):"
echo "    :00 JARVIS    :06 LORA     :12 JIM"
echo "    :03 IRIS      :09 REXX"
echo ""
echo "  ⏸️  Use PAUSE on Command OS dashboard to stop all"
echo "     heartbeats & OpenRouter usage when recharging."
echo ""
echo "  ⚠️  Ensure $CLAWD_DIR/.env has CONVEX_URL for pause check."
echo "  📊 Daily Standup: 10:25 PM IST (JARVIS → Telegram)"
echo "═══════════════════════════════════════════════"
