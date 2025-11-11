#!/bin/bash
set -e

cd /opt/pulse

echo "Installing backend dependencies..."
cd Backend
sudo npm install
sudo npm run build
cd ..

echo "Installing frontend dependencies..."
cd Frontend
sudo npm install
sudo npm run build
cd ..

echo "Dependencies installed and frontend built successfully."
