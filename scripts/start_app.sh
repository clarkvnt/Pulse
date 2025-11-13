#!/bin/bash
set -e

# ---------------------------
# Paths
# ---------------------------
PULSE_DIR="/opt/pulse"
BACKEND_DIR="$PULSE_DIR/Backend"
FRONTEND_DIR="$PULSE_DIR/Frontend"
BACKEND_LOG="$PULSE_DIR/backend.log"
FRONTEND_BUILD="$FRONTEND_DIR/build"    # frontend output folder
NGINX_TARGET="/usr/share/nginx/html"

# ---------------------------
# Helper functions
# ---------------------------
wait_for_database() {
    local host="$1"
    local port="$2"
    local retries="${3:-30}"
    local delay="${4:-2}"

    for ((attempt=1; attempt<=retries; attempt++)); do
        if node - "$host" "$port" <<'NODE' >/dev/null 2>&1
const net = require('net');
const host = process.argv[2];
const port = Number(process.argv[3]);
const socket = net.connect({ host, port, timeout: 2000 });
socket.once('connect', () => {
  socket.end();
  process.exit(0);
});
socket.once('timeout', () => {
  socket.destroy();
  process.exit(1);
});
socket.once('error', () => {
  process.exit(1);
});
setTimeout(() => {}, 4000);
NODE
        then
            echo "Database reachable at ${host}:${port}"
            return 0
        fi

        echo "Waiting for database ${host}:${port}... (attempt ${attempt}/${retries})"
        sleep "$delay"
    done

    return 1
}

start_local_postgres() {
    local compose_cmd=""

    if command -v docker >/dev/null 2>&1; then
        if docker compose version >/dev/null 2>&1; then
            compose_cmd="docker compose"
        fi
    fi

    if [ -z "$compose_cmd" ] && command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker-compose"
    fi

    if [ -z "$compose_cmd" ]; then
        echo "Docker Compose is not available; cannot auto-start local PostgreSQL."
        return 1
    fi

    echo "Attempting to start PostgreSQL using ${compose_cmd}..."
    if (cd "$BACKEND_DIR" && $compose_cmd up -d postgres); then
        echo "PostgreSQL container started (or already running)."
        return 0
    fi

    echo "Failed to start PostgreSQL via Docker Compose."
    return 1
}

# ---------------------------
# 1️⃣ Ensure directories and log file exist
# ---------------------------
sudo mkdir -p $PULSE_DIR
sudo touch $BACKEND_LOG
sudo chown -R ec2-user:ec2-user $PULSE_DIR

# Ensure Nginx target exists
if [ ! -d "$NGINX_TARGET" ]; then
    echo "Nginx target folder not found. Creating it..."
    sudo mkdir -p $NGINX_TARGET
    sudo chown -R ec2-user:ec2-user $NGINX_TARGET
fi

# ---------------------------
# 2️⃣ Configure environment variables
# ---------------------------
echo "Configuring backend environment..."

# Get the server's public IP address
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")
LOCAL_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4 2>/dev/null || hostname -I | awk '{print $1}')

cd $BACKEND_DIR

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    if [ -f "env.template" ]; then
        cp env.template .env
    else
        touch .env
    fi
fi

# Configure FRONTEND_URLS if not already set
if ! grep -q "FRONTEND_URLS" .env || grep -q "^FRONTEND_URLS=$" .env; then
    echo "Configuring FRONTEND_URLS..."
    
    # Build the frontend URLs list
    FRONTEND_URLS=""
    
    if [ -n "$PUBLIC_IP" ]; then
        FRONTEND_URLS="http://${PUBLIC_IP}"
    fi
    
    if [ -n "$LOCAL_IP" ] && [ "$LOCAL_IP" != "$PUBLIC_IP" ]; then
        if [ -n "$FRONTEND_URLS" ]; then
            FRONTEND_URLS="${FRONTEND_URLS},http://${LOCAL_IP}"
        else
            FRONTEND_URLS="http://${LOCAL_IP}"
        fi
    fi
    
    # Update or add FRONTEND_URLS in .env
    if grep -q "^FRONTEND_URLS=" .env; then
        sed -i "s|^FRONTEND_URLS=.*|FRONTEND_URLS=${FRONTEND_URLS}|" .env
    else
        echo "FRONTEND_URLS=${FRONTEND_URLS}" >> .env
    fi
    
    echo "Set FRONTEND_URLS=${FRONTEND_URLS}"
fi

# Ensure FRONTEND_URL is set if not already
if ! grep -q "^FRONTEND_URL=" .env || grep -q "^FRONTEND_URL=$" .env; then
    if [ -n "$PUBLIC_IP" ]; then
        if grep -q "^FRONTEND_URL=" .env; then
            sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=http://${PUBLIC_IP}|" .env
        else
            echo "FRONTEND_URL=http://${PUBLIC_IP}" >> .env
        fi
        echo "Set FRONTEND_URL=http://${PUBLIC_IP}"
    fi
fi

# Ensure NODE_ENV is set to production
if ! grep -q "^NODE_ENV=" .env; then
    echo "NODE_ENV=production" >> .env
elif ! grep -q "^NODE_ENV=production" .env; then
    sed -i "s|^NODE_ENV=.*|NODE_ENV=production|" .env
fi

# ---------------------------
# 3️⃣ Ensure database is ready
# ---------------------------
echo "Ensuring database connectivity..."

DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | tail -n 1 | cut -d= -f2- | tr -d '\r')
DATABASE_URL="${DATABASE_URL%\"}"
DATABASE_URL="${DATABASE_URL#\"}"

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set in .env. Please configure it before deployment."
    exit 1
fi

DB_PARSE=$(node - "$DATABASE_URL" <<'NODE'
try {
  const url = new URL(process.argv[2]);
  const host = url.hostname || 'localhost';
  const port = url.port || '5432';
  process.stdout.write(`${host}:${port}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
NODE
)

if [ $? -ne 0 ] || [ -z "$DB_PARSE" ]; then
    echo "ERROR: Unable to parse DATABASE_URL. Value: ${DATABASE_URL}"
    exit 1
fi

DB_HOST=${DB_PARSE%:*}
DB_PORT=${DB_PARSE#*:}

if ! wait_for_database "$DB_HOST" "$DB_PORT" 10 3; then
    if [[ "$DB_HOST" =~ ^(localhost|127\.0\.0\.1|::1)$ ]]; then
        echo "Database not reachable at ${DB_HOST}:${DB_PORT}. Attempting to start local PostgreSQL..."
        if start_local_postgres; then
            echo "Waiting for local PostgreSQL to become ready..."
            if ! wait_for_database "$DB_HOST" "$DB_PORT" 20 3; then
                echo "ERROR: PostgreSQL did not become ready at ${DB_HOST}:${DB_PORT}."
                exit 1
            fi
        else
            echo "ERROR: Unable to start local PostgreSQL automatically."
            exit 1
        fi
    else
        echo "ERROR: Unable to reach database at ${DB_HOST}:${DB_PORT}. Please verify connectivity and credentials."
        exit 1
    fi
fi

echo "Running Prisma migrations..."
if ! npm run prisma:migrate:deploy; then
    echo "ERROR: Prisma migrations failed. Check the output above for details."
    exit 1
fi

# ---------------------------
# 4️⃣ Start backend
# ---------------------------
echo "Starting backend..."

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install --silent
fi

# Build backend if dist folder doesn't exist
if [ ! -d "dist" ]; then
    echo "Building backend..."
    npm run build
fi

# Stop any existing backend process
echo "Stopping any existing backend process..."
pkill -f "node.*dist/server.js" || true
sleep 2

# Start backend in background
echo "Starting backend server..."
nohup npm start >> $BACKEND_LOG 2>&1 &
BACKEND_PID=$!

# Give backend a moment to start
sleep 3

# Verify backend process is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend process failed to start!"
    echo "Backend log:"
    tail -50 $BACKEND_LOG
    exit 1
fi

echo "Backend started with PID: $BACKEND_PID"

# ---------------------------
# 5️⃣ Build and serve frontend
# ---------------------------
echo "Serving frontend via Nginx..."

# Build frontend if build folder does not exist
if [ ! -d "$FRONTEND_BUILD" ]; then
    echo "Frontend build folder not found. Building frontend..."
    cd $FRONTEND_DIR
    npm install --silent
    npm run build
fi

# Clear old files and copy new ones
sudo rm -rf $NGINX_TARGET/*
sudo cp -r $FRONTEND_BUILD/* $NGINX_TARGET
sudo systemctl restart nginx

echo "Application started successfully."
