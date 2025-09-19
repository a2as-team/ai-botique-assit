#!/bin/bash

# Deployment preparation script
# Ensures proper configuration for GKE deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Preparing BoutiqueAI for Deployment${NC}"
echo -e "${PURPLE}======================================${NC}"

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  PROJECT_ID not set. Please set it:${NC}"
    echo -e "${BLUE}export PROJECT_ID=\"your-project-id\"${NC}"
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    export PROJECT_ID
    echo -e "${GREEN}✅ PROJECT_ID set to: $PROJECT_ID${NC}"
fi

# Step 1: Configure gRPC URLs for Kubernetes
echo -e "\n${YELLOW}📡 Step 1: Configuring gRPC URLs for Kubernetes...${NC}"
./toggle_grpc_urls.sh k8s

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to configure gRPC URLs for Kubernetes${NC}"
    exit 1
fi

# Step 2: Stop any local development services
echo -e "\n${YELLOW}🛑 Step 2: Stopping local development services...${NC}"
./stop_local_dev.sh > /dev/null 2>&1
echo -e "${GREEN}✅ Local services stopped${NC}"

# Step 3: Build Docker images
echo -e "\n${YELLOW}🐳 Step 3: Building Docker images...${NC}"

echo -e "${BLUE}🔨 Building backend image...${NC}"
docker build --platform linux/amd64 -f Dockerfile.backend -t gcr.io/$PROJECT_ID/boutique-ai-backend:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build backend image${NC}"
    exit 1
fi

echo -e "${BLUE}🔨 Building frontend image...${NC}"
docker build --platform linux/amd64 -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/boutique-ai-frontend:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build frontend image${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Step 4: Push images to GCR
echo -e "\n${YELLOW}☁️  Step 4: Pushing images to Google Container Registry...${NC}"

echo -e "${BLUE}📤 Pushing backend image...${NC}"
docker push gcr.io/$PROJECT_ID/boutique-ai-backend:latest
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push backend image${NC}"
    exit 1
fi

echo -e "${BLUE}📤 Pushing frontend image...${NC}"
docker push gcr.io/$PROJECT_ID/boutique-ai-frontend:latest
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push frontend image${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Images pushed successfully${NC}"

# Step 5: Deploy to Kubernetes
echo -e "\n${YELLOW}☸️  Step 5: Deploying to Kubernetes...${NC}"

echo -e "${BLUE}🔄 Restarting backend deployment...${NC}"
kubectl rollout restart deployment boutique-ai-backend
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to restart backend deployment${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Restarting frontend deployment...${NC}"
kubectl rollout restart deployment boutique-ai-frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to restart frontend deployment${NC}"
    exit 1
fi

# Step 6: Wait for deployments
echo -e "\n${YELLOW}⏳ Step 6: Waiting for deployments to complete...${NC}"

echo -e "${BLUE}⏳ Waiting for backend deployment...${NC}"
kubectl rollout status deployment boutique-ai-backend --timeout=300s
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend deployment failed or timed out${NC}"
    exit 1
fi

echo -e "${BLUE}⏳ Waiting for frontend deployment...${NC}"
kubectl rollout status deployment boutique-ai-frontend --timeout=300s
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend deployment failed or timed out${NC}"
    exit 1
fi

# Step 7: Get access information
echo -e "\n${YELLOW}🌐 Step 7: Getting access information...${NC}"

# Try to get external IP from ingress
INGRESS_IP=$(kubectl get ingress boutique-ai-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)

if [ ! -z "$INGRESS_IP" ] && [ "$INGRESS_IP" != "null" ]; then
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${PURPLE}============================================${NC}"
    echo -e "${GREEN}🌐 Application URL:${NC} http://$INGRESS_IP"
    echo -e "${GREEN}📚 API Documentation:${NC} http://$INGRESS_IP/docs"
else
    echo -e "${YELLOW}⚠️  Ingress IP not yet available. Checking services...${NC}"
    
    # Check for LoadBalancer services
    kubectl get services | grep LoadBalancer | grep boutique-ai
    
    echo -e "${GREEN}🎉 Deployment completed!${NC}"
    echo -e "${YELLOW}💡 Run 'kubectl get ingress' to check for external IP${NC}"
fi

echo -e "\n${BLUE}🔧 Useful Commands:${NC}"
echo -e "  ${YELLOW}Check pods:${NC} kubectl get pods | grep boutique-ai"
echo -e "  ${YELLOW}Check services:${NC} kubectl get services | grep boutique-ai"
echo -e "  ${YELLOW}Check ingress:${NC} kubectl get ingress boutique-ai-ingress"
echo -e "  ${YELLOW}View logs:${NC} kubectl logs deployment/boutique-ai-backend"
echo -e "  ${YELLOW}Port forward:${NC} kubectl port-forward service/boutique-ai-frontend 8080:3000"

echo -e "\n${GREEN}✅ Deployment preparation and execution completed!${NC}"
