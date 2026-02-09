#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  MISSION CONTROL — Workspace Setup Script
#  Run this on EC2 AFTER deploying files to /home/ubuntu/clawd/
#  Sets up per-agent memory dirs, updates OpenClaw config,
#  and wires everything together.
# ═══════════════════════════════════════════════════════════

set -e

CLAWD_DIR="/home/ubuntu/clawd"
OPENCLAW_DIR="/home/ubuntu/.openclaw"
OPENCLAW_CONFIG="$OPENCLAW_DIR/openclaw.json"

echo "═══════════════════════════════════════════════"
echo "  🏗️  MISSION CONTROL — Workspace Setup"
echo "═══════════════════════════════════════════════"
echo ""

# ─── Step 1: Create per-agent memory directories ────────
echo "📁 Creating per-agent memory directories..."

AGENTS=("jarvis" "friday" "edith" "hulkbuster" "vision" "banner" "rhodey" "pepper" "mark1" "karen")

for agent in "${AGENTS[@]}"; do
  mkdir -p "$CLAWD_DIR/memory/$agent"
  
  # Create WORKING.md if it doesn't exist
  if [ ! -f "$CLAWD_DIR/memory/$agent/WORKING.md" ]; then
    cat > "$CLAWD_DIR/memory/$agent/WORKING.md" << EOF
# WORKING.md — $(echo "$agent" | tr '[:lower:]' '[:upper:]')

## Current Task
None assigned yet.

## Status
Idle — waiting for first assignment.

## Next Steps
1. Wait for tasks to appear in Mission Control
2. Check for @mentions
EOF
  fi
  
  # Create MEMORY.md if it doesn't exist
  if [ ! -f "$CLAWD_DIR/memory/$agent/MEMORY.md" ]; then
    cat > "$CLAWD_DIR/memory/$agent/MEMORY.md" << EOF
# MEMORY.md — $(echo "$agent" | tr '[:lower:]' '[:upper:]') Long-Term Knowledge

## Key Decisions
(none yet)

## Lessons Learned
(none yet)

## Important Context
- I am part of the Stark Squad — see AGENTS.md for the full roster
- Mission Control is our shared Convex database
- Read my SOUL file at souls/$agent.md for my personality and role
EOF
  fi
  
  echo "  ✅ memory/$agent/ ready"
done

echo ""

# ─── Step 2: Copy JARVIS's SOUL as the main SOUL.md ─────
echo "🧠 Setting JARVIS as the default SOUL..."
if [ -f "$CLAWD_DIR/souls/jarvis.md" ]; then
  cp "$CLAWD_DIR/souls/jarvis.md" "$CLAWD_DIR/SOUL.md"
  echo "  ✅ SOUL.md → JARVIS"
else
  echo "  ⚠️  souls/jarvis.md not found — skipping"
fi

echo ""

# ─── Step 3: Update OpenClaw config ─────────────────────
echo "⚙️  Updating OpenClaw config..."

if [ -f "$OPENCLAW_CONFIG" ]; then
  # Backup current config
  cp "$OPENCLAW_CONFIG" "$OPENCLAW_CONFIG.bak.mission-control"
  echo "  📦 Backed up config to openclaw.json.bak.mission-control"
  
  # Check if node is available for JSON manipulation
  if command -v node &> /dev/null; then
    node -e "
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync('$OPENCLAW_CONFIG', 'utf8'));
      
      // Update workspace to our clawd directory
      config.agents.defaults.workspace = '$CLAWD_DIR';
      
      // Write back
      fs.writeFileSync('$OPENCLAW_CONFIG', JSON.stringify(config, null, 2));
      console.log('  ✅ Workspace updated to $CLAWD_DIR');
    "
  else
    echo "  ⚠️  Node not found — please manually update workspace in $OPENCLAW_CONFIG"
    echo "     Change: \"workspace\": \"/home/ubuntu/.openclaw/workspace\""
    echo "     To:     \"workspace\": \"$CLAWD_DIR\""
  fi
else
  echo "  ⚠️  OpenClaw config not found at $OPENCLAW_CONFIG"
fi

echo ""

# ─── Step 4: Copy key files to OpenClaw workspace too ───
echo "📋 Syncing key files to OpenClaw workspace..."
OPENCLAW_WORKSPACE="$OPENCLAW_DIR/workspace"

if [ -d "$OPENCLAW_WORKSPACE" ]; then
  # Copy our custom files to OpenClaw workspace as backup
  cp "$CLAWD_DIR/AGENTS.md" "$OPENCLAW_WORKSPACE/AGENTS.md" 2>/dev/null && echo "  ✅ AGENTS.md synced" || true
  cp "$CLAWD_DIR/HEARTBEAT.md" "$OPENCLAW_WORKSPACE/HEARTBEAT.md" 2>/dev/null && echo "  ✅ HEARTBEAT.md synced" || true
  cp "$CLAWD_DIR/SOUL.md" "$OPENCLAW_WORKSPACE/SOUL.md" 2>/dev/null && echo "  ✅ SOUL.md synced" || true
  
  # Create souls directory in OpenClaw workspace too
  mkdir -p "$OPENCLAW_WORKSPACE/souls"
  cp "$CLAWD_DIR/souls/"*.md "$OPENCLAW_WORKSPACE/souls/" 2>/dev/null && echo "  ✅ Soul files synced" || true
fi

echo ""

# ─── Step 5: Verify everything is in place ───────────────
echo "🔍 Verifying workspace..."
echo ""

ERRORS=0

# Check key files
for file in "AGENTS.md" "HEARTBEAT.md" "SOUL.md" ".env"; do
  if [ -f "$CLAWD_DIR/$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check soul files
for agent in "${AGENTS[@]}"; do
  if [ -f "$CLAWD_DIR/souls/$agent.md" ]; then
    echo "  ✅ souls/$agent.md"
  else
    echo "  ❌ souls/$agent.md MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check memory directories
for agent in "${AGENTS[@]}"; do
  if [ -d "$CLAWD_DIR/memory/$agent" ]; then
    echo "  ✅ memory/$agent/"
  else
    echo "  ❌ memory/$agent/ MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check scripts
for script in "notify-daemon.js" "setup-heartbeats.sh"; do
  if [ -f "$CLAWD_DIR/scripts/$script" ]; then
    echo "  ✅ scripts/$script"
  else
    echo "  ❌ scripts/$script MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# Check notification daemon
if command -v pm2 &> /dev/null; then
  PM2_STATUS=$(pm2 jlist 2>/dev/null | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      try{const p=JSON.parse(d);const nd=p.find(x=>x.name==='notification-daemon');
      console.log(nd?nd.pm2_env.status:'not found')}catch(e){console.log('error')}
    })
  " 2>/dev/null || echo "error")
  
  if [ "$PM2_STATUS" = "online" ]; then
    echo "  ✅ Notification daemon: ONLINE"
  else
    echo "  ⚠️  Notification daemon: $PM2_STATUS"
  fi
fi

echo ""
echo "═══════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
  echo "  🎯 WORKSPACE SETUP COMPLETE — 0 errors!"
  echo ""
  echo "  Next steps:"
  echo "  1. Restart the OpenClaw gateway:"
  echo "     openclaw gateway stop && openclaw gateway start"
  echo "  2. Test by sending a message to JARVIS via Telegram"
  echo "  3. Create your first task in Mission Control!"
else
  echo "  ⚠️  Setup complete with $ERRORS issue(s)"
  echo "  Please check the errors above."
fi
echo "═══════════════════════════════════════════════"
