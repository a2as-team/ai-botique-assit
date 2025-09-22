# Boutique AI Assistant - GKE Deployment Guide

This guide provides step-by-step instructions to deploy the Boutique AI Assistant to Google Kubernetes Engine (GKE).

## 📋 Prerequisites

1. **Google Cloud Project** with billing enabled
2. **GKE Cluster** running with the Online Boutique microservices
3. **Docker** installed locally
4. **gcloud CLI** installed and configured
5. **kubectl** installed

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│   LoadBalancer  │────│   Frontend      │────│   Backend API        │
│   (External IP) │    │   (React+Nginx) │    │   (FastAPI+Python)   │
└─────────────────┘    └─────────────────┘    └──────────────────────┘
                                │                         │
                                │                         │
                       ┌─────────────────┐    ┌──────────────────────┐
                       │   Frontend      │    │   Boutique Services  │
                       │   Static Files  │    │   (Product, Cart,    │
                       │   (nginx:8080)  │    │    Checkout, etc.)   │
                       └─────────────────┘    └──────────────────────┘
```

## 🚀 Quick Deployment

### Option 1: Automated Script

```bash
# Make the script executable
chmod +x utilities/deploy.sh

# Run the deployment script
utilities/deploy.sh YOUR_PROJECT_ID us-central1 boutique-cluster
```

### Option 2: Manual Deployment

Follow the steps below for manual deployment:

## 📝 Step-by-Step Manual Deployment

### 1. Environment Setup

```bash
# Set your project variables
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export CLUSTER_NAME="boutique-cluster"

# Configure gcloud
gcloud config set project $PROJECT_ID
gcloud services enable container.googleapis.com cloudbuild.googleapis.com

# Get cluster credentials
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION
```

### 2. Build and Push Docker Images

```bash
# Build backend image
docker build -f Dockerfile.backend -t gcr.io/$PROJECT_ID/boutique-ai-backend:latest .
docker push gcr.io/$PROJECT_ID/boutique-ai-backend:latest

# Build frontend image
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/boutique-ai-frontend:latest .
docker push gcr.io/$PROJECT_ID/boutique-ai-frontend:latest
```

### 3. Update Kubernetes Manifests

Update the image references in the deployment files:

```bash
# Update backend deployment
sed -i "s/YOUR_PROJECT_ID/$PROJECT_ID/g" k8s/backend-deployment.yaml

# Update frontend deployment  
sed -i "s/YOUR_PROJECT_ID/$PROJECT_ID/g" k8s/frontend-deployment.yaml
```

### 4. Deploy to GKE

```bash
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Optional: Deploy ingress (for custom domain)
kubectl apply -f k8s/ingress.yaml
```

### 5. Verify Deployment

```bash
# Check pod status
kubectl get pods | grep boutique-ai

# Check service status
kubectl get services | grep boutique-ai

# Check deployment status
kubectl rollout status deployment/boutique-ai-backend
kubectl rollout status deployment/boutique-ai-frontend

# Get external IP
kubectl get service boutique-ai-frontend
```

### 6. Access the Application

```bash
# Get the external IP
EXTERNAL_IP=$(kubectl get service boutique-ai-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Access the application
echo "Frontend URL: http://$EXTERNAL_IP"
echo "Health Check: http://$EXTERNAL_IP/health"
```

## 🔧 Configuration

### Environment Variables

The application supports the following environment variables:

**Backend (`boutique-ai-backend`):**
- `PORT`: Server port (default: 8000)
- `ENVIRONMENT`: Environment name (production/development)

**Frontend (`boutique-ai-frontend`):**
- `REACT_APP_API_URL`: API URL (set to "/api" for proxy)

### Resource Limits

**Backend:**
- Requests: 512Mi memory, 250m CPU
- Limits: 1Gi memory, 500m CPU

**Frontend:**
- Requests: 128Mi memory, 100m CPU
- Limits: 256Mi memory, 200m CPU

## 🛠️ Troubleshooting

### Common Issues

1. **ImagePullBackOff Error**
   ```bash
   # Check if images exist in registry
   gcloud container images list --repository=gcr.io/$PROJECT_ID
   
   # Verify image tags
   gcloud container images list-tags gcr.io/$PROJECT_ID/boutique-ai-backend
   ```

2. **Service Connection Issues**
   ```bash
   # Check service endpoints
   kubectl get endpoints
   
   # Check pod logs
   kubectl logs deployment/boutique-ai-backend
   kubectl logs deployment/boutique-ai-frontend
   ```

3. **External IP Pending**
   ```bash
   # Check LoadBalancer service status
   kubectl describe service boutique-ai-frontend
   
   # Verify cluster has LoadBalancer capability
   kubectl get nodes -o wide
   ```

### Useful Commands

```bash
# Scale deployments
kubectl scale deployment boutique-ai-backend --replicas=3
kubectl scale deployment boutique-ai-frontend --replicas=3

# Update deployments
kubectl set image deployment/boutique-ai-backend backend=gcr.io/$PROJECT_ID/boutique-ai-backend:v2

# Port forward for testing
kubectl port-forward service/boutique-ai-backend 8000:8000
kubectl port-forward service/boutique-ai-frontend 8080:80

# View logs
kubectl logs -f deployment/boutique-ai-backend
kubectl logs -f deployment/boutique-ai-frontend
```

## 📊 Monitoring

### Health Checks

Both services include health check endpoints:

- **Backend**: `http://SERVICE_IP:8000/health`
- **Frontend**: `http://SERVICE_IP:8080/health`

### Kubernetes Probes

- **Liveness Probe**: Checks if container is running
- **Readiness Probe**: Checks if container is ready to serve traffic

## 🔐 Security

### Security Features

1. **Non-root containers**: Both images run as non-root users
2. **Read-only filesystem**: Frontend runs with read-only root filesystem
3. **Security headers**: Nginx configured with security headers
4. **Resource limits**: CPU and memory limits configured
5. **Network policies**: Can be added for additional network security

### Recommended Security Enhancements

```bash
# Create network policies (optional)
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: boutique-ai-netpol
spec:
  podSelector:
    matchLabels:
      app: boutique-ai-backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: boutique-ai-frontend
    ports:
    - protocol: TCP
      port: 8000
EOF
```

## 🔄 Updates and Rollbacks

### Rolling Updates

```bash
# Update to new version
kubectl set image deployment/boutique-ai-backend backend=gcr.io/$PROJECT_ID/boutique-ai-backend:v2

# Check rollout status
kubectl rollout status deployment/boutique-ai-backend

# Rollback if needed
kubectl rollout undo deployment/boutique-ai-backend
```

## 📞 Support

For issues and questions:

1. Check pod logs: `kubectl logs deployment/boutique-ai-backend`
2. Check service connectivity: `kubectl get endpoints`
3. Verify microservices are running: `kubectl get pods | grep -E "(cart|product|checkout)"`

## 🎯 Production Considerations

1. **Ingress Controller**: Set up proper ingress for custom domains
2. **SSL/TLS**: Configure managed certificates
3. **Monitoring**: Set up Prometheus/Grafana monitoring
4. **Logging**: Configure centralized logging with Stackdriver
5. **Backup**: Implement backup strategies for persistent data
6. **Autoscaling**: Configure Horizontal Pod Autoscaler (HPA)

```bash
# Example HPA configuration
kubectl autoscale deployment boutique-ai-backend --cpu-percent=70 --min=2 --max=10
kubectl autoscale deployment boutique-ai-frontend --cpu-percent=70 --min=2 --max=5
```
