# BoutiqueAI Assistant 🛍️

A modern, intelligent e-commerce chat interface powered by AI. Built with microservices architecture and beautiful UI components for a complete shopping experience.

## 📑 Table of Contents

- [✨ Features](#-features)
  - [🧠 Intelligent AI Shopping Assistant](#-intelligent-ai-shopping-assistant)
  - [🛒 Complete E-commerce Experience](#-complete-e-commerce-experience)
  - [🎨 Modern UI/UX](#-modern-uiux)
- [📸 Screenshots](#-screenshots)
  - [Welcome Page](#welcome-page)
  - [Intelligent Product Search](#intelligent-product-search)
  - [Smart Recommendations & Ads](#smart-recommendations--ads)
  - [Shopping Cart & Add to Cart](#shopping-cart--add-to-cart)
  - [Checkout Process](#checkout-process)
  - [Order Confirmation](#order-confirmation)
- [🏗️ Architecture](#️-architecture)
  - [Backend (Python)](#backend-python)
  - [Frontend (React)](#frontend-react)
- [📋 Prerequisites](#-prerequisites)
  - [For Local Development](#for-local-development)
  - [For GKE Deployment](#for-gke-deployment)
- [🚀 Quick Start](#-quick-start)
  - [1. Clone and Setup](#1-clone-and-setup)
  - [2. 🛠️ Enhanced Local Development (Recommended)](#2-️-enhanced-local-development-recommended)
  - [3. ⚙️ Manual Development Setup](#3-️-manual-development-setup)
  - [4. 🔧 gRPC URL Management](#4--grpc-url-management)
  - [5. Access the Application](#5-access-the-application)
- [🎯 Usage Examples](#-usage-examples)
  - [🔍 Intelligent Product Search](#-intelligent-product-search)
  - [💰 Smart Price Filtering](#-smart-price-filtering)
  - [🏷️ Promotional Intelligence](#️-promotional-intelligence)
  - [🛒 Enhanced Shopping Cart](#-enhanced-shopping-cart)
  - [🎁 Recommendation System](#-recommendation-system)
  - [📋 Order Confirmation with Images](#-order-confirmation-with-images)
- [🧠 AI Intelligence Capabilities](#-ai-intelligence-capabilities)
  - [🔍 Smart Search Intelligence](#-smart-search-intelligence)
  - [💰 Intelligent Price Filtering](#-intelligent-price-filtering)
  - [🎯 Intelligent Recommendations](#-intelligent-recommendations)
  - [🏷️ Smart Promotional Integration](#️-smart-promotional-integration)
  - [🎨 Visual Intelligence](#-visual-intelligence)
- [🏗️ Component Architecture](#️-component-architecture)
  - [Key React Components](#key-react-components)
  - [Smart Message Detection](#smart-message-detection)
- [🔧 Configuration](#-configuration)
  - [Environment Variables](#environment-variables)
- [🌐 gRPC & Protocol Buffers](#-grpc--protocol-buffers)
  - [📄 Key Files](#-key-files)
  - [🏗️ Microservices Defined in Proto](#️-microservices-defined-in-proto)
  - [🔄 How gRPC Works in This Project](#-how-grpc-works-in-this-project)
  - [💡 Example gRPC Usage](#-example-grpc-usage)
  - [🔧 Regenerating gRPC Files (if needed)](#-regenerating-grpc-files-if-needed)
  - [🎯 Why gRPC?](#-why-grpc)
  - [📚 Understanding Message Types](#-understanding-message-types)
  - [Test Data](#test-data)
- [🔄 Production Deployment to GKE](#-production-deployment-to-gke)
  - [Prerequisites for GKE Deployment](#prerequisites-for-gke-deployment)
  - [🚀 Enhanced One-Command Deployment (Recommended)](#-enhanced-one-command-deployment-recommended)
  - [⚙️ Manual Deployment (Alternative)](#️-manual-deployment-alternative)
  - [Accessing Your Deployed Application](#accessing-your-deployed-application)
  - [Production Architecture](#production-architecture)
- [🛠️ Development](#️-development)
  - [File Structure](#file-structure)
  - [🔧 Enhanced Development Scripts](#-enhanced-development-scripts)
  - [API Endpoints](#api-endpoints)
  - [Stopping Services](#stopping-services)
  - [Development Workflow Best Practices](#development-workflow-best-practices)

## ✨ Features

### 🧠 Intelligent AI Shopping Assistant
- **Smart Search** - Natural language with synonym understanding (e.g., "shoes" → "footwear")
- **Price Intelligence** - Understands "under $50", "cheap gifts", "budget-friendly" queries
- **Product Recommendations** - Intelligent "You May Also Like" suggestions
- **Promotional Intelligence** - Product-specific ads with contextual offers
- **Conversational Shopping** - Stays in chat experience, no external redirects
- **Visual Product Discovery** - Rich product cards with images and pricing

### 🛒 Complete E-commerce Experience
- **Product Catalog** - Browse and search products with intelligent matching
- **Shopping Cart** - Add items, view cart with product images and prices
- **Checkout Process** - Beautiful form with pre-filled test data
- **Order Confirmation** - Professional order summary with product images and names
- **Shipping Integration** - Real-time shipping quotes and address handling
- **Payment Processing** - Secure payment with test credit card data
- **Email Notifications** - Order confirmation emails
- **Currency Support** - Multi-currency conversion capabilities
- **Smart Advertising** - Contextual product advertisements with click-to-search

### 🎨 Modern UI/UX
- Responsive design for mobile and desktop
- Auto-scrolling chat interface
- Beautiful product cards with "Add to Cart" functionality
- Clean order confirmation layouts
- Minimal text descriptions with rich visual components
- Smooth animations and transitions

## 📸 Screenshots

### Welcome Page
The clean, modern interface welcomes users with an intuitive chat experience.

![Welcome Page](images/welcome_page.png)

### Intelligent Product Search
Natural language search with rich product cards, recommendations, and contextual ads.

![Product Search](images/product_search.png)

### Smart Recommendations & Ads
AI-powered "You May Also Like" suggestions and targeted promotional content.

<div style="display: flex; gap: 10px;">
  <img src="images/product_recommendation.png" alt="Product Recommendations" width="49%">
  <img src="images/product_ads.png" alt="Product Ads" width="49%">
</div>

### Shopping Cart & Add to Cart
Seamless cart management with beautiful product displays and easy add-to-cart functionality.

![Add to Cart](images/add_to_cart.png)

![Cart Checkout](images/cart_checkout.png)

### Checkout Process
Streamlined checkout with pre-filled test data and professional order processing.

![Checkout Order](images/checkout_order.png)

### Order Confirmation
Professional order confirmation with product images and complete order details.

![Order Confirmation](images/order_confirmation.png)

## 🏗️ Architecture

### Backend (Python)
- **FastAPI** - High-performance API server
- **Google Agent Development Kit (ADK)** - AI agent framework
- **gRPC** - Microservices communication
- **9 Microservices Integration:**
  - Product Catalog Service (Port 3550)
  - Cart Service (Port 7070) 
  - Recommendation Service (Port 8080)
  - Shipping Service (Port 50052)
  - Currency Service (Port 7000)
  - Payment Service (Port 50051)
  - Email Service (Port 5000)
  - Checkout Service (Port 5050)
  - Ad Service (Port 9555)

### Frontend (React)
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Heroicons** - Beautiful icons
- **ReactMarkdown** - Rich text rendering
- **Axios** - HTTP client for API communication

## 📋 Prerequisites

### For Local Development
- **Python 3.9+**
- **Node.js 18+**
- **npm 9+**
- **kubectl** (for microservices port-forwarding)

### For GKE Deployment  
- **Docker Desktop**
- **Google Cloud SDK (gcloud)**
- **kubectl**
- **GKE cluster** with Online Boutique services

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd botiq-ai-assist

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies  
cd frontend
npm install
cd ..
```

### 2. 🛠️ Enhanced Local Development (Recommended)

**One-command local development startup:**
```bash
./start_local_dev.sh
```

This script automatically:
- ✅ Configures gRPC URLs for localhost (port forwarding)
- ✅ Starts port forwarding to all microservices  
- ✅ Installs frontend dependencies if needed
- ✅ Starts Python backend
- ✅ Starts React frontend
- ✅ Provides unified logging and cleanup

**To stop all services:**
```bash
./stop_local_dev.sh
```

### 3. ⚙️ Manual Development Setup

If you prefer manual control:

```bash
# Step 1: Configure for local development
./toggle_grpc_urls.sh local

# Step 2: Start port forwarding
./start_port_forwards.sh

# Step 3: Start services
./start_all.sh  # or run backend/frontend separately
```

### 4. 🔧 gRPC URL Management

The project includes intelligent gRPC URL switching:

```bash
# Check current configuration
./toggle_grpc_urls.sh status

# Switch to localhost for local development
./toggle_grpc_urls.sh local

# Switch to Kubernetes for deployment
./toggle_grpc_urls.sh k8s

# Show help
./toggle_grpc_urls.sh help
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🎯 Usage Examples

### 🔍 Intelligent Product Search
```
"Find shoes"
→ AI tries "shoes", then "footwear", shows all relevant products
→ Displays visual product cards with images, prices, and "Add to Cart" buttons
→ Includes "You May Also Like" intelligent recommendations
→ Shows contextual promotional ads
```

*See the [Product Search screenshot](#intelligent-product-search) for the visual experience.*

### 💰 Smart Price Filtering
```
"Find a gift under $50"
→ AI understands price query and filters products automatically
→ Shows only products under $50 with visual cards
→ Includes promotional offers for budget items
```

### 🏷️ Promotional Intelligence
```
Click on ad: "Loafers for sale. Buy one, get second one for free"
→ AI understands promotional text and searches for loafers
→ Stays within chat experience (no external redirects)
→ Shows product details with add-to-cart functionality
```

### 🛒 Enhanced Shopping Cart
```
"What's in my cart?"
→ Shows rich cart view with product images, quantities, and total pricing
→ Displays related product recommendations
→ Includes promotional offers for cart items
```

*View the [Shopping Cart screenshots](#shopping-cart--add-to-cart) to see the cart management experience.*

### 🎁 Recommendation System
```
After searching for any product
→ AI automatically calls recommendation service
→ Shows "You May Also Like" section with intelligent suggestions
→ Recommendations based on product relationships and user context
```

*Check out the [Smart Recommendations screenshot](#smart-recommendations--ads) to see AI-powered suggestions in action.*

### 📋 Order Confirmation with Images
```
After placing order
→ Professional order confirmation with product images and names
→ Visual product cards instead of cryptic product IDs
→ Complete order tracking and shipping details
```

*See the complete [Checkout Process](#checkout-process) and [Order Confirmation](#order-confirmation) screenshots for the full purchase flow.*

## 🧠 AI Intelligence Capabilities

### 🔍 Smart Search Intelligence
The AI agent uses advanced natural language understanding to handle product searches:

- **Synonym Matching**: "shoes" automatically tries "footwear", "sneakers"
- **Category Understanding**: Recognizes product types and related categories  
- **Multiple Attempts**: If initial search fails, tries alternative terms intelligently
- **Context Awareness**: Understands user intent beyond exact keyword matching

### 💰 Intelligent Price Filtering
Dedicated price filtering with natural language understanding:

- **Natural Queries**: "under $50", "below $30", "cheap gifts", "budget-friendly"
- **Automatic Filtering**: Uses `filter_products_by_price` function for accuracy
- **Visual Results**: Filtered products shown as product cards, not just text
- **Promotional Integration**: Includes relevant ads for price-filtered items

### 🎯 Intelligent Recommendations
Leverages the Recommendation Service microservice for smart suggestions:

- **Context-Aware**: Uses `list_recommendations` based on product relationships
- **Product-Based**: Recommendations based on products user is currently viewing
- **Cross-Category**: Suggests complementary items from different categories
- **Always Present**: Shown with every product search for discovery

### 🏷️ Smart Promotional Integration
Product-specific advertising with intelligent ad handling:

- **Contextual Ads**: Uses product IDs for targeted promotional content
- **Click Intelligence**: AI parses ad text to understand product intent
- **In-Chat Experience**: Ad clicks trigger searches within chat (no redirects)
- **Mandatory Display**: Every product result includes promotional content

### 🎨 Visual Intelligence
Converts complex data into beautiful visual components:

- **Product Cards**: Rich images, pricing, and action buttons
- **Order Enhancement**: Product images and names in confirmations
- **Loading States**: Smooth transitions while fetching data
- **Error Handling**: Graceful fallbacks for missing images/data

## 🏗️ Component Architecture

### Key React Components

```
ChatInterface.js       # Main chat container with auto-scroll
├── MessageList.js     # Message rendering and management
├── Message.js         # Individual message with smart content detection
│   ├── ProductCard.js # Product display with "Add to Cart"
│   ├── CartView.js    # Rich cart display with images and pricing
│   ├── CheckoutForm.js # Beautiful checkout form
│   └── OrderConfirmation.js # Professional order summary with images
├── ChatInput.js       # Message input with loading states
└── ChatHeader.js      # Header with session management
```

### Smart Message Detection

The `Message.js` component intelligently detects content types:
- **Product Search** → Shows product cards with recommendations and ads
- **Price Filtering** → Displays filtered product cards (e.g., "under $50")
- **Cart Queries** → Rich cart view with images and promotional suggestions
- **Promotional Ads** → Beautiful ad cards with click-to-search functionality
- **Checkout Intent** → Shows checkout form with pre-filled test data
- **Order Completion** → Enhanced order confirmation with product images and names
- **Recommendations** → "You May Also Like" horizontal scrolling cards
- **General Chat** → Standard markdown rendering with intelligent responses

## 🔧 Configuration

### Environment Variables

```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:8000

# Backend
# Microservice ports are configured in agent.py
```

## 🌐 gRPC & Protocol Buffers

This project uses **gRPC** (Google Remote Procedure Call) to communicate with microservices. Understanding these files is crucial for development:

### 📄 Key Files

#### `hipstershop.proto` 
- **Protocol Buffer definition file** - The source of truth
- Defines **9 microservices** and their interfaces
- Written in Protocol Buffer language (proto3 syntax)
- Contains service definitions, message types, and data structures

#### `hipstershop_pb2.py` 
- **Auto-generated Python classes** from the .proto file
- Contains message types (data structures) like `CartItem`, `Product`, `Address`
- Used for serializing/deserializing data between Python and gRPC services
- **DO NOT EDIT** - Regenerated when .proto file changes

#### `hipstershop_pb2_grpc.py`
- **Auto-generated gRPC client stubs** from the .proto file  
- Contains service client classes like `CartServiceStub`, `ProductCatalogServiceStub`
- Used in `agent.py` to make gRPC calls to microservices
- **DO NOT EDIT** - Regenerated when .proto file changes

### 🏗️ Microservices Defined in Proto

The `hipstershop.proto` file defines **9 microservices**:

| Service | Purpose | Port | Key Operations |
|---------|---------|------|----------------|
| **CartService** | Shopping cart management | 7070 | `AddItem`, `GetCart`, `EmptyCart` |
| **ProductCatalogService** | Product catalog & search | 3550 | `ListProducts`, `GetProduct`, `SearchProducts` |
| **RecommendationService** | Product recommendations | 8080 | `ListRecommendations` |
| **ShippingService** | Shipping quotes & tracking | 50052 | `GetQuote`, `ShipOrder` |
| **CurrencyService** | Currency conversion | 7000 | `GetSupportedCurrencies`, `Convert` |
| **PaymentService** | Payment processing | 50051 | `Charge` |
| **EmailService** | Email notifications | 5000 | `SendOrderConfirmation` |
| **CheckoutService** | Order placement | 5050 | `PlaceOrder` |
| **AdService** | Contextual advertising | 9555 | `GetAds` |

### 🔄 How gRPC Works in This Project

1. **Proto Definition** → `hipstershop.proto` defines the API contract
2. **Code Generation** → Protocol Buffer compiler generates Python classes
3. **Client Usage** → `agent.py` uses generated stubs to call microservices
4. **Data Flow** → Messages are serialized/deserialized automatically

### 💡 Example gRPC Usage

```python
# In agent.py - How gRPC clients are used
def _get_cart_client():
    channel = grpc.insecure_channel('localhost:7070')
    return CartServiceStub(channel)  # Generated from .proto

def get_cart(user_id: str):
    client = _get_cart_client()
    request = GetCartRequest(user_id=user_id)  # Generated message type
    response = client.GetCart(request)  # gRPC call
    return _cart_to_dict(response)  # Convert to Python dict
```

### 🔧 Regenerating gRPC Files (if needed)

If you modify `hipstershop.proto`, regenerate the Python files:

```bash
# Install gRPC tools
pip install grpcio-tools

# Generate Python classes
python -m grpc_tools.protoc \
  --proto_path=botiq_ai_assist \
  --python_out=botiq_ai_assist \
  --grpc_python_out=botiq_ai_assist \
  botiq_ai_assist/hipstershop.proto
```

### 🎯 Why gRPC?

- **Performance** - Binary serialization, faster than JSON
- **Type Safety** - Strongly typed message definitions
- **Language Agnostic** - Services can be written in any language
- **Code Generation** - Automatic client/server stub generation
- **Streaming** - Supports real-time bidirectional streaming

### 📚 Understanding Message Types

Common message types used throughout the application:

```protobuf
// Product information
message Product {
    string id = 1;
    string name = 2;
    string description = 3;
    string picture = 4;
    Money price_usd = 5;
    repeated string categories = 6;
}

// Shopping cart item
message CartItem {
    string product_id = 1;
    int32 quantity = 2;
}

// Money representation
message Money {
    string currency_code = 1;
    int64 units = 2;
    int32 nanos = 3;
}
```

This gRPC architecture enables the AI agent to seamlessly integrate with all microservices, providing a complete e-commerce experience!

### Test Data

Pre-configured for easy demos:
- **User ID:** arjun
- **Credit Card:** 4432801234567890 (test card)
- **Shipping Address:** 1600 Amphitheatre Parkway, Mountain View, CA
- **Email:** arjun@test.com

## 🔄 Production Deployment to GKE

### Prerequisites for GKE Deployment

1. **GKE Cluster** with Online Boutique services running
2. **Docker Desktop** running locally
3. **gcloud CLI** configured
4. **kubectl** configured for your cluster

### 🚀 Enhanced One-Command Deployment (Recommended)

**Complete deployment preparation and execution:**
```bash
export PROJECT_ID="your-project-id"
./prepare_deploy.sh
```

This script automatically:
- ✅ Switches gRPC URLs to Kubernetes mode
- ✅ Stops local development services
- ✅ Builds Docker images with correct platform (linux/amd64)
- ✅ Pushes images to Google Container Registry
- ✅ Deploys to Kubernetes with rolling updates
- ✅ Waits for deployments to complete
- ✅ Shows access information and useful commands

### ⚙️ Manual Deployment (Alternative)

1. **Set your Google Cloud Project:**
```bash
export PROJECT_ID="vertex-ai-experminent"  # Replace with your project ID
gcloud config set project $PROJECT_ID
```

2. **Switch to Kubernetes mode:**
```bash
./toggle_grpc_urls.sh k8s
```

3. **Enable required services:**
```bash
gcloud services enable cloudbuild.googleapis.com containerregistry.googleapis.com
```

4. **Get cluster credentials:**
```bash
gcloud container clusters get-credentials boutique-cluster --region=us-central1
```

5. **Build and deploy:**
```bash
# Build and push images
docker build --platform linux/amd64 -f Dockerfile.backend -t gcr.io/$PROJECT_ID/boutique-ai-backend:latest .
docker push gcr.io/$PROJECT_ID/boutique-ai-backend:latest

docker build --platform linux/amd64 -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/boutique-ai-frontend:latest .
docker push gcr.io/$PROJECT_ID/boutique-ai-frontend:latest

# Deploy to cluster
kubectl rollout restart deployment boutique-ai-backend
kubectl rollout restart deployment boutique-ai-frontend
```

6. **Check deployment status:**
```bash
# Check pods
kubectl get pods | grep boutique-ai

# Check services
kubectl get services | grep boutique-ai

# Get external IP
kubectl get ingress boutique-ai-ingress
```

### Accessing Your Deployed Application

Once deployed, your Boutique AI Assistant will be available at the external LoadBalancer IP:

```bash
# Get the external IP
EXTERNAL_IP=$(kubectl get service boutique-ai-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Boutique AI Assistant: http://$EXTERNAL_IP"
```

### Production Architecture

The deployed application uses:
- **Frontend**: React app served by nginx with API proxy
- **Backend**: Python FastAPI with AI agent
- **Services**: All 9 Online Boutique microservices
- **Networking**: Kubernetes service discovery with full FQDNs

```
User → LoadBalancer → Frontend (nginx) → {
  Static React files
  /api/* → Backend Service → Boutique Microservices
}
```

## 🛠️ Development

### File Structure
```
botiq-ai-assist/
├── botiq_ai_assist/           # Python backend
│   ├── agent.py              # AI agent with 9 microservice tools
│   └── hipstershop_pb2*.py   # gRPC service definitions
├── frontend/                 # React frontend
│   └── src/
│       ├── components/       # React components
│       ├── services/         # API integration
│       └── index.css        # Global styles
├── k8s/                      # Kubernetes manifests
├── custom_adk_app.py         # FastAPI server
├── toggle_grpc_urls.sh       # Smart gRPC URL switching
├── start_local_dev.sh        # Enhanced local development
├── stop_local_dev.sh         # Stop all local services
├── prepare_deploy.sh         # One-command deployment
└── start_*.sh               # Legacy utility scripts
```

### 🔧 Enhanced Development Scripts

#### **toggle_grpc_urls.sh** - Smart URL Management
```bash
./toggle_grpc_urls.sh status    # Check current configuration
./toggle_grpc_urls.sh local     # Switch to localhost for development
./toggle_grpc_urls.sh k8s       # Switch to Kubernetes for deployment
./toggle_grpc_urls.sh help      # Show detailed help
```

**Features:**
- ✅ Automatic backup creation (`agent.py.backup`)
- ✅ Intelligent mode detection
- ✅ Colorized output with clear status
- ✅ Safe switching with validation

#### **start_local_dev.sh** - All-in-One Development
```bash
./start_local_dev.sh           # Start everything automatically
# Ctrl+C to stop all services
```

**What it does:**
- 🔧 Configures gRPC URLs for localhost
- 🔌 Starts port forwarding to all microservices
- 📦 Installs frontend dependencies if needed
- 🐍 Starts Python backend with monitoring
- ⚛️ Starts React frontend with hot reload
- 🧹 Unified cleanup on exit

#### **prepare_deploy.sh** - Production Deployment
```bash
export PROJECT_ID="your-project-id"
./prepare_deploy.sh            # Deploy everything to GKE
```

**Automated deployment process:**
- ☸️ Switches to Kubernetes mode
- 🛑 Stops local development services
- 🐳 Builds Docker images (linux/amd64)
- ☁️ Pushes to Google Container Registry
- 🚀 Deploys with rolling updates
- ⏳ Waits for deployment completion
- 🌐 Shows access URLs and commands

### API Endpoints

- `POST /api/session` - Create new chat session
- `POST /api/chat` - Send message to AI agent  
- `GET /api/products/{product_id}` - Get product details for order confirmation
- `GET /health` - Health check for Kubernetes
- `GET /docs` - API documentation (Swagger UI)

### Stopping Services

**Enhanced (Recommended):**
```bash
./stop_local_dev.sh           # Stop all services and cleanup
```

**Legacy:**
```bash
./stop_services.sh            # Stop individual services
./kill_port_forwards.sh       # Stop only port-forwarding
```

### Development Workflow Best Practices

**🏠 Local Development:**
```bash
./start_local_dev.sh          # One command to start everything
# Develop and test...
./stop_local_dev.sh           # Clean shutdown
```

**🚀 Production Deployment:**
```bash
export PROJECT_ID="your-project-id"
./prepare_deploy.sh           # One command to deploy
```

**🔄 Switching Between Environments:**
```bash
./toggle_grpc_urls.sh status  # Check current mode
./toggle_grpc_urls.sh local   # Switch to local development
./toggle_grpc_urls.sh k8s     # Switch to production deployment
```