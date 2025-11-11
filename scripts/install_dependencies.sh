#!/bin/bash
set -e

cd /opt/pulse

echo "Installing backend dependencies..."
cd Backend
npm install
npm run build
cd ..

echo "Installing frontend dependencies..."
cd Frontend
npm install
npm run build
cd ..

echo "Dependencies installed and frontend built successfully."
