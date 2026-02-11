# Command OS — Dashboard

The real-time dashboard for Command OS. Built with Next.js + Convex.

**Live:** [mission-control-amber-phi.vercel.app](https://mission-control-amber-phi.vercel.app)

## Setup

```bash
npm install
npx convex dev     # Syncs schema + starts Convex
npm run dev        # Starts Next.js on localhost:3001
```

## Environment Variables

Create `.env.local`:
```
CONVEX_DEPLOYMENT=dev:glorious-pika-395
NEXT_PUBLIC_CONVEX_URL=https://glorious-pika-395.convex.cloud
```

## Deploy to Vercel

```bash
vercel --prod
```

Make sure `NEXT_PUBLIC_CONVEX_URL` is set in Vercel environment variables.

## Stack

- **Next.js 16** + React 19
- **Convex** — real-time database with subscriptions
- **Tailwind CSS 4** — styling
- **Vercel** — hosting

## Components

| Component | Description |
|---|---|
| `AgentSidebar` | Left panel — agent list with status indicators |
| `TaskBoard` | Center — 6-column Kanban board |
| `TaskDetail` | Task modal with comments + expandable deliverables |
| `LiveFeed` | Real-time activity feed with filters |
| `SquadChat` | Embedded chat tab (also works as modal) |
| `AgentProfile` | Agent details, skills, timeline |
| `BroadcastModal` | Send announcement to all agents |
| `DocsPanel` | Browse deliverables, research, notes |
| `CreateTask` | New task form with priority + tags |

## Convex Functions

See `convex/` directory. Key modules: `agents`, `tasks`, `messages`, `chat`, `broadcasts`, `activities`, `documents`, `notifications`.

Schema defined in `convex/schema.ts` (8 tables).
