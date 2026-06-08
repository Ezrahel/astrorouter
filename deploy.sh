#!/bin/bash
set -e

# Configuration
APP_DIR="/root/astroroute/tunnel"
CADDYFILE="/etc/caddy/Caddyfile"

REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
REDIS_TUNNEL_TTL_SECONDS="${REDIS_TUNNEL_TTL_SECONDS:-120}"
REDIS_HEARTBEAT_INTERVAL_MS="${REDIS_HEARTBEAT_INTERVAL_MS:-20000}"

TIMESCALE_URL="${TIMESCALE_URL}"

# Tunnel Server Config
BLUE_PORT=3547
GREEN_PORT=3548
BLUE_NAME="astroroute-blue"
GREEN_NAME="astroroute-green"

# Run Tiger Data (TimescaleDB) migrations
echo "🐯 Running Tiger Data migrations..."
cd /root/astroroute
if [ -n "$TIMESCALE_URL" ]; then
  # Run migration files (not the full setup script which drops tables)
  for migration in deploy/migrations/*.sql; do
    if [ -f "$migration" ]; then
      echo "  Running $migration..."
      if ! psql "$TIMESCALE_URL" -f "$migration"; then
        echo "❌ Failed to run migration: $migration" >&2
      fi
    fi
  done
  echo "✅ Tiger Data migrations complete."
else
  echo "⚠️ TIMESCALE_URL not set, skipping migrations."
fi

cd $APP_DIR

# Install Server dependencies
npm install --production

# Determine which instance is currently running
if pm2 list | grep -q "$BLUE_NAME.*online"; then
  CURRENT_COLOR="blue"
  TARGET_COLOR="green"
  TARGET_PORT=$GREEN_PORT
  TARGET_NAME=$GREEN_NAME
  OLD_NAME=$BLUE_NAME
elif pm2 list | grep -q "astroroute.*online" && ! pm2 list | grep -q "$GREEN_NAME.*online"; then
  # Legacy is running
  echo "⚠️ Legacy astroroute detected. Treating as Blue."
  CURRENT_COLOR="legacy"
  TARGET_COLOR="green"
  TARGET_PORT=$GREEN_PORT
  TARGET_NAME=$GREEN_NAME
  
  if pm2 list | grep -q "astroroute-server.*online"; then
    OLD_NAME="astroroute-server"
  else
    OLD_NAME="astroroute"
  fi
else
  # Default to blue
  CURRENT_COLOR="green"
  TARGET_COLOR="blue"
  TARGET_PORT=$BLUE_PORT
  TARGET_NAME=$BLUE_NAME
  OLD_NAME=$GREEN_NAME
fi

echo "🔵 Current active: $CURRENT_COLOR (or none)"
echo "🟢 Deploying to: $TARGET_COLOR (Tunnel Server: $TARGET_NAME on Port $TARGET_PORT)"

# 1. Start Tunnel Server
BASE_DOMAIN="astroroute.app" \
WEB_API_URL="https://astroroute.dev/api" \
PORT=$TARGET_PORT \
REDIS_URL="$REDIS_URL" \
REDIS_TUNNEL_TTL_SECONDS="$REDIS_TUNNEL_TTL_SECONDS" \
REDIS_HEARTBEAT_INTERVAL_MS="$REDIS_HEARTBEAT_INTERVAL_MS" \
TIMESCALE_URL="$TIMESCALE_URL" \
pm2 start dist/server.js --name $TARGET_NAME --update-env --force

# 1.5 Start Internal Check Service
echo "🔍 Starting Internal Check Service..."
cd ../internal-check
npm install --production
# Restart if exists, otherwise start new (prevents duplicates without downtime)
if pm2 list | grep -q "astroroute-internal-check"; then
  DATABASE_URL="$DATABASE_URL" \
  PORT=3001 \
  pm2 restart "astroroute-internal-check" --update-env
else
  DATABASE_URL="$DATABASE_URL" \
  PORT=3001 \
  pm2 start dist/index.js --name "astroroute-internal-check"
fi
cd $APP_DIR

# 1.6 Start Cron Service
echo "⏰ Starting Cron Service..."
cd ../cron
npm install --production
# Restart if exists, otherwise start new (prevents duplicates without downtime)
if pm2 list | grep -q "astroroute-cron"; then
  REDIS_URL="$REDIS_URL" \
  TIMESCALE_URL="$TIMESCALE_URL" \
  DATABASE_URL="$DATABASE_URL" \
  PAYSTACK_SECRET_KEY="$PAYSTACK_SECRET_KEY" \
  pm2 restart "astroroute-cron" --update-env
else
  REDIS_URL="$REDIS_URL" \
  TIMESCALE_URL="$TIMESCALE_URL" \
  DATABASE_URL="$DATABASE_URL" \
  PAYSTACK_SECRET_KEY="$PAYSTACK_SECRET_KEY" \
  pm2 start dist/index.js --name "astroroute-cron"
fi
cd $APP_DIR

echo "⏳ Waiting for tunnel server to be ready..."
sleep 5

# Verify Tunnel Server
if ! pm2 list | grep -q "$TARGET_NAME.*online"; then
  echo "❌ Deployment failed: $TARGET_NAME is not online."
  exit 1
fi

echo "✅ Tunnel server is running."

# 2. Update Caddyfile (Web will be handled by Vercel)
echo "🔄 Updating Caddyfile..."

cat > $CADDYFILE <<EOF
{
    on_demand_tls {
        ask http://localhost:3001/internal/domain-check
    }
}

:443 {
    tls {
        on_demand
    }

    reverse_proxy localhost:$TARGET_PORT
}
EOF

# 3. Reload Caddy
echo "🔄 Reloading Caddy..."
caddy reload --config $CADDYFILE

echo "✅ Traffic switched to $TARGET_COLOR."

# 4. Stop old tunnel server instance
if pm2 list | grep -q "$OLD_NAME.*online"; then
  echo "🛑 Stopping $OLD_NAME..."
  pm2 stop $OLD_NAME
  pm2 delete $OLD_NAME
fi

# Clean up any legacy web servers
for web_name in "astroroute-web-blue" "astroroute-web-green"; do
  if pm2 list | grep -q "$web_name.*online"; then
    echo "🧹 Cleaning up legacy web server: $web_name..."
    pm2 stop $web_name
    pm2 delete $web_name
  fi
done

# Save PM2 list
pm2 save

echo "🚀 Deployment complete! Active: $TARGET_COLOR (Tunnel Server Only)"
