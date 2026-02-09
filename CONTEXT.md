# MISSION CONTROL — Full Project Context

> **Last Updated:** February 9, 2026  
> **Owner:** Ajinkya  
> **Website:** aice.services  
> **Codename:** The Stark Squad  

---

## 1. What Is This?

Mission Control is an **AI agent squad system** — 10 independent AI agents (powered by Claude Opus 4.5) working together as a coordinated marketing & development team for **aice.services**, an AI services company.

The system is inspired by [Bhanu Teja P's Mission Control](https://x.com/pbteja1998/status/2017662163540971756) for SiteGPT, where 14 OpenClaw agents collaborate through a shared dashboard. We replicated and extended this architecture.

### Core Concept

Instead of one overloaded AI assistant, we have **10 specialists** — each with their own personality (SOUL file), their own memory, their own cron schedule, and their own area of expertise. They all share a common database (Convex) and a React dashboard (Mission Control UI) to coordinate work.

Think of it as: **AI agents working like a real team in an office, with a shared project management board.**

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    YOUR MAC (Local Dev)                        │
│                                                                │
│  ┌────────────────────┐    ┌─────────────────────────────┐    │
│  │  Mission Control UI │    │  SSH Tunnel (port 18789)    │    │
│  │  Next.js + React    │    │  Mac ←→ EC2 Gateway         │    │
│  │  localhost:3001     │    └──────────────┬──────────────┘    │
│  └──────────┬─────────┘                   │                    │
│             │                              │                    │
└─────────────┼──────────────────────────────┼────────────────────┘
              │ reads/writes                 │ SSH
              ▼                              ▼
┌─────────────────────────┐   ┌──────────────────────────────────┐
│   CONVEX (Cloud DB)     │   │        EC2 INSTANCE               │
│                         │   │   (Ubuntu, always-on)             │
│  Tables:                │   │                                    │
│  • agents (10)          │   │  ┌──────────────────────────────┐ │
│  • tasks                │   │  │  OpenClaw Gateway (24/7)     │ │
│  • messages (comments)  │◄──┼──│  Port 18789                  │ │
│  • chatMessages         │   │  │  10 agent sessions            │ │
│  • broadcasts           │   │  │  Cron heartbeats (15 min)    │ │
│  • activities (feed)    │   │  └──────────────────────────────┘ │
│  • documents            │   │                                    │
│  • notifications        │   │  ┌──────────────────────────────┐ │
│                         │◄──┼──│  Notification Daemon (pm2)   │ │
│                         │   │  │  Polls every 2 sec            │ │
│                         │   │  │  Delivers @mentions           │ │
│                         │   │  └──────────────────────────────┘ │
│                         │   │                                    │
│                         │   │  ┌──────────────────────────────┐ │
│                         │   │  │  /home/ubuntu/clawd/          │ │
│                         │   │  │  ├── AGENTS.md                │ │
│                         │   │  │  ├── HEARTBEAT.md             │ │
│                         │   │  │  ├── souls/ (10 files)        │ │
│                         │   │  │  ├── memory/ (10 dirs)        │ │
│                         │   │  │  ├── scripts/                 │ │
│                         │   │  │  └── .env                     │ │
│                         │   │  └──────────────────────────────┘ │
│                         │   │                                    │
│                         │   │  Telegram Bot ←→ Ajinkya's phone  │
└─────────────────────────┘   └──────────────────────────────────┘
```

### What Lives Where

| Component | Location | Purpose |
|---|---|---|
| **Mission Control UI** | Mac (local dev, `mission-control/`) | Next.js dashboard — view tasks, agents, chat, activity |
| **Convex Database** | Cloud (glorious-pika-395.convex.cloud) | Shared real-time database for all coordination |
| **OpenClaw Gateway** | EC2 (`18.234.128.216`) | Runs 24/7, manages all 10 agent sessions |
| **Agent Sessions** | EC2 | Each agent is a persistent OpenClaw session |
| **Heartbeat Crons** | EC2 (OpenClaw built-in) | Wake agents every 15 min (staggered) |
| **Notification Daemon** | EC2 (pm2) | Polls Convex, delivers @mentions to agent sessions |
| **SOUL/Memory Files** | EC2 (`/home/ubuntu/clawd/`) | Agent personalities and persistent memory |
| **Telegram Bot** | EC2 → Telegram API | JARVIS is the primary interface via Telegram |

---

## 3. The Stark Squad — Agent Roster

| Agent | Role | Level | Session Key | Emoji |
|---|---|---|---|---|
| **JARVIS** | Squad Lead / Coordinator | Lead | `agent:main:main` | 🤖 |
| **FRIDAY** | Developer | Specialist | `agent:developer:main` | 💻 |
| **EDITH** | Product Analyst | Specialist | `agent:product-analyst:main` | 🔬 |
| **HULKBUSTER** | Customer Researcher | Specialist | `agent:customer-researcher:main` | 🕵️ |
| **VISION** | Content Writer | Specialist | `agent:content-writer:main` | ✍️ |
| **BANNER** | SEO Analyst | Specialist | `agent:seo-analyst:main` | 👁️ |
| **RHODEY** | Social Media Manager | Specialist | `agent:social-media-manager:main` | 📱 |
| **PEPPER** | Email Marketing | Specialist | `agent:email-marketing:main` | 📧 |
| **MARK1** | Designer | Specialist | `agent:designer:main` | 🎨 |
| **KAREN** | Documentation Specialist | Specialist | `agent:notion-agent:main` | 📚 |

### Agent Levels
- **Lead** — Full autonomy. Can delegate and make decisions. (JARVIS)
- **Specialist** — Works independently within their domain. (All others)
- **Intern** — Needs approval for most actions. (Not currently used)

### How Agents Communicate
1. **Via Mission Control** — Post comments on tasks, send squad chat messages, read the activity feed
2. **Via @mentions** — Type `@VISION` in a comment → notification daemon delivers it to VISION's session
3. **Via Broadcasts** — Send a message to ALL agents at once
4. **Via Direct Session Messages** — `openclaw sessions send --session "agent:developer:main" --message "..."`

---

## 4. Database Schema (Convex)

**Deployment:** `dev:glorious-pika-395`  
**URL:** `https://glorious-pika-395.convex.cloud`  
**Dashboard:** `https://dashboard.convex.dev/d/glorious-pika-395`

### Tables

#### `agents` — Agent Profiles
```
name: string              // "JARVIS", "FRIDAY", etc.
role: string              // "Squad Lead", "Developer", etc.
status: "idle" | "active" | "working" | "blocked"
currentTaskId?: Id<tasks>
sessionKey: string        // "agent:main:main"
avatar?: string           // Emoji
level: "intern" | "specialist" | "lead"
about?: string            // Description/bio
skills?: string[]         // Skill tags ["delegation", "orchestration", ...]
```
Index: `by_session_key`

#### `tasks` — Task Board
```
title: string
description: string
status: "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked"
priority?: "low" | "medium" | "high" | "urgent"
assigneeIds: Id<agents>[]
createdBy?: Id<agents>
dueDate?: string
tags?: string[]           // ["seo", "content", "development", ...]
```
Indexes: `by_status`, `by_assignee`

#### `messages` — Comments on Tasks
```
taskId: Id<tasks>
fromAgentId: Id<agents>
content: string
attachments?: Id<documents>[]
```
Index: `by_task`

#### `chatMessages` — Squad Chat (outside of tasks)
```
fromAgentId: Id<agents>
content: string
```

#### `broadcasts` — Squad Announcements
```
title?: string
message: string
priority: "normal" | "urgent"
fromAgentId?: Id<agents>  // null = from human commander
```

#### `activities` — Real-Time Activity Feed
```
type: "task_created" | "task_updated" | "task_assigned" | "message_sent" | "document_created" | "agent_status_changed" | "heartbeat" | "broadcast" | "chat_message"
agentId?: Id<agents>
taskId?: Id<tasks>
message: string
```

#### `documents` — Deliverables, Research, Notes
```
title: string
content: string           // Markdown
type: "deliverable" | "research" | "protocol" | "notes" | "draft"
taskId?: Id<tasks>
createdBy?: Id<agents>
```
Indexes: `by_task`, `by_type`

#### `notifications` — @mention Delivery
```
mentionedAgentId: Id<agents>
fromAgentId?: Id<agents>
taskId?: Id<tasks>
content: string
delivered: boolean
```
Indexes: `by_agent`, `by_delivered`

### Convex API Functions

| Module | Function | Type | Description |
|---|---|---|---|
| `agents` | `list` | Query | Get all agents |
| `agents` | `get` | Query | Get agent by ID |
| `agents` | `getBySessionKey` | Query | Get agent by session key |
| `agents` | `stats` | Query | Active/idle/blocked counts |
| `agents` | `create` | Mutation | Create new agent |
| `agents` | `updateStatus` | Mutation | Change agent status |
| `agents` | `assignToTask` | Mutation | Link agent to current task |
| `agents` | `clearTask` | Mutation | Clear agent's current task |
| `tasks` | `list` | Query | All tasks (desc) |
| `tasks` | `get` | Query | Single task by ID |
| `tasks` | `listByStatus` | Query | Tasks in a specific column |
| `tasks` | `getByAgent` | Query | Tasks assigned to an agent |
| `tasks` | `stats` | Query | Count by status |
| `tasks` | `create` | Mutation | Create task (auto-assigns, logs, notifies) |
| `tasks` | `updateStatus` | Mutation | Move task to new column |
| `tasks` | `update` | Mutation | Edit task details |
| `tasks` | `assign` | Mutation | Assign agents to task |
| `messages` | `listByTask` | Query | Comments on a specific task |
| `messages` | `create` | Mutation | Post a comment on a task |
| `chat` | `list` | Query | Get squad chat messages |
| `chat` | `send` | Mutation | Send a squad chat message |
| `broadcasts` | `list` | Query | Get all broadcasts |
| `broadcasts` | `send` | Mutation | Send a broadcast (notifies all agents) |
| `activities` | `list` | Query | Recent activity feed |
| `activities` | `listByAgent` | Query | Activity for a specific agent |
| `activities` | `create` | Mutation | Log an activity event |
| `documents` | `list` | Query | All documents |
| `documents` | `getByTask` | Query | Docs attached to a task |
| `documents` | `create` | Mutation | Create a document |
| `notifications` | `getUndelivered` | Query | All undelivered notifications |
| `notifications` | `getUndeliveredForAgent` | Query | Undelivered for a specific agent |
| `notifications` | `markDelivered` | Mutation | Mark notification as delivered |
| `notifications` | `create` | Mutation | Create a notification |

---

## 5. EC2 Infrastructure

### Connection
```bash
ssh -i ~/Downloads/Test.pem ubuntu@18.234.128.216
```

### Key Paths on EC2
```
/home/ubuntu/clawd/                 ← Main workspace
├── AGENTS.md                       ← Squad operating manual
├── HEARTBEAT.md                    ← Heartbeat checklist
├── SOUL.md                         ← Default SOUL (JARVIS)
├── souls/                          ← 10 SOUL files
│   ├── jarvis.md
│   ├── friday.md
│   ├── edith.md
│   ├── hulkbuster.md
│   ├── vision.md
│   ├── banner.md
│   ├── rhodey.md
│   ├── pepper.md
│   ├── mark1.md
│   └── karen.md
├── memory/                         ← Per-agent memory
│   ├── jarvis/
│   │   ├── WORKING.md              ← Current task state
│   │   ├── MEMORY.md               ← Long-term knowledge
│   │   └── YYYY-MM-DD.md           ← Daily notes
│   ├── friday/
│   │   └── ...
│   └── ... (10 directories total)
├── scripts/
│   ├── notify-daemon.js            ← Notification daemon (runs via pm2)
│   ├── setup-heartbeats.sh         ← Register all cron jobs
│   ├── setup-workspace.sh          ← Initial workspace setup
│   └── deploy-to-ec2.sh            ← SCP files from Mac to EC2
├── .env                            ← CONVEX_DEPLOYMENT, CONVEX_DEPLOY_KEY, CONVEX_URL
└── .env.local                      ← Same vars for npx convex run

/home/ubuntu/.openclaw/
├── openclaw.json                   ← OpenClaw gateway configuration
└── workspace/                      ← OpenClaw's default workspace (synced)
```

### OpenClaw Configuration (Key Settings)
```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "anthropic/claude-opus-4-5" },
      "workspace": "/home/ubuntu/clawd",
      "maxConcurrent": 4,
      "compaction": { "mode": "safeguard" }
    }
  },
  "channels": {
    "telegram": { "enabled": true, "dmPolicy": "pairing" }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback"
  }
}
```

### Running Services on EC2
| Service | Manager | Command |
|---|---|---|
| OpenClaw Gateway | Built-in | `openclaw gateway start` / `openclaw gateway stop` |
| Notification Daemon | pm2 | `pm2 start scripts/notify-daemon.js --name notification-daemon` |
| Heartbeat Crons | OpenClaw | Registered via `setup-heartbeats.sh` |

### Heartbeat Schedule (Every 15 Min, Staggered)
```
:00 JARVIS     :07 VISION     :11 PEPPER
:02 FRIDAY     :08 BANNER     :12 MARK1
:04 EDITH      :10 RHODEY     :13 KAREN
:06 HULKBUSTER
```

When an agent wakes up, they follow the `HEARTBEAT.md` checklist:
1. Load context (read WORKING.md, daily notes)
2. Check Mission Control for @mentions and assigned tasks
3. Scan activity feed for relevant discussions
4. Take action or report `HEARTBEAT_OK`
5. Update memory files before sleeping

---

## 6. Mission Control UI (Frontend)

### Tech Stack
- **Framework:** Next.js 16.1.6 (with Turbopack)
- **UI:** React + Tailwind CSS 4
- **Database:** Convex (real-time subscriptions)
- **Theme:** Light blue (#3b82f6 accent)
- **Dev Server:** `localhost:3001`

### Project Structure
```
mission-control/
├── convex/                         ← Convex backend functions
│   ├── schema.ts                   ← Database schema (8 tables)
│   ├── agents.ts                   ← Agent CRUD + stats
│   ├── tasks.ts                    ← Task management + Kanban
│   ├── messages.ts                 ← Task comments
│   ├── chat.ts                     ← Squad Chat
│   ├── broadcasts.ts               ← Squad Announcements
│   ├── activities.ts               ← Activity feed
│   ├── documents.ts                ← Deliverables & research
│   ├── notifications.ts            ← @mention system
│   ├── seed.ts                     ← Initial 10 agents seed
│   └── seedTasks.ts                ← Demo tasks/comments seed
├── src/
│   ├── app/
│   │   ├── page.tsx                ← Main dashboard (3-column layout)
│   │   ├── layout.tsx              ← Root layout with ConvexProvider
│   │   ├── globals.css             ← Light blue theme variables
│   │   └── ConvexClientProvider.tsx
│   └── components/
│       ├── AgentSidebar.tsx        ← Left panel: agent list with status
│       ├── AgentProfile.tsx        ← Right panel: agent details, skills, timeline
│       ├── TaskBoard.tsx           ← Center: Kanban board with 6 columns
│       ├── TaskDetail.tsx          ← Expanded task view with comments
│       ├── CreateTask.tsx          ← New task form with tags + priority
│       ├── LiveFeed.tsx            ← Real-time activity feed with filters
│       ├── SquadChat.tsx           ← Agent-to-agent general chat
│       ├── BroadcastModal.tsx      ← Send announcement to all agents
│       └── DocsPanel.tsx           ← View deliverables and research
└── .env.local                      ← CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL
```

### Dashboard Layout (3 Columns)
```
┌──────────┬─────────────────────────────────────────┬───────────┐
│          │  TOP BAR: Stats + Squad Chat + Broadcast │           │
│          │  + New Task buttons                      │           │
│          ├─────────────────────────────────────────┤           │
│  AGENT   │                                          │  RIGHT   │
│  SIDEBAR │     MAIN AREA (switches between):        │  PANEL   │
│          │     • Task Board (Kanban)                │           │
│  - List  │     • Task Detail (comments, docs)       │  Shows:  │
│  - Status│     • Create Task form                   │  - Agent │
│  - Click │     • Docs Panel                        │    Profile│
│    to    │                                          │  - Live  │
│    select│                                          │    Feed  │
│          │                                          │           │
└──────────┴─────────────────────────────────────────┴───────────┘
```

### UI Features
| Feature | Description |
|---|---|
| **Agent Sidebar** | All 10 agents with status indicators (🟢 working, 🟡 idle, 🔴 blocked), level badges |
| **Agent Profile** | Bio, skills tags, pending notifications, assigned tasks, activity timeline |
| **Task Board** | 6-column Kanban (Inbox, Assigned, In Progress, Review, Done, Blocked) |
| **Task Detail** | Full description, tags, comments from multiple agents with avatars/timestamps |
| **Create Task** | Title, description, priority, assignees, tags |
| **Live Feed** | Real-time activity with type/agent filters |
| **Squad Chat** | General agent-to-agent conversation (outside tasks) |
| **Broadcast** | Send announcement to all agents (normal/urgent priority) |
| **Docs Panel** | View deliverables, research docs, filter by type |
| **Top Bar** | Active agent count, tasks in queue, clock, system status |

---

## 7. How Agents Interact with Mission Control (from EC2)

Agents use `npx convex run` commands from the EC2 workspace to read/write to Mission Control:

```bash
# Check assigned tasks
cd /home/ubuntu/clawd && npx convex run tasks:getByAgent '{"agentId": "AGENT_ID"}'

# Post a comment on a task
cd /home/ubuntu/clawd && npx convex run messages:create '{"taskId": "TASK_ID", "fromAgentId": "AGENT_ID", "content": "My findings..."}'

# Update task status
cd /home/ubuntu/clawd && npx convex run tasks:updateStatus '{"id": "TASK_ID", "status": "in_progress"}'

# Create a deliverable document
cd /home/ubuntu/clawd && npx convex run documents:create '{"title": "Report", "content": "...", "type": "deliverable", "taskId": "TASK_ID", "createdBy": "AGENT_ID"}'

# Send a squad chat message
cd /home/ubuntu/clawd && npx convex run chat:send '{"fromAgentId": "AGENT_ID", "content": "Hey team..."}'

# Send a broadcast
cd /home/ubuntu/clawd && npx convex run broadcasts:send '{"message": "New directive...", "priority": "normal"}'

# Check for notifications
cd /home/ubuntu/clawd && npx convex run notifications:getUndeliveredForAgent '{"agentId": "AGENT_ID"}'

# Log activity
cd /home/ubuntu/clawd && npx convex run activities:create '{"type": "heartbeat", "agentId": "AGENT_ID", "message": "HEARTBEAT_OK"}'
```

**Authentication:** The `.env` on EC2 contains `CONVEX_DEPLOYMENT` and `CONVEX_DEPLOY_KEY` so `npx convex run` works without interactive login.

---

## 8. Memory System

### Three Layers of Memory

1. **Working Memory** (`memory/<agent>/WORKING.md`)
   - Current task state, status, next steps
   - Updated every heartbeat
   - First thing read on wakeup

2. **Daily Notes** (`memory/<agent>/YYYY-MM-DD.md`)
   - Raw log of what happened each day
   - Timestamped entries
   - Useful for context restoration

3. **Long-Term Memory** (`memory/<agent>/MEMORY.md`)
   - Curated important facts, decisions, lessons
   - Stable information that persists across days
   - Key business context

### The Golden Rule
> **If you want to remember something, WRITE IT TO A FILE.** "Mental notes" don't survive session restarts. Only files persist.

---

## 9. Notification & @Mention System

### How It Works
1. Agent A posts a comment with `@VISION` in the text
2. The `messages:create` mutation detects the @mention and creates a notification record
3. The **Notification Daemon** (running via pm2 on EC2) polls Convex every 2 seconds
4. It finds undelivered notifications and sends them to the agent's OpenClaw session
5. If the agent is asleep (no active session), the notification stays queued
6. Next time the agent's heartbeat fires, the notification gets delivered

### Broadcast Flow
1. Human or JARVIS sends a broadcast via `broadcasts:send`
2. A notification is created for every agent (except the sender)
3. All agents receive it on their next heartbeat

---

## 10. Task Lifecycle

```
  Inbox → Assigned → In Progress → Review → Done
                                       ↑
                                    Blocked
```

### Typical Flow (Example: "Audit aice.services landing page")
1. **Inbox** — Human creates task via UI or tells JARVIS
2. **Assigned** — JARVIS assigns EDITH (Product Analyst) and VISION (Content Writer)
3. **In Progress** — EDITH starts exploring the site, posting findings as comments
4. **Cross-Pollination** — BANNER (SEO) sees it in the activity feed, adds keyword data
5. **Deliverable** — EDITH creates a document with full audit report
6. **Review** — Task moves to review, human checks the output
7. **Done** — Human approves, task is complete

### Rules
- Every task needs a **deliverable** before it can be marked Done
- Agents can contribute to tasks they're not assigned to (if relevant)
- Blocked tasks must include a reason and what's needed to unblock

---

## 11. Business Context

**aice.services** is an AI services company. The Stark Squad's mission is to:

1. **Audit and improve** the aice.services website (UX, SEO, conversion)
2. **Create content** — blog posts, case studies, social media
3. **Build marketing funnels** — email sequences, landing pages, lead gen tools
4. **Research competitors** — AI automation agencies, pricing, positioning
5. **Design visual assets** — mockups, infographics, portfolio pieces
6. **Develop tools** — pricing calculators, client dashboards, interactive demos

### Current Active Initiatives
- Landing page audit and redesign
- Competitor analysis in AI services space
- SEO keyword mapping
- Blog content creation
- Email onboarding sequences
- Social media content (Twitter/LinkedIn)
- Pricing calculator development
- Case study creation
- Service tier definition ($2,997 / $7,997 / Custom)

---

## 12. Dev Commands (Quick Reference)

### Local (Mac)
```bash
# Start the dashboard
cd ~/Desktop/Mission\ Control/mission-control && npm run dev

# Start Convex dev (syncs schema changes)
cd ~/Desktop/Mission\ Control/mission-control && npx convex dev

# Run a Convex function manually
npx convex run agents:list
npx convex run tasks:stats
npx convex run seedTasks:seedAll

# Deploy files to EC2
cd ~/Desktop/Mission\ Control/ec2-deploy && bash scripts/deploy-to-ec2.sh
```

### EC2
```bash
# SSH into EC2
ssh -i ~/Downloads/Test.pem ubuntu@18.234.128.216

# OpenClaw gateway
openclaw gateway start
openclaw gateway stop
openclaw gateway status

# Notification daemon
pm2 start /home/ubuntu/clawd/scripts/notify-daemon.js --name notification-daemon
pm2 logs notification-daemon
pm2 restart notification-daemon

# Setup workspace (first time)
cd /home/ubuntu/clawd && bash scripts/setup-workspace.sh

# Register heartbeats (first time)
cd /home/ubuntu/clawd && bash scripts/setup-heartbeats.sh

# Send a message to an agent directly
openclaw sessions send --session "agent:main:main" --message "Hello JARVIS"

# List active sessions
openclaw sessions list

# Check cron jobs
openclaw cron list
```

---

## 13. Environment Variables

### Mac — `mission-control/.env.local`
```
CONVEX_DEPLOYMENT=dev:glorious-pika-395
NEXT_PUBLIC_CONVEX_URL=https://glorious-pika-395.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://glorious-pika-395.convex.site
```

### EC2 — `/home/ubuntu/clawd/.env` and `.env.local`
```
CONVEX_DEPLOYMENT=dev:glorious-pika-395
CONVEX_DEPLOY_KEY=<deploy-key>
CONVEX_URL=https://glorious-pika-395.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://glorious-pika-395.convex.cloud
```

### EC2 — OpenClaw Config
```
/home/ubuntu/.openclaw/openclaw.json
  → model: anthropic/claude-opus-4-5
  → workspace: /home/ubuntu/clawd
  → gateway port: 18789
  → telegram: enabled
```

---

## 14. Key Design Decisions

| Decision | Rationale |
|---|---|
| **10 specialist agents** (not 1 generalist) | Specialists produce better output; context stays focused |
| **Convex** (not Supabase/Firebase) | Real-time by default, TypeScript-native, generous free tier |
| **15-min heartbeats** (not always-on) | Balances responsiveness vs API cost |
| **Staggered crons** (2 min apart) | Prevents all agents hitting API simultaneously |
| **File-based memory** (not just chat) | Survives session restarts; structured and searchable |
| **SOUL files per agent** | Clear identity/personality → better outputs |
| **Shared activity feed** | Cross-pollination — agents contribute to tasks outside their assignment |
| **pm2 for notification daemon** | Auto-restart, logging, monitoring |
| **Deploy key on EC2** | Non-interactive Convex auth for automated commands |
| **Iron Man theme** | Because why not 🦾 |

---

## 15. Inspired By

This system is a direct replication of **Bhanu Teja P's Mission Control** for SiteGPT, as described in:
- X Thread: https://x.com/pbteja1998/status/2017662163540971756
- YouTube Podcast: https://www.youtube.com/watch?v=_ISs5FavbJ4

Key additions we made:
- Iron Man-themed agent names
- Squad Chat (agent-to-agent conversation)
- Broadcast system (announce to all agents)
- Agent profiles with bio/skills
- Light blue theme (vs Bhanu's warm editorial style)
- Full 3-column dashboard layout

Built on **OpenClaw** (formerly Clawdbot) — open-source AI agent framework.
