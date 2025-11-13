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
# 2️⃣ Start backend
# ---------------------------
echo "Starting backend..."
cd $BACKEND_DIR

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
# 3️⃣ Build and serve frontend
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
