"""Module for custom ADK app functionality."""

from typing import Optional, Dict, Any
import asyncio
import base64
import logging
import os
import uuid
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import Google ADK components
from google.genai import types
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# Import agent functions for direct API access
from botiq_ai_assist.agent import get_product

# Enable debug logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# FastAPI app setup
app = FastAPI(
    title="Online Boutique Agent API",
    description="API for interacting with the Online Boutique Agent",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Simple configuration
APP_NAME = "online_boutique_agent"

# Store active sessions
active_sessions = {}  # Dictionary to store session info by client ID

# Pydantic models for request/response validation
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None  # Structured data from tool calls
    
class SessionResponse(BaseModel):
    sessionId: str

class ErrorResponse(BaseModel):
    error: str

# Helper function to create a session service
async def create_session_service():
    """Create a new session service for conversation history"""
    return InMemorySessionService()

def _convert_to_dict(function_result):
    """
    Generically convert any function result to a dictionary.
    Works with any tool response format - no hardcoding!
    """
    try:
        # Handle different response types generically
        if isinstance(function_result, dict):
            return function_result
        elif hasattr(function_result, 'struct_value'):
            # Protobuf struct - convert to dict
            import json
            return json.loads(function_result.json())
        elif hasattr(function_result, '__dict__'):
            # Object with attributes - convert to dict
            return function_result.__dict__
        elif hasattr(function_result, 'to_dict'):
            # Object with to_dict method
            return function_result.to_dict()
        else:
            # Fallback - try to parse as JSON string
            try:
                import json
                return json.loads(str(function_result))
            except:
                # Last resort - return as string
                return {"result": str(function_result)}
    except Exception as e:
        print(f"Error converting function result to dict: {e}")
        return {"error": str(e), "raw_result": str(function_result)}

# Import the agent
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "botiq_ai_assist"))
from botiq_ai_assist.agent import agent

# Health check endpoints (both /health for k8s and /api/health for frontend)
@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes"""
    return {"status": "healthy", "service": "Online Boutique Agent API"}

@app.get("/api/health")
async def api_health_check():
    """API health check endpoint"""
    return {"status": "healthy", "service": "Online Boutique Agent API"}

# Root endpoint - API info
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "BoutiqueAI Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "frontend_url": "http://localhost:3000"
    }

# API endpoints
@app.post("/api/session", response_model=SessionResponse)
async def create_session():
    """Create a new session for the chat interface."""
    # Simply generate and return a client ID
    client_id = str(uuid.uuid4())
    print(f"Created client ID: {client_id}")

    return {"sessionId": client_id}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message and return the agent's response.

    Args:
        request: ChatRequest containing user message and optional session_id

    Returns:
        ChatResponse: Contains agent response

    Raises:
        HTTPException: If message is empty or validation fails
    """
    message = request.message

    if not message:
        raise HTTPException(status_code=400, detail="No message provided")

    try:
        print(f"Processing query: {message}")

        # Create a unique user ID for this request
        client_id = request.sessionId or str(uuid.uuid4())
        user_id = f"boutique_chat_{client_id}_{int(datetime.now().timestamp())}"

        # Create a simple state object
        state = {
            "created_at": datetime.now().isoformat()
        }

        # Create a new session service
        session_service = await create_session_service()

        # Create a session
        session = await session_service.create_session(
            state=state,
            app_name=APP_NAME,
            user_id=user_id
        )

        # Create a runner
        runner = Runner(
            app_name=APP_NAME,
            agent=agent,
            session_service=session_service
        )

        # Create content message
        content = types.Content(role='user', parts=[types.Part(text=message)])

        # Process the response
        response_data = await process_agent_response(runner, session.id, user_id, content)
        
        # Let the LLM make intelligent tool decisions - we'll capture the results from ADK events
        # Note: The ADK should handle tool calling automatically based on the agent's intelligence
                    
        return response_data
    except Exception as e:
        print(f"Error processing message: {e}")
        return {"message": f"Sorry, I encountered an error processing your request: {str(e)}"}

# ============= Response Processing =============
async def process_agent_response(runner, session_id: str, user_id: str, content: types.Content) -> Dict[str, Any]:
    """
    Process agent response and extract text content, artifacts, and structured data from events.

    The ADK runner returns an async stream of events as the agent processes
    the request. This function collects all text content, artifacts, and structured
    data from tool calls.

    Args:
        runner: The configured Runner instance
        session_id: Unique identifier for the conversation session
        user_id: Unique identifier for the user
        content: The query content to send to the agent

    Returns:
        Dict[str, Any]: Extracted text response and structured data from the agent
    """
    response_text = ""  # Accumulate all text content here
    structured_data = {}  # Collect structured data from tool calls

    # Stream events from the agent as it processes the request
    async for event in runner.run_async(session_id=session_id, user_id=user_id, new_message=content):
        # Generically capture ALL tool results from LLM - no assumptions about tool names or formats
        try:
            # Method 1: Check for function responses in event content
            if hasattr(event, 'content') and hasattr(event.content, 'parts'):
                for part in event.content.parts:
                    if hasattr(part, 'function_response') and part.function_response:
                        function_name = part.function_response.name
                        function_result = part.function_response.response
                        converted_result = _convert_to_dict(function_result)
                        
                        # Handle multiple calls to the same function
                        if function_name in structured_data:
                            # If already exists, convert to list or append to existing list
                            if isinstance(structured_data[function_name], list):
                                structured_data[function_name].append(converted_result)
                            else:
                                structured_data[function_name] = [structured_data[function_name], converted_result]
                        else:
                            structured_data[function_name] = converted_result
            
            # Method 2: Check for function responses in candidates
            if hasattr(event, 'candidates'):
                for candidate in event.candidates:
                    if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                        for part in candidate.content.parts:
                            if hasattr(part, 'function_response') and part.function_response:
                                function_name = part.function_response.name
                                function_result = part.function_response.response
                                converted_result = _convert_to_dict(function_result)
                                
                                # Handle multiple calls to the same function
                                if function_name in structured_data:
                                    # If already exists, convert to list or append to existing list
                                    if isinstance(structured_data[function_name], list):
                                        structured_data[function_name].append(converted_result)
                                    else:
                                        structured_data[function_name] = [structured_data[function_name], converted_result]
                                else:
                                    structured_data[function_name] = converted_result
                                
        except Exception as e:
            print(f"Error processing tool result: {e}")

        # SIMPLIFIED: Extract text content - Google ADK uses event.content.parts[].text
        if hasattr(event, 'content') and hasattr(event.content, 'parts'):
            for part in event.content.parts:
                if hasattr(part, 'text') and part.text:
                    response_text += str(part.text)
        # Fallback: Direct text
        elif hasattr(event, 'content') and hasattr(event.content, 'text'):
            response_text += str(event.content.text)

    if not response_text:
        response_text = "I'm here to help with your Online Boutique questions. What would you like to know?"

    return {
        "message": response_text.strip(),  # Remove leading/trailing whitespace
        "data": structured_data if structured_data else None
    }


# Product API endpoint for order confirmation
@app.get("/api/products/{product_id}")
async def get_product_details(product_id: str):
    """Get product details by ID for order confirmation.
    
    Args:
        product_id: The unique identifier for the product
        
    Returns:
        Product details including name, description, image, and price
        
    Raises:
        HTTPException: If product not found or service error
    """
    try:
        print(f"Fetching product details for: {product_id}")
        
        # Call the agent's get_product function directly
        product_result = get_product(product_id)
        
        if "error" in product_result:
            raise HTTPException(status_code=404, detail=f"Product not found: {product_result['error']}")
            
        return product_result
        
    except Exception as e:
        print(f"Error fetching product {product_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch product details: {str(e)}")


