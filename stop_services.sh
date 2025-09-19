#!/bin/bash

echo "🛑 Stopping Boutique AI Services..."

# Stop backend
echo "Stopping backend..."
if [ -f backend.pid ]; then
    kill $(cat backend.pid) 2>/dev/null || true
    rm backend.pid
fi
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
pkill -f "uvicorn custom_adk_app" 2>/dev/null || true

# Stop frontend
echo "Stopping frontend..."
if [ -f frontend/frontend.pid ]; then
    kill $(cat frontend/frontend.pid) 2>/dev/null || true
    rm frontend/frontend.pid
fi
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "node.*start.js" 2>/dev/null || true

echo "✅ All services stopped"
