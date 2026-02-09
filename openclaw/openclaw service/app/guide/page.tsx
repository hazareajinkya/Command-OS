import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#060810] text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          ← Back to Home
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-white">
          OpenClaw Self-Hosted Setup Guide
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Complete technical documentation for deploying OpenClaw on your own infrastructure.
          Estimated time: 4-8 hours for experienced engineers.
        </p>

        {/* Warning */}
        <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">
            ⚠️ <strong>Warning:</strong> This setup requires advanced knowledge of Linux system administration, 
            networking, Docker, reverse proxies, SSL certificates, and debugging. Proceed only if you&apos;re 
            comfortable with terminal commands and server management. If anything goes wrong, you may need to 
            start over from scratch.
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm text-yellow-200">
            💡 <strong>Skip the hassle:</strong>{" "}
            <Link href="/#pricing" className="underline text-[#ff6b6b] font-semibold">
              Let us handle all of this for just $99
            </Link>
            . We&apos;ll have you up and running in under 2 hours with zero technical work on your end.
          </p>
        </div>

        {/* Prerequisites */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">Prerequisites</h2>
          <p className="mt-2 text-sm text-slate-500">All items are required. Missing any will cause failures.</p>
          <ul className="mt-4 space-y-3 text-slate-300 text-sm">
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Node.js ≥ 22.0.0 (not 20.x, not 18.x - must be exactly 22+)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>pnpm 8.15.0+ (npm and yarn will NOT work due to workspace dependencies)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Ubuntu 22.04 LTS or Debian 12 (other distros may have compatibility issues)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Minimum 4GB RAM, 2 vCPUs (will crash on smaller instances)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Root or sudo access to the server</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Domain name with DNS access (required for SSL/WSS)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Anthropic API key with sufficient credits ($20+ recommended)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Cloudflare account (for DDoS protection and SSL termination)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Redis 7.0+ (for session management and rate limiting)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>PostgreSQL 15+ (for persistent storage)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Docker 24.0+ and Docker Compose v2</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>nginx 1.24+ or Caddy 2.7+ (for reverse proxy)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>certbot (for Let&apos;s Encrypt SSL certificates)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>Python 3.11+ with pip (for build dependencies)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#ff6b6b]">•</span>
              <span>build-essential, g++, make (for native module compilation)</span>
            </li>
          </ul>
        </section>

        {/* Step 1 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 1: System Preparation & Dependencies
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            First, update your system and install all required dependencies. This may take 15-30 minutes.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Update system packages
sudo apt update && sudo apt upgrade -y

# Install build dependencies
sudo apt install -y build-essential g++ make python3 python3-pip \\
  libssl-dev libffi-dev python3-dev cargo pkg-config \\
  libsqlite3-dev libreadline-dev libbz2-dev libncurses5-dev \\
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \\
  liblzma-dev libgdbm-dev libnss3-dev libgdbm-compat-dev

# Install Node.js 22 via nvm (DO NOT use apt nodejs)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22

# Verify Node version (must show v22.x.x)
node --version

# Install pnpm globally
npm install -g pnpm@latest

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install docker-compose-plugin

# Install Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql -c "CREATE USER openclaw WITH PASSWORD 'your_secure_password_here';"
sudo -u postgres psql -c "CREATE DATABASE openclaw_db OWNER openclaw;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE openclaw_db TO openclaw;"

# Install nginx
sudo apt install nginx -y
sudo systemctl enable nginx

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y`}</pre>
          </div>
        </section>

        {/* Step 2 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 2: Clone & Configure Repository
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Clone the repository and set up the complex configuration files.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Clone the repository
git clone https://github.com/anthropics/claude-code.git /opt/openclaw
cd /opt/openclaw

# IMPORTANT: Checkout the correct branch
git checkout stable-v2.3.1

# Install dependencies (this may take 10-15 minutes)
pnpm install --frozen-lockfile

# If you get ERESOLVE errors, try:
pnpm install --frozen-lockfile --legacy-peer-deps

# Build native modules
pnpm rebuild

# Copy environment template
cp .env.example .env
cp config/default.example.yml config/default.yml
cp config/production.example.yml config/production.yml`}</pre>
          </div>
        </section>

        {/* Step 3 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 3: Environment Configuration
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Configure all required environment variables. Missing or incorrect values will cause silent failures.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Edit the .env file
nano .env

# Required environment variables (ALL must be set):
NODE_ENV=production
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-opus-20240229
ANTHROPIC_MAX_TOKENS=4096

# Database configuration
DATABASE_URL=postgresql://openclaw:your_secure_password_here@localhost:5432/openclaw_db
DATABASE_POOL_SIZE=10
DATABASE_SSL=false

# Redis configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_TLS=false

# Server configuration
HOST=0.0.0.0
PORT=3000
WSS_PORT=18789
WSS_PATH=/ws
TRUST_PROXY=true

# Security settings
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -base64 32)
COOKIE_SECURE=true
CORS_ORIGIN=https://yourdomain.com

# Sandbox configuration
SANDBOX_MODE=non-main
SANDBOX_TIMEOUT=30000
SANDBOX_MEMORY_LIMIT=512mb
SANDBOX_CPU_LIMIT=1

# Rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/var/log/openclaw/app.log

# OAuth2 (for messenger integrations)
OAUTH2_CLIENT_ID=
OAUTH2_CLIENT_SECRET=
OAUTH2_CALLBACK_URL=https://yourdomain.com/auth/callback

# Telegram (if using)
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/webhook/telegram

# WhatsApp (if using)  
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=`}</pre>
          </div>
        </section>

        {/* Step 4 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 4: Database Migration & Initialization
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Run database migrations and seed initial data.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# If migrations fail, reset and try again:
pnpm prisma migrate reset --force

# Seed initial data
pnpm prisma db seed

# Verify database connection
pnpm prisma db pull`}</pre>
          </div>
        </section>

        {/* Step 5 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 5: OAuth2 & Messenger Setup
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Initialize OAuth2 credentials and configure messenger integrations.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Generate OAuth2 credentials
pnpm run oauth:generate

# This creates oauth.json - NEVER commit this file
# Add to .gitignore if not already present
echo "oauth.json" >> .gitignore

# Initialize Telegram bot (if using)
pnpm run telegram:init
# Follow the prompts to:
# 1. Create bot via @BotFather
# 2. Get bot token
# 3. Set webhook URL
# 4. Configure commands

# Initialize WhatsApp (if using)
pnpm run whatsapp:init
# This requires:
# 1. Meta Business account
# 2. WhatsApp Business API access
# 3. Phone number verification
# 4. Webhook configuration

# Verify OAuth configuration
pnpm run oauth:verify`}</pre>
          </div>
        </section>

        {/* Step 6 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 6: SSL Certificate & Nginx Configuration
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Set up SSL certificates and configure nginx as a reverse proxy with WebSocket support.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Obtain SSL certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Create nginx configuration
sudo nano /etc/nginx/sites-available/openclaw

# Add the following configuration:
upstream openclaw_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream openclaw_wss {
    server 127.0.0.1:18789;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://openclaw_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    location /ws {
        proxy_pass http://openclaw_wss;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    location /webhook {
        proxy_pass http://openclaw_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx`}</pre>
          </div>
        </section>

        {/* Step 7 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 7: Systemd Service Configuration
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Create systemd services for automatic startup and process management.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Create log directory
sudo mkdir -p /var/log/openclaw
sudo chown $USER:$USER /var/log/openclaw

# Create main service file
sudo nano /etc/systemd/system/openclaw.service

[Unit]
Description=OpenClaw AI Assistant - Main Process
Documentation=https://github.com/anthropics/claude-code
After=network.target postgresql.service redis.service
Requires=postgresql.service redis.service

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/openclaw
Environment=NODE_ENV=production
Environment=PATH=/root/.nvm/versions/node/v22.0.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStartPre=/bin/sleep 5
ExecStart=/root/.nvm/versions/node/v22.0.0/bin/pnpm start
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
StandardOutput=append:/var/log/openclaw/app.log
StandardError=append:/var/log/openclaw/error.log
SyslogIdentifier=openclaw
LimitNOFILE=65535
LimitNPROC=65535

[Install]
WantedBy=multi-user.target

# Create WSS service file
sudo nano /etc/systemd/system/openclaw-wss.service

[Unit]
Description=OpenClaw AI Assistant - WebSocket Server
Documentation=https://github.com/anthropics/claude-code
After=network.target openclaw.service
Requires=openclaw.service

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/openclaw
Environment=NODE_ENV=production
Environment=PATH=/root/.nvm/versions/node/v22.0.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStartPre=/bin/sleep 10
ExecStart=/root/.nvm/versions/node/v22.0.0/bin/pnpm run wss:start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/openclaw/wss.log
StandardError=append:/var/log/openclaw/wss-error.log
SyslogIdentifier=openclaw-wss

[Install]
WantedBy=multi-user.target

# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable openclaw
sudo systemctl enable openclaw-wss

# Start services
sudo systemctl start openclaw
sudo systemctl start openclaw-wss

# Check status
sudo systemctl status openclaw
sudo systemctl status openclaw-wss

# View logs
sudo journalctl -u openclaw -f
sudo journalctl -u openclaw-wss -f`}</pre>
          </div>
        </section>

        {/* Step 8 */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">
            Step 8: Firewall & Security Hardening
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Configure firewall rules and security settings.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0c14] border border-white/10 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Configure fail2ban
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Add OpenClaw jail:
[openclaw]
enabled = true
port = http,https
filter = openclaw
logpath = /var/log/openclaw/app.log
maxretry = 5
bantime = 3600

# Create fail2ban filter
sudo nano /etc/fail2ban/filter.d/openclaw.conf

[Definition]
failregex = ^.*Failed login attempt from <HOST>.*$
            ^.*Rate limit exceeded from <HOST>.*$
ignoreregex =

# Restart fail2ban
sudo systemctl restart fail2ban

# Set up log rotation
sudo nano /etc/logrotate.d/openclaw

/var/log/openclaw/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        systemctl reload openclaw >/dev/null 2>&1 || true
    endscript
}`}</pre>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">Troubleshooting Common Issues</h2>
          <p className="mt-2 text-sm text-slate-500">These are the most common issues you&apos;ll encounter. Some may require starting over.</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">EBADF: Bad File Descriptor</h3>
              <p className="mt-2 text-sm text-slate-400">
                Usually caused by Node.js version mismatch or corrupted node_modules. Solution: 
                <code className="bg-white/10 px-1 rounded mx-1">rm -rf node_modules pnpm-lock.yaml && pnpm install</code>
                If persists, reinstall Node.js 22 from scratch.
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">PTY Spawn Failures / ENOENT</h3>
              <p className="mt-2 text-sm text-slate-400">
                Missing native dependencies. Run: 
                <code className="bg-white/10 px-1 rounded mx-1">sudo apt install python3 make g++ libsecret-1-dev</code>
                then <code className="bg-white/10 px-1 rounded mx-1">pnpm rebuild</code>
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">WebSocket Connection Refused</h3>
              <p className="mt-2 text-sm text-slate-400">
                Check if WSS service is running: <code className="bg-white/10 px-1 rounded mx-1">sudo systemctl status openclaw-wss</code>. 
                Verify nginx WebSocket configuration and ensure port 18789 is not blocked.
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">Database Connection Errors</h3>
              <p className="mt-2 text-sm text-slate-400">
                Verify PostgreSQL is running and credentials are correct. Check 
                <code className="bg-white/10 px-1 rounded mx-1">pg_hba.conf</code> for authentication settings.
                Run <code className="bg-white/10 px-1 rounded mx-1">sudo -u postgres psql -c &quot;\\l&quot;</code> to list databases.
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">SSL Certificate Errors</h3>
              <p className="mt-2 text-sm text-slate-400">
                Ensure DNS is properly configured and propagated. Run 
                <code className="bg-white/10 px-1 rounded mx-1">sudo certbot renew --dry-run</code> to test renewal.
                Check nginx logs: <code className="bg-white/10 px-1 rounded mx-1">sudo tail -f /var/log/nginx/error.log</code>
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">Memory/CPU Exhaustion</h3>
              <p className="mt-2 text-sm text-slate-400">
                OpenClaw requires minimum 4GB RAM. Check usage with <code className="bg-white/10 px-1 rounded mx-1">htop</code>.
                Consider upgrading your VPS or reducing SANDBOX_MEMORY_LIMIT in .env.
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">Prisma Migration Failures</h3>
              <p className="mt-2 text-sm text-slate-400">
                Often caused by schema drift. Try: 
                <code className="bg-white/10 px-1 rounded mx-1">pnpm prisma migrate reset --force</code>
                Warning: This will delete all data.
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0c14] border border-white/10 p-4">
              <h3 className="font-semibold text-white">OAuth2 Token Expired</h3>
              <p className="mt-2 text-sm text-slate-400">
                Regenerate tokens: <code className="bg-white/10 px-1 rounded mx-1">pnpm run oauth:refresh</code>.
                If that fails, delete oauth.json and run <code className="bg-white/10 px-1 rounded mx-1">pnpm run oauth:generate</code> again.
              </p>
            </div>
          </div>
        </section>

        {/* Maintenance */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">Ongoing Maintenance</h2>
          <p className="mt-2 text-sm text-slate-500">Required tasks to keep your instance running smoothly.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• Monitor logs daily for errors</li>
            <li>• Renew SSL certificates every 90 days (or set up auto-renewal)</li>
            <li>• Update dependencies monthly (may break things)</li>
            <li>• Backup database weekly</li>
            <li>• Monitor API usage and costs</li>
            <li>• Apply security patches promptly</li>
            <li>• Monitor disk space (logs can fill up quickly)</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/5 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">
            This looks like a lot of work...
          </h2>
          <p className="mt-3 text-slate-400">
            Because it is. Skip the 4-8 hours of setup, debugging, and maintenance headaches.
            We&apos;ll handle everything and have you running in under 2 hours.
          </p>
          <Link
            href="/#pricing"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-8 py-3 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(255,107,107,0.35)] transition hover:translate-y-[-1px]"
          >
            Let Us Set It Up for $99 →
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            No technical knowledge required. Just send us your API key and we handle the rest.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
          <p>© 2024 AICE OpenClaw. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
