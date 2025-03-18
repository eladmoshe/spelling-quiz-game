#!/bin/bash

# Ensure we exit if any command fails
set -e

# Clean up any existing build
rm -rf dist

# Build the project
echo "Building the project..."
npm run build

# Start the server in background
echo "Starting the server..."
npm run start &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
timeout=30
while ! curl -s http://localhost:4173 > /dev/null; do
  sleep 1
  timeout=$((timeout - 1))
  if [ $timeout -le 0 ]; then
    echo "Server failed to start within timeout!"
    kill $SERVER_PID
    exit 1
  fi
done

# Run tests
echo "Running Playwright tests..."
npx playwright test

# Clean up server
kill $SERVER_PID
