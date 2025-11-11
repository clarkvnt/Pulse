#!/bin/bash
set -e

# Paths
PULSE_DIR="/opt/pulse"
BACKEND_DIR="$PULSE_DIR/Backend"
FRONTEND_DIR="$PULSE_DIR/Frontend"
BACKEND_LOG="$PULSE_DIR/backend.log"
FRONTEND_DIST="$FRONTEND_DIR/dist"
NGINX_TARGET="/usr/share/nginx/html"

# 1️⃣ Ensure pulse directory and log file exist
sudo mkdir -p $PULSE_DIR
sudo touch $BACKEND_LOG
sudo chown -R ec2-user:ec2-user $PULSE_DIR

# 2️⃣ Start backend
echo "Starting backend..."
cd $BACKEND_DIR
npm install --silent
nohup npm start >> $BACKEND_LOG 2>&1 &

# 3️⃣ Serve frontend via Nginx
echo "Serving frontend via Nginx..."

# Build frontend if dist does not exist
if [ ! -d "$FRONTEND_DIST" ]; then
    echo "Frontend dist folder not found. Building frontend..."
    cd $FRONTEND_DIR
    npm install --silent
    npm run build
fi

# Clear old files and copy new ones
sudo rm -rf $NGINX_TARGET/*
sudo cp -r $FRONTEND_DIST/* $NGINX_TARGET
sudo systemctl restart nginx

echo "Application started successfully."
