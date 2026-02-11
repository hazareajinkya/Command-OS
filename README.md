# Command OS

**AI Agent Squad System** — 10 autonomous AI agents working as a coordinated team, managed through a real-time dashboard.

> Built by [Ajinkya](https://aice.services) | Powered by [OpenClaw](https://openclaw.ai) + [Convex](https://convex.dev) + [Next.js](https://nextjs.org)

**Live Dashboard:** [mission-control-amber-phi.vercel.app](https://mission-control-amber-phi.vercel.app)

---

## What Is This?

Instead of one overloaded AI assistant, Command OS runs **10 specialist agents** — each with their own personality, memory, scheduled wakeups, and domain expertise. They share a real-time database (Convex) and a React dashboard to coordinate work like a real team.

Think of it as: **AI agents working like a real team in an office, with a shared project management board.**

Inspired by [Bhanu Teja P's Mission Control](https://x.com/pbteja1998/status/2017662163540971756) for SiteGPT.

---

## The Stark Squad — Agent Roster

| Agent | Role | Level | Emoji |
|---|---|---|---|
| **JARVIS** | Squad Lead / Coordinator | Lead | 🤖 |
| **FRIDAY** | Developer | Specialist | 💻 |
| **EDITH** | Product Analyst | Specialist | 🔬 |
| **HULKBUSTER** | Customer Researcher | Specialist | 🕵️ |
| **VISION** | Content Writer | Specialist | ✍️ |
| **BANNER** | SEO Analyst | Specialist | 👁️ |
| **RHODEY** | Social Media Manager | Specialist | 📱 |
| **PEPPER** | Email Marketing | Specialist | 📧 |
| **MARK1** | Designer | Specialist | 🎨 |
| **KAREN** | Documentation Specialist | Specialist | 📚 |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    YOUR MAC (Local Dev)                        │
│                                                                │
│  ┌────────────────────┐    ┌─────────────────────────────┐    │
│  │  Command OS UI      │    │  SSH Tunnel (port 18789)    │    │
│  │  Next.js + React    │    │  Mac <-> EC2 Gateway        │    │
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
│  - agents (10)          │   │  OpenClaw Gateway (24/7)          │
│  - tasks                │   │  - 10 agent sessions               │
│  - messages (comments)  │<--│  - Cron heartbeats (15 min)       │
│  - chatMessages         │   │                                    │
│  - broadcasts           │   │  Notification Daemon (pm2)        │
│  - activities (feed)    │   │  - Polls every 2 sec               │
│  - documents            │   │  - Delivers @mentions              │
│  - notifications        │   │                                    │
│                         │   │  Telegram Bot <-> Ajinkya's phone  │
└─────────────────────────┘   └──────────────────────────────────┘
```

### What Lives Where

| Component | Location | Purpose |
|---|---|---|
| **Command OS UI** | Vercel (prod) / Mac (dev) | Next.js dashboard — tasks, agents, chat, activity |
| **Convex Database** | Cloud | Shared real-time database for all coordination |
| **OpenClaw Gateway** | EC2 | Runs 24/7, manages all 10 agent sessions |
| **Agent Sessions** | EC2 | Each agent is a persistent OpenClaw session |
| **Heartbeat Crons** | EC2 | Wake agents every 15 min (staggered) |
| **Notification Daemon** | EC2 (pm2) | Polls Convex, delivers @mentions to agent sessions |
| **SOUL/Memory Files** | EC2 | Agent personalities and persistent memory |
| **Telegram Bot** | EC2 | JARVIS is the primary interface via Telegram |

---

## Project Structure

```
Command-OS/
├── mission-control/              # Next.js Dashboard (deployed to Vercel)
│   ├── convex/                   # Convex backend functions
│   │   ├── schema.ts             # Database schema (8 tables)
│   │   ├── agents.ts             # Agent CRUD + stats
│   │   ├── tasks.ts              # Task management + Kanban
│   │   ├── messages.ts           # Task comments + @mentions
│   │   ├── chat.ts               # Squad Chat
│   │   ├── broadcasts.ts         # Squad Announcements
│   │   ├── activities.ts         # Activity feed
│   │   ├── documents.ts          # Deliverables & research
│   │   └── notifications.ts      # @mention delivery system
│   └── src/
│       ├── app/page.tsx           # Main 3-column dashboard
│       └── components/
│           ├── AgentSidebar.tsx   # Left: agent list with status
│           ├── TaskBoard.tsx      # Center: 6-column Kanban
│           ├── TaskDetail.tsx     # Task modal with docs + comments
│           ├── LiveFeed.tsx       # Real-time activity feed
│           ├── SquadChat.tsx      # Agent-to-agent chat (inline tab)
│           ├── AgentProfile.tsx   # Agent details + skills
│           ├── BroadcastModal.tsx # Announce to all agents
│           └── DocsPanel.tsx      # Browse all deliverables
│
├── ec2-deploy/                    # Files deployed to EC2
│   ├── souls/                     # 10 SOUL files (agent personalities)
│   │   ├── jarvis.md              # Squad Lead — coordinator
│   │   ├── friday.md              # Developer
│   │   ├── edith.md               # Product Analyst
│   │   ├── hulkbuster.md          # Customer Researcher
│   │   ├── vision.md              # Content Writer
│   │   ├── banner.md              # SEO Analyst
│   │   ├── rhodey.md              # Social Media Manager
│   │   ├── pepper.md              # Email Marketing
│   │   ├── mark1.md               # Designer
│   │   └── karen.md               # Documentation Specialist
│   ├── memory/                    # Agent memory system
│   │   ├── MEMORY.md              # Long-term knowledge
│   │   └── WORKING.md             # Current task state
│   ├── scripts/
│   │   ├── deploy-to-ec2.sh       # SCP files from Mac to EC2
│   │   ├── notify-daemon.js       # Notification daemon (pm2)
│   │   ├── setup-heartbeats.sh    # Register cron jobs
│   │   └── setup-workspace.sh     # Initial workspace setup
│   ├── AGENTS.md                  # Operating manual for all agents
│   └── HEARTBEAT.md               # Wakeup checklist (runs every 15 min)
│
├── ARCHITECTURE.md                # System architecture overview
└── CONTEXT.md                     # Full project context document
```

---

## Dashboard Features

| Feature | Description |
|---|---|
| **Agent Sidebar** | All 10 agents with live status indicators |
| **Task Board** | 6-column Kanban (Inbox → Assigned → In Progress → Review → Done → Blocked) |
| **Task Detail** | Full task view with comments, expandable deliverables |
| **Live Feed** | Real-time activity with type/agent filters |
| **Squad Chat** | Always-visible agent-to-agent chat (embedded tab) |
| **Broadcasts** | Send announcement to all agents |
| **Docs Panel** | Browse deliverables, research, and notes |
| **Agent Profiles** | Bio, skills, assigned tasks, activity timeline |

---

## EC2 Infrastructure

### Connection
```bash
ssh -i ~/Downloads/Test.pem ubuntu@18.234.128.216
```

### Key Paths on EC2
```
/home/ubuntu/clawd/                 # Main workspace
├── AGENTS.md                       # Squad operating manual
├── HEARTBEAT.md                    # Heartbeat checklist
├── souls/                          # 10 SOUL files
├── memory/                         # Per-agent memory (10 dirs)
│   └── <agent>/
│       ├── WORKING.md              # Current task state
│       ├── MEMORY.md               # Long-term knowledge
│       └── YYYY-MM-DD.md           # Daily notes
├── scripts/                        # Utilities
└── .env                            # CONVEX_DEPLOYMENT, CONVEX_DEPLOY_KEY
```

### Running Services on EC2
| Service | Manager | Status Command |
|---|---|---|
| OpenClaw Gateway | systemd | `openclaw gateway status` |
| Notification Daemon | pm2 | `pm2 status` |
| Heartbeat Crons | OpenClaw | `openclaw cron list` |

### OpenClaw Config
```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "anthropic/claude-haiku-4-5" },
      "workspace": "/home/ubuntu/clawd",
      "maxConcurrent": 4
    }
  },
  "gateway": { "port": 18789 },
  "channels": { "telegram": { "enabled": true } }
}
```

### Heartbeat Schedule (Every 15 Min, Staggered)
```
:00 JARVIS     :07 VISION     :11 PEPPER
:02 FRIDAY     :08 BANNER     :12 MARK1
:04 EDITH      :10 RHODEY     :13 KAREN
:06 HULKBUSTER
```

---

## How Agents Work

### Communication Channels
| Method | Speed | When |
|---|---|---|
| `openclaw sessions send` | Instant | Urgent tasks, direct wake-up |
| @mentions (notification daemon) | ~2 seconds | Normal priority, task threads |
| Mission Control (heartbeat) | 15 min | Low priority, routine check-ins |

### Agent Lifecycle
1. **Heartbeat fires** (every 15 min, staggered)
2. Agent reads SOUL file, AGENTS.md, and memory files
3. Checks Mission Control for assigned tasks and @mentions
4. Scans activity feed for relevant discussions
5. Takes action or reports `HEARTBEAT_OK`
6. Updates memory files before sleeping

### Memory System
- **Working Memory** (`WORKING.md`) — current task state, updated every heartbeat
- **Daily Notes** (`YYYY-MM-DD.md`) — timestamped log of the day
- **Long-Term Memory** (`MEMORY.md`) — curated facts, decisions, lessons

---

## Quick Start

### Run the Dashboard Locally
```bash
cd mission-control
npm install
npx convex dev          # Start Convex (syncs schema)
npm run dev             # Start Next.js on localhost:3001
```

### Deploy Files to EC2
```bash
cd ec2-deploy
bash scripts/deploy-to-ec2.sh
```

### On EC2 (via SSH)
```bash
# Start gateway
openclaw gateway start

# Start notification daemon
CONVEX_URL='https://your-url.convex.cloud' pm2 start scripts/notify-daemon.js --name notification-daemon

# Register heartbeat crons
bash scripts/setup-heartbeats.sh
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Database** | Convex (real-time cloud) |
| **Agent Runtime** | OpenClaw (AI agent framework) |
| **Model** | Anthropic Claude Haiku 4.5 |
| **Deployment** | Vercel (dashboard), EC2 (agents) |
| **Process Manager** | pm2 (notification daemon) |
| **Communication** | Telegram Bot API |

---

## Environment Variables

### Local — `mission-control/.env.local`
```
CONVEX_DEPLOYMENT=dev:glorious-pika-395
NEXT_PUBLIC_CONVEX_URL=https://glorious-pika-395.convex.cloud
```

### EC2 — `/home/ubuntu/clawd/.env`
```
CONVEX_DEPLOYMENT=dev:glorious-pika-395
CONVEX_DEPLOY_KEY=<deploy-key>
CONVEX_URL=https://glorious-pika-395.convex.cloud
```

---

## Inspired By

This system is a direct replication and extension of **Bhanu Teja P's Mission Control** for SiteGPT:
- [X Thread](https://x.com/pbteja1998/status/2017662163540971756)
- [YouTube Podcast](https://www.youtube.com/watch?v=_ISs5FavbJ4)

**Key additions:** Iron Man-themed agents, Squad Chat, Broadcast system, Agent profiles with skills, embedded chat panel, expandable document viewer, live deployment on Vercel.

Built on **OpenClaw** — open-source AI agent framework.
