#!/bin/bash
set -e

# Configuration
BACKEND_URL="http://localhost:5000"
HEALTH_ENDPOINT="${BACKEND_URL}/health"
MAX_RETRIES=30
RETRY_DELAY=2

echo "Validating backend service..."

# Wait for backend process to be running
echo "Checking if backend process is running..."
for i in $(seq 1 $MAX_RETRIES); do
  if pgrep -f "node.*server.js" > /dev/null || pgrep -f "npm start" > /dev/null; then
    echo "Backend process found!"
    break
  fi
  
  if [ $i -eq $MAX_RETRIES ]; then
    echo "ERROR: Backend process not found after ${MAX_RETRIES} attempts"
    echo "Checking backend log..."
    if [ -f /opt/pulse/backend.log ]; then
      tail -50 /opt/pulse/backend.log
    fi
    exit 1
  fi
  
  echo "Waiting for backend process... (attempt $i/$MAX_RETRIES)"
  sleep $RETRY_DELAY
done

# Wait for backend to be ready and respond to health checks
echo "Waiting for backend to be ready..."
for i in $(seq 1 $MAX_RETRIES); do
  if curl -f -s --max-time 5 "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
    echo "✅ Backend is up and responding!"
    curl -s "$HEALTH_ENDPOINT" | head -5
    exit 0
  fi
  
  if [ $i -eq $MAX_RETRIES ]; then
    echo "ERROR: Backend health check failed after ${MAX_RETRIES} attempts"
    echo "Checking backend log..."
    if [ -f /opt/pulse/backend.log ]; then
      echo "--- Last 50 lines of backend.log ---"
      tail -50 /opt/pulse/backend.log
    fi
    echo "--- Checking if port 5000 is listening ---"
    netstat -tlnp 2>/dev/null | grep 5000 || ss -tlnp 2>/dev/null | grep 5000 || echo "Port 5000 is not listening"
    exit 1
  fi
  
  echo "Waiting for backend to respond... (attempt $i/$MAX_RETRIES)"
  sleep $RETRY_DELAY
done
