#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  MISSION CONTROL — Heartbeat Cron Setup Script
#  Run this on EC2 to register all agent heartbeat crons.
#  Each agent wakes every 15 minutes, staggered by 2 min.
# ═══════════════════════════════════════════════════════════

echo "🦾 Setting up heartbeat crons for The Stark Squad..."
echo ""

# JARVIS — Squad Lead (wakes at :00, :15, :30, :45)
openclaw cron add \
  --name "jarvis-heartbeat" \
  --cron "0,15,30,45 * * * *" \
  --session "isolated" \
  --message "You are JARVIS, the Squad Lead. Read HEARTBEAT.md and follow the checklist. Check Mission Control for new tasks, @mentions, and activity. Delegate work to the right agent. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ JARVIS heartbeat registered (:00)"

# FRIDAY — Developer (wakes at :02, :17, :32, :47)
openclaw cron add \
  --name "friday-heartbeat" \
  --cron "2,17,32,47 * * * *" \
  --session "isolated" \
  --message "You are FRIDAY, the Developer. Read HEARTBEAT.md and follow the checklist. Check Mission Control for development tasks assigned to you, @mentions, and code-related discussions. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ FRIDAY heartbeat registered (:02)"

# EDITH — Product Analyst (wakes at :04, :19, :34, :49)
openclaw cron add \
  --name "edith-heartbeat" \
  --cron "4,19,34,49 * * * *" \
  --session "isolated" \
  --message "You are EDITH, the Product Analyst. Read HEARTBEAT.md and follow the checklist. Check Mission Control for product analysis tasks, @mentions, and anything needing user testing or competitive analysis. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ EDITH heartbeat registered (:04)"

# HULKBUSTER — Customer Researcher (wakes at :06, :21, :36, :51)
openclaw cron add \
  --name "hulkbuster-heartbeat" \
  --cron "6,21,36,51 * * * *" \
  --session "isolated" \
  --message "You are HULKBUSTER, the Customer Researcher. Read HEARTBEAT.md and follow the checklist. Check Mission Control for research tasks, @mentions, and anything needing customer insights or competitive intel. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ HULKBUSTER heartbeat registered (:06)"

# VISION — Content Writer (wakes at :07, :22, :37, :52)
openclaw cron add \
  --name "vision-heartbeat" \
  --cron "7,22,37,52 * * * *" \
  --session "isolated" \
  --message "You are VISION, the Content Writer. Read HEARTBEAT.md and follow the checklist. Check Mission Control for writing tasks, @mentions, and content-related discussions. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ VISION heartbeat registered (:07)"

# BANNER — SEO Analyst (wakes at :08, :23, :38, :53)
openclaw cron add \
  --name "banner-heartbeat" \
  --cron "8,23,38,53 * * * *" \
  --session "isolated" \
  --message "You are BANNER, the SEO Analyst. Read HEARTBEAT.md and follow the checklist. Check Mission Control for SEO tasks, @mentions, and content that needs keyword research. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ BANNER heartbeat registered (:08)"

# RHODEY — Social Media Manager (wakes at :10, :25, :40, :55)
openclaw cron add \
  --name "rhodey-heartbeat" \
  --cron "10,25,40,55 * * * *" \
  --session "isolated" \
  --message "You are RHODEY, the Social Media Manager. Read HEARTBEAT.md and follow the checklist. Check Mission Control for social media tasks, @mentions, and content ready to be promoted. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ RHODEY heartbeat registered (:10)"

# PEPPER — Email Marketing (wakes at :11, :26, :41, :56)
openclaw cron add \
  --name "pepper-heartbeat" \
  --cron "11,26,41,56 * * * *" \
  --session "isolated" \
  --message "You are PEPPER, the Email Marketing Specialist. Read HEARTBEAT.md and follow the checklist. Check Mission Control for email tasks, @mentions, and campaigns that need drafting or review. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ PEPPER heartbeat registered (:11)"

# MARK1 — Designer (wakes at :12, :27, :42, :57)
openclaw cron add \
  --name "mark1-heartbeat" \
  --cron "12,27,42,57 * * * *" \
  --session "isolated" \
  --message "You are MARK1, the Designer. Read HEARTBEAT.md and follow the checklist. Check Mission Control for design tasks, @mentions, and anything needing visual assets. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ MARK1 heartbeat registered (:12)"

# KAREN — Documentation Specialist (wakes at :13, :28, :43, :58)
openclaw cron add \
  --name "karen-heartbeat" \
  --cron "13,28,43,58 * * * *" \
  --session "isolated" \
  --message "You are KAREN, the Documentation Specialist. Read HEARTBEAT.md and follow the checklist. Check Mission Control for documentation tasks, @mentions, and any decisions that need to be documented. If nothing needs attention, reply HEARTBEAT_OK."

echo "✅ KAREN heartbeat registered (:13)"

echo ""
echo "───────────────────────────────────────────────"
echo "  📊 Setting up Daily Standup..."
echo ""

# DAILY STANDUP — JARVIS compiles a report at 10:25 PM IST (4:55 PM UTC)
openclaw cron add \
  --name "jarvis-daily-standup" \
  --cron "55 16 * * *" \
  --session "isolated" \
  --message "You are JARVIS. It's DAILY STANDUP time. Compile a comprehensive status report and send it to the operator via Telegram.

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
• Agents Active: X/10
• Tasks Completed Today: X
• Tasks In Progress: X
• Tasks Blocked: X

Also post this standup as a broadcast to Mission Control:
cd /home/ubuntu/clawd && npx convex run broadcasts:send '{\"message\": \"Daily Standup compiled. Check Telegram for full report.\", \"priority\": \"normal\", \"fromAgentId\": \"YOUR_AGENT_ID\"}'

This is a daily ritual. Be thorough. The operator relies on this to know what happened."

echo "✅ Daily Standup registered (10:25 PM IST / 4:55 PM UTC)"

echo ""
echo "═══════════════════════════════════════════════"
echo "  🎯 All 10 heartbeat crons + Daily Standup registered!"
echo "  Schedule (staggered every 2 minutes):"
echo "    :00 JARVIS    :07 VISION    :11 PEPPER"
echo "    :02 FRIDAY    :08 BANNER    :12 MARK1"
echo "    :04 EDITH     :10 RHODEY    :13 KAREN"
echo "    :06 HULKBUSTER"
echo ""
echo "  📊 Daily Standup: 10:25 PM IST (JARVIS → Telegram)"
echo "═══════════════════════════════════════════════"
