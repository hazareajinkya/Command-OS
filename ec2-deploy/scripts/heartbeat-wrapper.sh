#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  MISSION CONTROL — Heartbeat Wrapper
#  Checks Convex system:isPaused before waking an agent.
#  When paused: exits without sending (no OpenRouter usage).
#  When running: sends heartbeat message to agent session.
#
#  Usage: heartbeat-wrapper.sh <session_key> <message_file>
#  Example: heartbeat-wrapper.sh "agent:main:main" /path/to/jarvis.msg
# ═══════════════════════════════════════════════════════════

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SESSION_KEY="$1"
MSG_FILE="$2"

if [ -z "$SESSION_KEY" ] || [ -z "$MSG_FILE" ] || [ ! -f "$MSG_FILE" ]; then
  echo "Usage: heartbeat-wrapper.sh <session_key> <message_file>" >&2
  exit 1
fi

cd "$CLAWD_DIR"

# Load CONVEX_URL from .env if present
if [ -f "$CLAWD_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$CLAWD_DIR/.env"
  set +a
fi

# Check if squad is paused (exit 0 = paused, exit 1 = not paused)
if node "$SCRIPT_DIR/check-paused.js" 2>/dev/null; then
  exit 0
fi

# Not paused — send heartbeat to agent
MSG=$(cat "$MSG_FILE")
openclaw sessions send --session "$SESSION_KEY" --message "$MSG"
