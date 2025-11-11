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
npm install --silent
nohup npm start >> $BACKEND_LOG 2>&1 &

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
