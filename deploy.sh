#!/bin/bash

# Boutique AI Assistant - GKE Deployment Script
# Usage: ./deploy.sh [PROJECT_ID] [REGION] [CLUSTER_NAME]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${1:-"your-gcp-project-id"}
REGION=${2:-"us-central1"}
CLUSTER_NAME=${3:-"boutique-cluster"}
NAMESPACE="default"

echo -e "${BLUE}🚀 Starting Boutique AI Assistant deployment to GKE${NC}"
echo -e "${YELLOW}Project ID: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo -e "${YELLOW}Cluster: ${CLUSTER_NAME}${NC}"

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}❌ gcloud CLI is required but not installed.${NC}" >&2; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}❌ kubectl is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ docker is required but not installed.${NC}" >&2; exit 1; }

# Set up gcloud configuration
echo -e "${BLUE}🔧 Configuring gcloud...${NC}"
gcloud config set project $PROJECT_ID
gcloud services enable container.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Get cluster credentials
echo -e "${BLUE}🔐 Getting cluster credentials...${NC}"
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION

# Create namespace if it doesn't exist
echo -e "${BLUE}📦 Setting up namespace...${NC}"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Build and push backend image
echo -e "${BLUE}🏗️  Building backend image...${NC}"
docker build -f Dockerfile.backend -t gcr.io/$PROJECT_ID/boutique-ai-backend:latest .
docker push gcr.io/$PROJECT_ID/boutique-ai-backend:latest

# Build and push frontend image
echo -e "${BLUE}🏗️  Building frontend image...${NC}"
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/boutique-ai-frontend:latest .
docker push gcr.io/$PROJECT_ID/boutique-ai-frontend:latest

# Update Kubernetes manifests with project ID
echo -e "${BLUE}📝 Updating Kubernetes manifests...${NC}"
sed -i.bak "s/YOUR_PROJECT_ID/$PROJECT_ID/g" k8s/backend-deployment.yaml
sed -i.bak "s/YOUR_PROJECT_ID/$PROJECT_ID/g" k8s/frontend-deployment.yaml

# Deploy backend
echo -e "${BLUE}🚀 Deploying backend...${NC}"
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy frontend
echo -e "${BLUE}🚀 Deploying frontend...${NC}"
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Wait for deployments to be ready
echo -e "${BLUE}⏳ Waiting for deployments to be ready...${NC}"
kubectl rollout status deployment/boutique-ai-backend --timeout=300s
kubectl rollout status deployment/boutique-ai-frontend --timeout=300s

# Get service information
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 Service Information:${NC}"
kubectl get services | grep boutique-ai

# Get external IP
EXTERNAL_IP=$(kubectl get service boutique-ai-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")
echo -e "${GREEN}🌐 Frontend URL: http://${EXTERNAL_IP}${NC}"

# Health check
echo -e "${BLUE}🏥 Performing health check...${NC}"
if [ "$EXTERNAL_IP" != "Pending..." ] && [ "$EXTERNAL_IP" != "" ]; then
    sleep 30
    if curl -f "http://${EXTERNAL_IP}/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed. Service might still be starting up.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  External IP is still pending. Check status with: kubectl get service boutique-ai-frontend${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed! Your Boutique AI Assistant is now running on GKE.${NC}"
