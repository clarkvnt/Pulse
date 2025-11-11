#!/bin/bash
set -e

cd /opt/pulse

echo "Starting backend..."
cd Backend
nohup npm start > /opt/pulse/backend.log 2>&1 &

echo "Serving frontend via Nginx..."
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r /opt/pulse/Frontend/dist/* /usr/share/nginx/html/
sudo systemctl restart nginx

echo "Application started successfully."
