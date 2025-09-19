#!/bin/bash

echo "🚀 Starting Full Boutique AI Application..."

# Stop any existing services first
./stop_services.sh

# Start backend
./start_backend.sh

# Wait a moment for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Start frontend
./start_frontend.sh

echo ""
echo "🎉 Boutique AI Application is running!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Use './stop_services.sh' to stop all services"
