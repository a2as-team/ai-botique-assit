#!/bin/bash

echo "🐍 Starting Backend..."

# Kill any existing backend processes
echo "🧹 Cleaning up existing backend processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
pkill -f "uvicorn custom_adk_app" 2>/dev/null || true
rm -f backend.pid

# Navigate to project directory
cd /Users/arjunprabhulal/botiq-ai-assist

# Activate virtual environment and start backend
echo "🚀 Starting FastAPI Backend on port 8000..."
uvicorn custom_adk_app:app --host 0.0.0.0 --port 8000 --reload &
echo $! > backend.pid

echo "✅ Backend started with PID: $(cat backend.pid)"
echo "📍 Backend URL: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
