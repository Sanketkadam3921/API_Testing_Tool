#!/bin/bash

# Start Backend Server
echo "🚀 Starting ApexAPI Backend Server..."

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating default..."
    echo "PORT=3001" > .env
    echo "DATABASE_URL=postgresql://user:password@localhost:5432/apitesting" >> .env
    echo "JWT_SECRET=your-secret-key-change-in-production" >> .env
fi

# Start server
PORT=${PORT:-3001} node src/server.js






