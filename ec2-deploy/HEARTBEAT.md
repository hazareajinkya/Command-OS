# HEARTBEAT.md — What To Do On Every Wakeup

> This checklist runs every 15 minutes when your heartbeat cron fires.
> Follow it strictly. If there's nothing to do, report HEARTBEAT_OK and go back to sleep.

## Step 0 — Know Yourself
- [ ] Read your SOUL file at `souls/<YOUR_NAME_LOWERCASE>.md` (e.g., `souls/jarvis.md`)
- [ ] Read `AGENTS.md` to understand the squad and how Mission Control works
- [ ] Your memory lives at `memory/<YOUR_NAME_LOWERCASE>/WORKING.md`

## Step 1 — Load Context
- [ ] Read `memory/<YOUR_NAME_LOWERCASE>/WORKING.md` for your ongoing tasks
- [ ] If task in progress, resume it
- [ ] Read today's daily notes at `memory/<YOUR_NAME_LOWERCASE>/YYYY-MM-DD.md` if they exist
- [ ] Search session memory if context is unclear

## Step 2 — Check for Urgent Items
- [ ] **Check Commander DMs** — the human operator may have messaged you directly:
  ```bash
  cd /home/ubuntu/clawd && npx convex run directMessages:getUndeliveredForAgent '{"agentId": "YOUR_AGENT_ID"}'
  ```
  If there are messages, **respond to each one** via:
  ```bash
  cd /home/ubuntu/clawd && npx convex run directMessages:sendFromAgent '{"agentId": "YOUR_AGENT_ID", "content": "Your reply", "messageType": "text"}'
  ```
  Use `"messageType": "task_suggestion"` if you're proposing a task to work on.
- [ ] Check Mission Control for @mentions directed at you:
  ```bash
  cd /home/ubuntu/clawd && npx convex run notifications:getUndeliveredForAgent '{"agentId": "YOUR_AGENT_ID"}'
  ```
- [ ] Check for tasks assigned to you that need action:
  ```bash
  cd /home/ubuntu/clawd && npx convex run tasks:getByAgent '{"agentId": "YOUR_AGENT_ID"}'
  ```
- [ ] Check for tasks in "blocked" status that you can help unblock

## Step 3 — Scan Activity Feed & Squad Chat
- [ ] Review recent activity — any discussions relevant to your expertise?
  ```bash
  cd /home/ubuntu/clawd && npx convex run activities:list '{}'
  ```
- [ ] Check Squad Chat for team discussions you can contribute to:
  ```bash
  cd /home/ubuntu/clawd && npx convex run chat:list '{"limit": 15}'
  ```
- [ ] Check recent broadcasts for squad-wide announcements:
  ```bash
  cd /home/ubuntu/clawd && npx convex run broadcasts:list '{"limit": 3}'
  ```
- [ ] Any decisions that affect your current work?
- [ ] Any new tasks in your domain that you should volunteer for?

## Step 4 — Take Action or Stand Down
- [ ] **If there's work to do:** Do it. Update task status. Post progress to the task thread.
- [ ] **If you discover something interesting:** Share it in Squad Chat (not tied to a task? use chat. Tied to a task? comment on the task).
- [ ] **If nothing:** Report `HEARTBEAT_OK` and go back to sleep.

## Step 5 — Before Sleeping
- [ ] Update `memory/<YOUR_NAME_LOWERCASE>/WORKING.md` with current state
- [ ] Add any significant events to `memory/<YOUR_NAME_LOWERCASE>/YYYY-MM-DD.md`
- [ ] If you completed a task, move it to "review" status
- [ ] Log your heartbeat:
  ```bash
  cd /home/ubuntu/clawd && npx convex run activities:create '{"type": "heartbeat", "agentId": "YOUR_AGENT_ID", "message": "HEARTBEAT_OK"}'
  ```

## Report Format
If nothing to do:
```
HEARTBEAT_OK — No pending tasks or mentions. Standing by.
```

If work was done:
```
HEARTBEAT_ACTIVE — [Brief description of what you did]
Updated: [task name] → [new status]
```
