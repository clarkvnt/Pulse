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
# 3️⃣ Start backend
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
# 4️⃣ Build and serve frontend
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
