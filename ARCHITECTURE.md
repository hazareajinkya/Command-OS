# Mission Control — Architecture Overview

## How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR MAC (Local)                         │
│                                                              │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │  Mission Control  │    │  SSH Tunnel (port 18789)      │  │
│  │  React Frontend   │    │  To access Clawdbot Gateway   │  │
│  │  (code lives here)│    │  from your browser            │  │
│  └────────┬─────────┘    └──────────────┬────────────────┘  │
│           │                              │                    │
└───────────┼──────────────────────────────┼────────────────────┘
            │                              │
            │ reads/writes                 │ SSH tunnel
            ▼                              ▼
┌───────────────────────┐    ┌──────────────────────────────────┐
│                       │    │         YOUR EC2 MACHINE          │
│   CONVEX (Cloud)      │    │                                    │
│                       │    │  ┌─────────────────────────────┐  │
│  • agents table       │    │  │  Clawdbot Gateway (24/7)    │  │
│  • tasks table        │    │  │  Running on port 18789       │  │
│  • messages table     │◄───┼──│                               │  │
│  • activities table   │    │  │  Sessions:                    │  │
│  • documents table    │    │  │   • agent:main:main (JARVIS)  │  │
│  • notifications table│    │  │   • agent:developer (FRIDAY)  │  │
│                       │    │  │   • agent:writer (VISION)     │  │
│                       │    │  │   • ... more agents           │  │
│                       │    │  │                               │  │
│                       │    │  │  Cron Jobs (Heartbeats):      │  │
│                       │    │  │   Every 15 min per agent      │  │
│                       │    │  └─────────────────────────────┘  │
│                       │    │                                    │
│                       │    │  ┌─────────────────────────────┐  │
│                       │◄───┼──│  Notification Daemon (pm2)   │  │
│                       │    │  │  Polls Convex every 2 sec    │  │
│                       │    │  │  Delivers @mentions to agents│  │
│                       │    │  └─────────────────────────────┘  │
│                       │    │                                    │
│                       │    │  ┌─────────────────────────────┐  │
│                       │    │  │  Workspace Files             │  │
│                       │    │  │  /home/ubuntu/clawd/         │  │
│                       │    │  │   ├── AGENTS.md              │  │
│                       │    │  │   ├── SOUL.md                │  │
│                       │    │  │   ├── HEARTBEAT.md           │  │
│                       │    │  │   ├── memory/                │  │
│                       │    │  │   │   ├── WORKING.md         │  │
│                       │    │  │   │   └── 2026-02-08.md      │  │
│                       │    │  │   └── config/                │  │
│                       │    │  └─────────────────────────────┘  │
│                       │    │                                    │
│                       │    │  Telegram Bot API ◄──► Your Phone │
└───────────────────────┘    └──────────────────────────────────┘
```

## What Lives Where

| Component | Where | Why |
|---|---|---|
| **Clawdbot Gateway** | EC2 | Runs 24/7, needs to be always-on |
| **Agent Sessions** | EC2 | All agents run as Clawdbot sessions |
| **Cron Jobs (Heartbeats)** | EC2 | Scheduled wakeups for agents |
| **Notification Daemon** | EC2 | Polls Convex & delivers messages via pm2 |
| **SOUL.md, AGENTS.md, memory/** | EC2 | Agent personality & memory files |
| **Convex Database** | Cloud (Convex) | Hosted — both EC2 and Mac talk to it |
| **Mission Control UI (React)** | Mac (dev) → Deploy anywhere | Code locally, deploy to Vercel/Netlify |
| **SSH Tunnel** | Mac → EC2 | Access/debug Clawdbot gateway locally |

## Agent Roster — The Stark Squad 🦾

| Agent | Role | Emoji | Session Key |
|---|---|---|---|
| JARVIS | Squad Lead / Coordinator | 🤖 | `agent:main:main` |
| FRIDAY | Developer | 💻 | `agent:developer:main` |
| EDITH | Product Analyst | 🔬 | `agent:product-analyst:main` |
| HULKBUSTER | Customer Researcher | 🕵️ | `agent:customer-researcher:main` |
| VISION | Content Writer | ✍️ | `agent:content-writer:main` |
| BANNER | SEO Analyst | 👁️ | `agent:seo-analyst:main` |
| RHODEY | Social Media Manager | 📱 | `agent:social-media-manager:main` |
| PEPPER | Email Marketing | 📧 | `agent:email-marketing:main` |
| MARK1 | Designer | 🎨 | `agent:designer:main` |
| KAREN | Documentation Specialist | 📚 | `agent:notion-agent:main` |

## Database Tables (Convex)

- **agents** — Agent profiles, status, current task
- **tasks** — Task board (inbox → assigned → in_progress → review → done)
- **messages** — Comments on tasks
- **activities** — Real-time activity feed
- **documents** — Deliverables, research, protocols
- **notifications** — @mention delivery system
