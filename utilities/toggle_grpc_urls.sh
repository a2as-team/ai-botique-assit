#!/bin/bash

# Script to toggle gRPC service URLs between localhost (local dev) and Kubernetes (production)
# Usage: ./toggle_grpc_urls.sh [local|k8s]

AGENT_FILE="botiq_ai_assist/agent.py"

# Service mappings: service_name:port pairs
SERVICES=(
    "productcatalogservice:3550"
    "cartservice:7070"
    "recommendationservice:8080"
    "shippingservice:50051"
    "currencyservice:7000"
    "paymentservice:50051"
    "emailservice:5000"
    "checkoutservice:5050"
    "adservice:9555"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to detect current mode
detect_current_mode() {
    if grep -q "localhost:" "$AGENT_FILE"; then
        echo "local"
    else
        echo "k8s"
    fi
}

# Function to switch to localhost URLs
switch_to_local() {
    echo -e "${BLUE}🔄 Switching gRPC URLs to localhost for local development...${NC}"
    
    # Create backup
    cp "$AGENT_FILE" "$AGENT_FILE.backup"
    echo -e "${YELLOW}📋 Created backup: $AGENT_FILE.backup${NC}"
    
    # Replace K8s service names with localhost
    for service_port in "${SERVICES[@]}"; do
        service_name=$(echo "$service_port" | cut -d: -f1)
        port=$(echo "$service_port" | cut -d: -f2)
        k8s_url="$service_name:$port"
        localhost_url="localhost:$port"
        sed -i '' "s|'$k8s_url'|'$localhost_url'|g" "$AGENT_FILE"
        echo -e "${GREEN}✅ $k8s_url → $localhost_url${NC}"
    done
    
    echo -e "${GREEN}🎉 Successfully switched to LOCAL development mode!${NC}"
    echo -e "${YELLOW}💡 Make sure to run: utilities/start_port_forwards.sh${NC}"
}

# Function to switch to Kubernetes URLs
switch_to_k8s() {
    echo -e "${BLUE}🔄 Switching gRPC URLs to Kubernetes services...${NC}"
    
    # Create backup
    cp "$AGENT_FILE" "$AGENT_FILE.backup"
    echo -e "${YELLOW}📋 Created backup: $AGENT_FILE.backup${NC}"
    
    # Replace localhost URLs with K8s service names
    for service_port in "${SERVICES[@]}"; do
        service_name=$(echo "$service_port" | cut -d: -f1)
        port=$(echo "$service_port" | cut -d: -f2)
        k8s_url="$service_name:$port"
        localhost_url="localhost:$port"
        sed -i '' "s|'$localhost_url'|'$k8s_url'|g" "$AGENT_FILE"
        echo -e "${GREEN}✅ $localhost_url → $k8s_url${NC}"
    done
    
    echo -e "${GREEN}🎉 Successfully switched to KUBERNETES mode!${NC}"
    echo -e "${YELLOW}💡 Ready for deployment to GKE!${NC}"
}

# Function to show current status
show_status() {
    current_mode=$(detect_current_mode)
    echo -e "${BLUE}📊 Current gRPC Configuration Status:${NC}"
    echo ""
    
    if [ "$current_mode" = "local" ]; then
        echo -e "${GREEN}🏠 Mode: LOCAL DEVELOPMENT${NC}"
        echo -e "${YELLOW}📡 URLs: Using localhost with port forwarding${NC}"
    else
        echo -e "${GREEN}☸️  Mode: KUBERNETES PRODUCTION${NC}"
        echo -e "${YELLOW}📡 URLs: Using Kubernetes service names${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔧 Current gRPC URLs:${NC}"
    grep -n "grpc.insecure_channel" "$AGENT_FILE" | while read -r line; do
        echo -e "  ${YELLOW}$(echo "$line" | cut -d: -f1):${NC} $(echo "$line" | cut -d: -f2-)"
    done
}

# Main logic
case "${1:-status}" in
    "local")
        current_mode=$(detect_current_mode)
        if [ "$current_mode" = "local" ]; then
            echo -e "${YELLOW}⚠️  Already in LOCAL mode!${NC}"
            show_status
        else
            switch_to_local
        fi
        ;;
    "k8s"|"kubernetes")
        current_mode=$(detect_current_mode)
        if [ "$current_mode" = "k8s" ]; then
            echo -e "${YELLOW}⚠️  Already in KUBERNETES mode!${NC}"
            show_status
        else
            switch_to_k8s
        fi
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        echo -e "${BLUE}🛠️  gRPC URL Toggle Script${NC}"
        echo ""
        echo -e "${YELLOW}Usage:${NC}"
        echo "  utilities/toggle_grpc_urls.sh [command]"
        echo ""
        echo -e "${YELLOW}Commands:${NC}"
        echo "  local      Switch to localhost URLs for local development"
        echo "  k8s        Switch to Kubernetes service URLs for production"
        echo "  status     Show current configuration (default)"
        echo "  help       Show this help message"
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo "  utilities/toggle_grpc_urls.sh local    # For local development with port forwarding"
        echo "  utilities/toggle_grpc_urls.sh k8s      # For deployment to GKE"
        echo "  utilities/toggle_grpc_urls.sh status   # Check current mode"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${YELLOW}💡 Use 'utilities/toggle_grpc_urls.sh help' for usage information${NC}"
        exit 1
        ;;
esac
