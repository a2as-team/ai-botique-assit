#!/bin/bash

echo "🎨 Starting Frontend..."

# Kill any existing frontend processes
echo "🧹 Cleaning up existing frontend processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "node.*start.js" 2>/dev/null || true
rm -f frontend.pid

# Navigate to frontend directory
cd /Users/arjunprabhulal/botiq-ai-assist/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🚀 Starting React Frontend on port 3000..."
npm start &
echo $! > ../frontend.pid

echo "✅ Frontend started with PID: $(cat ../frontend.pid)"
echo "📍 Frontend URL: http://localhost:3000"
