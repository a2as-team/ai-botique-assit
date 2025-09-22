#!/bin/bash

# Stop local development environment script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping BoutiqueAI Local Development Environment${NC}"
echo -e "${YELLOW}===================================================${NC}"

# Stop port forwarding
echo -e "\n${YELLOW}🔌 Stopping port forwarding...${NC}"
./kill_port_forwards.sh 2>/dev/null
pkill -f "kubectl port-forward" 2>/dev/null
echo -e "${GREEN}✅ Port forwarding stopped${NC}"

# Stop backend (Python)
echo -e "\n${YELLOW}🐍 Stopping Python backend...${NC}"
pkill -f "python custom_adk_app.py" 2>/dev/null
pkill -f "custom_adk_app.py" 2>/dev/null
if [ -f "backend.pid" ]; then
    kill $(cat backend.pid) 2>/dev/null
    rm -f backend.pid
fi
echo -e "${GREEN}✅ Backend stopped${NC}"

# Stop frontend (React)
echo -e "\n${YELLOW}⚛️  Stopping React frontend...${NC}"
pkill -f "react-scripts start" 2>/dev/null
pkill -f "npm start" 2>/dev/null
if [ -f "frontend.pid" ]; then
    kill $(cat frontend.pid) 2>/dev/null
    rm -f frontend.pid
fi
echo -e "${GREEN}✅ Frontend stopped${NC}"

# Clean up any remaining processes
echo -e "\n${YELLOW}🧹 Cleaning up remaining processes...${NC}"
pkill -f "node.*react-scripts" 2>/dev/null
pkill -f "webpack" 2>/dev/null

# Show final status
echo -e "\n${GREEN}🎉 All services stopped successfully!${NC}"
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "  ${YELLOW}•${NC} Run 'utilities/start_local_dev.sh' to restart"
echo -e "  ${YELLOW}•${NC} Run 'utilities/toggle_grpc_urls.sh k8s' before deployment"
echo -e "  ${YELLOW}•${NC} Check status with 'utilities/toggle_grpc_urls.sh status'"

# Check if any URLs need to be reset for deployment
current_mode=$(grep -q "localhost:" "botiq_ai_assist/agent.py" && echo "local" || echo "k8s")
if [ "$current_mode" = "local" ]; then
    echo -e "\n${YELLOW}⚠️  Note: gRPC URLs are still set to localhost${NC}"
    echo -e "${BLUE}💡 Run 'utilities/toggle_grpc_urls.sh k8s' before deploying to production${NC}"
fi
