#!/bin/bash
set -e

echo "Stopping existing Pulse services..."
sudo systemctl stop pulse-backend.service || true
sudo systemctl stop pulse-frontend.service || true

echo "Removing old deployment files..."
sudo rm -rf /opt/pulse/*
