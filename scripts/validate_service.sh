#!/bin/bash
set -e

echo "Validating backend..."
curl -f http://localhost:5000/health || exit 1

echo "Backend is up!"
