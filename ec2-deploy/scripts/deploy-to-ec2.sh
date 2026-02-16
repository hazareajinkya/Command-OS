#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  MISSION CONTROL — Deploy to EC2 Script
#  Run this from your Mac to upload all agent files to EC2.
# ═══════════════════════════════════════════════════════════

EC2_KEY="$HOME/Downloads/Test.pem"
EC2_HOST="ubuntu@18.234.128.216"
REMOTE_DIR="/home/ubuntu/clawd"

echo "🚀 Deploying Mission Control files to EC2..."
echo "   Target: $EC2_HOST:$REMOTE_DIR"
echo ""

# Create remote directories
echo "📁 Creating directories on EC2..."
ssh -i "$EC2_KEY" "$EC2_HOST" "mkdir -p $REMOTE_DIR/souls $REMOTE_DIR/memory $REMOTE_DIR/scripts"

# Upload SOUL files
echo "🦸 Uploading SOUL files..."
scp -i "$EC2_KEY" ./souls/*.md "$EC2_HOST:$REMOTE_DIR/souls/"

# Upload operating manuals
echo "📋 Uploading AGENTS.md and HEARTBEAT.md..."
scp -i "$EC2_KEY" ./AGENTS.md "$EC2_HOST:$REMOTE_DIR/"
scp -i "$EC2_KEY" ./HEARTBEAT.md "$EC2_HOST:$REMOTE_DIR/"

# Upload memory files
echo "🧠 Uploading memory files..."
scp -i "$EC2_KEY" ./memory/*.md "$EC2_HOST:$REMOTE_DIR/memory/"

# Upload scripts
echo "⚙️  Uploading scripts..."
scp -i "$EC2_KEY" ./scripts/notify-daemon.js "$EC2_HOST:$REMOTE_DIR/scripts/"
scp -i "$EC2_KEY" ./scripts/setup-heartbeats.sh "$EC2_HOST:$REMOTE_DIR/scripts/"
scp -i "$EC2_KEY" ./scripts/heartbeat-wrapper.sh "$EC2_HOST:$REMOTE_DIR/scripts/"
scp -i "$EC2_KEY" ./scripts/check-paused.js "$EC2_HOST:$REMOTE_DIR/scripts/"

# Make scripts executable
ssh -i "$EC2_KEY" "$EC2_HOST" "chmod +x $REMOTE_DIR/scripts/*.sh"

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ All files deployed to EC2!"
echo ""
echo "  Next steps (run on EC2 via SSH):"
echo "    1. cd $REMOTE_DIR"
echo "    2. bash scripts/setup-heartbeats.sh"
echo "    3. Install convex on EC2: npm install convex"
echo "    4. Start notification daemon:"
echo "       CONVEX_URL='your-convex-url' pm2 start scripts/notify-daemon.js"
echo "═══════════════════════════════════════════════"
