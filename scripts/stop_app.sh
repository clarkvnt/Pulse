#!/bin/bash
set -e

echo "Stopping backend process..."
pkill -f "node dist/server.js" || true
