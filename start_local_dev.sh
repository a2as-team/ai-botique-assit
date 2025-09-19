#!/bin/bash

# Enhanced local development startup script
# Automatically configures gRPC URLs, starts services, and port forwarding

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting BoutiqueAI Local Development Environment${NC}"
echo -e "${PURPLE}=================================================${NC}"

# Step 1: Configure gRPC URLs for localhost
echo -e "\n${YELLOW}📡 Step 1: Configuring gRPC URLs for local development...${NC}"
./toggle_grpc_urls.sh local

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to configure gRPC URLs${NC}"
    exit 1
fi

# Step 2: Start port forwarding to microservices
echo -e "\n${YELLOW}🔌 Step 2: Starting port forwarding to microservices...${NC}"
./start_port_forwards.sh &
PORT_FORWARD_PID=$!

# Wait a moment for port forwarding to establish
echo -e "${BLUE}⏳ Waiting for port forwarding to establish...${NC}"
sleep 5

# Step 3: Install frontend dependencies if needed
echo -e "\n${YELLOW}📦 Step 3: Checking frontend dependencies...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}📥 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

# Step 4: Start backend in background
echo -e "\n${YELLOW}🐍 Step 4: Starting Python backend...${NC}"
python custom_adk_app.py &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${BLUE}⏳ Waiting for backend to start...${NC}"
sleep 3

# Step 5: Start frontend in background
echo -e "\n${YELLOW}⚛️  Step 5: Starting React frontend...${NC}"
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${BLUE}⏳ Waiting for frontend to start...${NC}"
sleep 5

echo -e "\n${GREEN}🎉 BoutiqueAI Local Development Environment Started!${NC}"
echo -e "${PURPLE}====================================================${NC}"
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:8000"
echo -e "${GREEN}📚 API Docs:${NC} http://localhost:8000/docs"
echo -e "${YELLOW}📡 Port Forwarding:${NC} Active to all microservices"

echo -e "\n${BLUE}💡 Useful Commands:${NC}"
echo -e "  ${YELLOW}Check status:${NC} ./toggle_grpc_urls.sh status"
echo -e "  ${YELLOW}View logs:${NC} tail -f backend.log (if logging to file)"
echo -e "  ${YELLOW}Stop all:${NC} ./stop_local_dev.sh"

echo -e "\n${YELLOW}🔴 Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    # Kill port forwarding
    if [ ! -z "$PORT_FORWARD_PID" ]; then
        echo -e "${BLUE}🔌 Stopping port forwarding...${NC}"
        kill $PORT_FORWARD_PID 2>/dev/null
        ./kill_port_forwards.sh 2>/dev/null
    fi
    
    # Kill backend
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}🐍 Stopping backend...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    # Kill frontend (npm start creates multiple processes)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${BLUE}⚛️  Stopping frontend...${NC}"
        pkill -f "react-scripts start" 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ All services stopped!${NC}"
    echo -e "${YELLOW}💡 Run './toggle_grpc_urls.sh k8s' before deployment${NC}"
    exit 0
}

# Trap Ctrl+C and other signals
trap cleanup SIGINT SIGTERM

# Keep script running and show process status
while true; do
    sleep 10
    
    # Check if processes are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend process died unexpectedly${NC}"
        break
    fi
    
    if ! pgrep -f "react-scripts start" > /dev/null; then
        echo -e "${RED}❌ Frontend process died unexpectedly${NC}"
        break
    fi
done

cleanup
