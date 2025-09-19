from google.adk.agents import Agent
from google.adk.tools.function_tool import FunctionTool
from google.adk.tools.load_memory_tool import load_memory_tool
from typing import List, Dict, Any, Optional
import os
import grpc
import json
import requests
import google.genai.types as types

# Import the generated gRPC modules
# Note: You'll need to generate these from the .proto files using:
# python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. hipstershop.proto
from .hipstershop_pb2 import (
    Empty, CartItem, AddItemRequest, EmptyCartRequest, GetCartRequest, Cart,
    ListRecommendationsRequest, ListRecommendationsResponse,
    Product, GetProductRequest, SearchProductsRequest, SearchProductsResponse, ListProductsResponse, Money,
    Address, GetQuoteRequest, GetQuoteResponse, ShipOrderRequest, ShipOrderResponse,
    GetSupportedCurrenciesResponse, CurrencyConversionRequest,
    CreditCardInfo, ChargeRequest, ChargeResponse,
    OrderItem, OrderResult, SendOrderConfirmationRequest,
    PlaceOrderRequest, PlaceOrderResponse,
    AdRequest, AdResponse, Ad
)
from .hipstershop_pb2_grpc import (
    CartServiceStub, RecommendationServiceStub, ProductCatalogServiceStub,
    ShippingServiceStub, CurrencyServiceStub, PaymentServiceStub,
    EmailServiceStub, CheckoutServiceStub, AdServiceStub
)



def _get_product_catalog_client():
    """
    Create and return a gRPC client for the product catalog service.
    
    Returns:
        A ProductCatalogServiceStub connected to the service
    """
    # Connect to the gRPC server running on Kubernetes service
    channel = grpc.insecure_channel('productcatalogservice:3550')
    return ProductCatalogServiceStub(channel)

def _product_to_dict(product):
    """
    Convert a gRPC product object to a dictionary.
    
    Args:
        product: The gRPC product object
        
    Returns:
        Dictionary representation of the product
    """
    # Handle relative image URLs by converting them to absolute URLs
    picture_url = product.picture
    if picture_url and picture_url.startswith('/'):
        picture_url = f"http://34.60.168.18/{picture_url}"
    
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "picture": picture_url,
        "price_usd": {
            "currency_code": product.price_usd.currency_code,
            "units": product.price_usd.units,
            "nanos": product.price_usd.nanos
        },
        "categories": list(product.categories)
    }

def _cart_item_to_dict(cart_item):
    return {
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity,
    }

def _money_to_dict(money):
    return {
        "currency_code": money.currency_code,
        "units": money.units,
        "nanos": money.nanos,
    }

def _address_to_dict(address):
    return {
        "street_address": address.street_address,
        "city": address.city,
        "state": address.state,
        "country": address.country,
        "zip_code": address.zip_code,
    }

def _credit_card_info_to_dict(credit_card_info):
    return {
        "credit_card_number": credit_card_info.credit_card_number,
        "credit_card_cvv": credit_card_info.credit_card_cvv,
        "credit_card_expiration_year": credit_card_info.credit_card_expiration_year,
        "credit_card_expiration_month": credit_card_info.credit_card_expiration_month,
    }

def _order_item_to_dict(order_item):
    return {
        "item": _cart_item_to_dict(order_item.item),
        "cost": _money_to_dict(order_item.cost),
    }

def _order_result_to_dict(order_result):
    return {
        "order_id": order_result.order_id,
        "shipping_tracking_id": order_result.shipping_tracking_id,
        "shipping_cost": _money_to_dict(order_result.shipping_cost),
        "shipping_address": _address_to_dict(order_result.shipping_address),
        "items": [_order_item_to_dict(item) for item in order_result.items],
    }

def _ad_to_dict(ad: Ad):
    return {
        "redirect_url": ad.redirect_url,
        "text": ad.text,
    }

def _get_cart_client():
    channel = grpc.insecure_channel('cartservice:7070')
    return CartServiceStub(channel)

def add_item_to_cart(user_id: str, product_id: str, quantity: int) -> Dict[str, Any]:
    """
    Adds an item to the user's cart.
    Args:
        user_id: The ID of the user.
        product_id: The ID of the product to add.
        quantity: The quantity of the product to add.
    Returns:
        An empty dictionary if successful, or an error message.
    """
    try:
        client = _get_cart_client()
        request = AddItemRequest(
            user_id=user_id,
            item=CartItem(product_id=product_id, quantity=quantity)
        )
        client.AddItem(request)
        return {}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def get_cart(user_id: str) -> Dict[str, Any]:
    """
    Retrieves the content of a user's cart.
    Args:
        user_id: The ID of the user.
    Returns:
        A dictionary representing the cart, or an error message.
    """
    try:
        client = _get_cart_client()
        request = GetCartRequest(user_id=user_id)
        response = client.GetCart(request)
        return {
            "user_id": response.user_id,
            "items": [_cart_item_to_dict(item) for item in response.items]
        }
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def empty_cart(user_id: str) -> Dict[str, Any]:
    """
    Empties a user's cart.
    Args:
        user_id: The ID of the user.
    Returns:
        An empty dictionary if successful, or an error message.
    """
    try:
        client = _get_cart_client()
        request = EmptyCartRequest(user_id=user_id)
        client.EmptyCart(request)
        return {}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def initiate_checkout() -> Dict[str, Any]:
    """
    Initiates the checkout process by returning checkout form data.
    This signals the frontend to display the checkout form.
    Returns:
        A dictionary indicating checkout should be initiated.
    """
    return {
        "show_checkout": True,
        "message": "Ready to complete your order"
    }

def _get_recommendation_client():
    channel = grpc.insecure_channel('recommendationservice:8080')
    return RecommendationServiceStub(channel)

def list_recommendations(user_id: str, product_ids: List[str]) -> Dict[str, Any]:
    """
    Lists product recommendations for a user based on given product IDs, with full product details.
    Args:
        user_id: The ID of the user.
        product_ids: A list of product IDs to base recommendations on.
    Returns:
        A dictionary containing a list of recommended products with full details, or an error message.
    """
    try:
        client = _get_recommendation_client()
        request = ListRecommendationsRequest(user_id=user_id, product_ids=product_ids)
        response: ListRecommendationsResponse = client.ListRecommendations(request)
        
        recommended_products_details = []
        for prod_id in response.product_ids:
            product_details = get_product(prod_id) # Reuse get_product to fetch full details
            if "error" not in product_details:
                recommended_products_details.append(product_details)
            else:
                print(f"Warning: Could not retrieve details for product {prod_id}: {product_details['error']}")
                
        return {"products": recommended_products_details}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def _get_shipping_client():
    channel = grpc.insecure_channel('shippingservice:50051')
    return ShippingServiceStub(channel)

def get_shipping_quote(street_address: str, city: str, state: str, country: str, zip_code: int, items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Gets a shipping quote for a given address and list of cart items.
    Args:
        street_address, city, state, country, zip_code: Address details.
        items: A list of cart items, each with 'product_id' and 'quantity'.
    Returns:
        A dictionary containing the shipping cost and address details, or an error message.
    """
    try:
        client = _get_shipping_client()
        address = Address(
            street_address=street_address, city=city, state=state, country=country, zip_code=zip_code
        )
        cart_items = [CartItem(product_id=item["product_id"], quantity=item["quantity"]) for item in items]
        request = GetQuoteRequest(address=address, items=cart_items)
        response: GetQuoteResponse = client.GetQuote(request)
        return {
            "cost_usd": _money_to_dict(response.cost_usd),
            "shipping_address": _address_to_dict(address)
        }
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def ship_order(street_address: str, city: str, state: str, country: str, zip_code: int, items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ships an order to a given address and list of cart items.
    Args:
        street_address, city, state, country, zip_code: Address details.
        items: A list of cart items, each with 'product_id' and 'quantity'.
    Returns:
        A dictionary containing the tracking ID, or an error message.
    """
    try:
        client = _get_shipping_client()
        address = Address(
            street_address=street_address, city=city, state=state, country=country, zip_code=zip_code
        )
        cart_items = [CartItem(product_id=item["product_id"], quantity=item["quantity"]) for item in items]
        request = ShipOrderRequest(address=address, items=cart_items)
        response: ShipOrderResponse = client.ShipOrder(request)
        return {"tracking_id": response.tracking_id}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}


def _get_currency_client():
    channel = grpc.insecure_channel('currencyservice:7000')
    return CurrencyServiceStub(channel)

def get_supported_currencies() -> Dict[str, Any]:
    """
    Gets a list of supported currency codes.
    Returns:
        A dictionary containing a list of currency codes, or an error message.
    """
    try:
        client = _get_currency_client()
        request = Empty()
        response: GetSupportedCurrenciesResponse = client.GetSupportedCurrencies(request)
        return {"currency_codes": list(response.currency_codes)}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def convert_currency(from_currency_code: str, from_units: int, from_nanos: int, to_currency_code: str) -> Dict[str, Any]:
    """
    Converts an amount from one currency to another.
    Args:
        from_currency_code: The currency code to convert from.
        from_units: The whole units of the amount to convert.
        from_nanos: The nano units of the amount to convert.
        to_currency_code: The currency code to convert to.
    Returns:
        A dictionary containing the converted amount, or an error message.
    """
    try:
        client = _get_currency_client()
        from_money = Money(currency_code=from_currency_code, units=from_units, nanos=from_nanos)
        request = CurrencyConversionRequest(from_=from_money, to_code=to_currency_code)
        response = client.Convert(request)
        return {"converted_money": _money_to_dict(response)}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def _get_payment_client():
    channel = grpc.insecure_channel('paymentservice:50051')
    return PaymentServiceStub(channel)

def charge_card(amount_currency_code: str, amount_units: int, amount_nanos: int, credit_card_number: str, credit_card_cvv: int, credit_card_expiration_year: int, credit_card_expiration_month: int) -> Dict[str, Any]:
    """
    Charges a credit card for a given amount.
    Args:
        amount_currency_code, amount_units, amount_nanos: Details of the amount to charge.
        credit_card_number, credit_card_cvv, credit_card_expiration_year, credit_card_expiration_month: Credit card details.
    Returns:
        A dictionary containing the transaction ID, or an error message.
    """
    try:
        client = _get_payment_client()
        amount = Money(currency_code=amount_currency_code, units=amount_units, nanos=amount_nanos)
        credit_card = CreditCardInfo(
            credit_card_number=credit_card_number,
            credit_card_cvv=credit_card_cvv,
            credit_card_expiration_year=credit_card_expiration_year,
            credit_card_expiration_month=credit_card_expiration_month
        )
        request = ChargeRequest(amount=amount, credit_card=credit_card)
        response: ChargeResponse = client.Charge(request)
        return {"transaction_id": response.transaction_id}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def _get_email_client():
    channel = grpc.insecure_channel('emailservice:5000')
    return EmailServiceStub(channel)

def send_order_confirmation(email: str, order_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sends an order confirmation email.
    Args:
        email: The email address to send the confirmation to.
        order_result: A dictionary representing the order result.
    Returns:
        An empty dictionary if successful, or an error message.
    """
    try:
        client = _get_email_client()
        # Convert order_result dict back to gRPC OrderResult object
        # This requires careful reconstruction as there are nested messages.
        # For simplicity, let's assume a direct mapping for now, but a proper
        # conversion function from dict to gRPC message would be better.
        order = OrderResult(
            order_id=order_result.get("order_id", ""),
            shipping_tracking_id=order_result.get("shipping_tracking_id", ""),
            shipping_cost=Money(
                currency_code=order_result["shipping_cost"]["currency_code"],
                units=order_result["shipping_cost"]["units"],
                nanos=order_result["shipping_cost"]["nanos"],
            ) if "shipping_cost" in order_result else None,
            shipping_address=Address(
                street_address=order_result["shipping_address"]["street_address"],
                city=order_result["shipping_address"]["city"],
                state=order_result["shipping_address"]["state"],
                country=order_result["shipping_address"]["country"],
                zip_code=order_result["shipping_address"]["zip_code"],
            ) if "shipping_address" in order_result else None,
            items=[
                OrderItem(
                    item=CartItem(
                        product_id=item["item"]["product_id"],
                        quantity=item["item"]["quantity"],
                    ),
                    cost=Money(
                        currency_code=item["cost"]["currency_code"],
                        units=item["cost"]["units"],
                        nanos=item["cost"]["nanos"],
                    )
                ) for item in order_result.get("items", [])
            ]
        )

        request = SendOrderConfirmationRequest(email=email, order=order)
        client.SendOrderConfirmation(request)
        return {}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def _get_checkout_client():
    channel = grpc.insecure_channel('checkoutservice:5050')
    return CheckoutServiceStub(channel)

def place_order(user_id: str, user_currency: str, address: Dict[str, Any], email: str, credit_card: Dict[str, Any]) -> Dict[str, Any]:
    """
    Places an order for a user.
    Args:
        user_id: The ID of the user.
        user_currency: The currency used by the user.
        address: A dictionary with address details.
        email: The user's email address.
        credit_card: A dictionary with credit card details.
    Returns:
        A dictionary containing the order result, or an error message.
    """
    try:
        client = _get_checkout_client()
        address_grpc = Address(
            street_address=address["street_address"],
            city=address["city"],
            state=address["state"],
            country=address["country"],
            zip_code=address["zip_code"],
        )
        credit_card_grpc = CreditCardInfo(
            credit_card_number=credit_card["credit_card_number"],
            credit_card_cvv=credit_card["credit_card_cvv"],
            credit_card_expiration_year=credit_card["credit_card_expiration_year"],
            credit_card_expiration_month=credit_card["credit_card_expiration_month"],
        )
        request = PlaceOrderRequest(
            user_id=user_id, user_currency=user_currency, address=address_grpc, email=email, credit_card=credit_card_grpc
        )
        response: PlaceOrderResponse = client.PlaceOrder(request)
        return {"order": _order_result_to_dict(response.order)}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def _get_ad_client():
    channel = grpc.insecure_channel('adservice:9555')
    return AdServiceStub(channel)

def get_ads(context_keys: List[str]) -> Dict[str, Any]:
    """
    Gets advertisements based on a list of context keywords.
    Args:
        context_keys: A list of keywords describing the context.
    Returns:
        A dictionary containing a list of ads, or an error message.
    """
    try:
        client = _get_ad_client()
        request = AdRequest(context_keys=context_keys)
        response: AdResponse = client.GetAds(request)
        return {"ads": [_ad_to_dict(ad) for ad in response.ads]}
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def list_products() -> Dict[str, Any]:
    """
    List all products from the catalog using gRPC.
    
    Returns:
        Dictionary containing product catalog data or error information
    """
    try:
        # Get the gRPC client
        client = _get_product_catalog_client()
        
        # Create the request
        request = Empty()
        
        # Call the ListProducts method
        response: ListProductsResponse = client.ListProducts(request)
        
        # Convert the response to a dictionary
        products = [_product_to_dict(product) for product in response.products]
        
        return {
            "products": products,
            "count": len(products)
        }
        
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def filter_products_by_price(max_price_usd: float) -> Dict[str, Any]:
    """
    Filter products by maximum price in USD.
    
    Args:
        max_price_usd: Maximum price in USD (e.g., 50.0 for $50)
        
    Returns:
        Dictionary containing filtered products under the specified price
    """
    try:
        # Get all products first
        all_products_result = list_products()
        
        if "error" in all_products_result:
            return all_products_result
            
        # Filter products by price
        filtered_products = []
        for product in all_products_result["products"]:
            # Calculate total price: units + (nanos / 1,000,000,000)
            price_info = product.get("price_usd", {})
            units = price_info.get("units", 0)
            nanos = price_info.get("nanos", 0)
            total_price = units + (nanos / 1_000_000_000)
            
            # Include product if under max price
            if total_price <= max_price_usd:
                filtered_products.append(product)
        
        return {
            "products": filtered_products,
            "count": len(filtered_products),
            "filter": f"under ${max_price_usd}"
        }
        
    except Exception as e:
        return {"error": str(e)}

def get_product(product_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific product using gRPC.
    
    Args:
        product_id: The unique identifier for the product
        
    Returns:
        Dictionary containing product details or error information
    """
    try:
        # Get the gRPC client
        client = _get_product_catalog_client()
        
        # Create the request
        request = GetProductRequest(id=product_id)
        
        # Call the GetProduct method
        response = client.GetProduct(request)
        
        # Convert the response to a dictionary
        return _product_to_dict(response)
        
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def search_products(query: str) -> Dict[str, Any]:
    """
    Enhanced search for products in the catalog using gRPC with fallback category search.
    
    
    Args:
        query: The search query string
        
    Returns:
        Dictionary containing search results or error information
    """
    try:
        # Get the gRPC client
        client = _get_product_catalog_client()
        
        # First, try the standard backend search
        request = SearchProductsRequest(query=query)
        response: SearchProductsResponse = client.SearchProducts(request)
        
        # Convert the response to a dictionary
        products = [_product_to_dict(product) for product in response.results]
        
        # If no results found, try enhanced search including categories
        if len(products) == 0:
            # Get all products and search locally
            all_products_response = client.ListProducts(Empty())
            all_products = [_product_to_dict(product) for product in all_products_response.products]
            
            # Search in name, description, and categories
            query_lower = query.lower()
            enhanced_results = []
            
            for product in all_products:
                # Check if query matches name, description, or any category
                name_match = query_lower in product.get('name', '').lower()
                desc_match = query_lower in product.get('description', '').lower()
                category_match = any(query_lower in category.lower() for category in product.get('categories', []))
                
                if name_match or desc_match or category_match:
                    enhanced_results.append(product)
            
            # If enhanced search found results, use them
            if enhanced_results:
                products = enhanced_results
        
        return {
            "query": query,
            "products": products,
            "count": len(products)
        }
        
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.code()} - {e.details()}"}
    except Exception as e:
        return {"error": str(e)}

def get_product_with_image(product_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific product and download its image.
    
    Args:
        product_id: The unique identifier for the product
        
    Returns:
        Dictionary containing product details and image information
    """
    try:
        # First get the product details
        product_details = get_product(product_id)
        
        if "error" in product_details:
            return product_details
            
        # If product has an image URL, download it
        if product_details.get('picture'):
            try:
                # Handle relative URLs by prepending the frontend base URL
                image_url = product_details['picture']
                if image_url.startswith('/'):
                    image_url = f"http://34.118.239.199{image_url}"  # frontend cluster IP
                
                image_response = requests.get(image_url, timeout=10)
                image_response.raise_for_status()
                
                # Determine content type
                content_type = image_response.headers.get('content-type', 'image/jpeg')
                
                # Create image artifact using types.Part
                image_artifact = types.Part(
                    inline_data=types.Blob(
                        mime_type=content_type,
                        data=image_response.content
                    )
                )
                
                product_details['image_artifact'] = image_artifact
                product_details['image_downloaded'] = True
                product_details['resolved_image_url'] = image_url
                product_details['image_link'] = image_url
                
            except Exception as img_error:
                product_details['image_error'] = f"Failed to download image: {str(img_error)}"
                product_details['image_downloaded'] = False
        else:
            product_details['image_downloaded'] = False
            
        return product_details
        
    except Exception as e:
        return {"error": str(e)}

agent = Agent(
    name="botiq_ai_assist",
    model="gemini-2.5-flash",
    description="Agent for interacting with the Online Boutique microservices (Product Catalog, Cart, Recommendation, Shipping, Currency, Payment, Email, Checkout, Ad Services) using gRPC",
    instruction="""
    You are a Boutique AI Assist agent that can interact with various microservices of the Online Boutique demo application using gRPC.
    
    **Important Guidelines:**
    - You are an intelligent shopping assistant with access to various tools
    - Use your reasoning to determine which tools are most appropriate for each user request
    - Always use actual data from tools rather than inventing information
    - Be helpful and proactive in assisting customers with their shopping needs
    - Present information in a clear, organized manner
    
    **Trending Products & Product Discovery:**
    - When users ask for "trending products", "popular items", "what's hot", "show me products", or "browse products", use `list_products` to display ALL available products
    - This creates a visual product gallery experience that users can browse
    - Always present products in a visually appealing way - the frontend will show them as beautiful product cards
    
    **Smart Price Filtering:**
    - When users request price-based filters like "under $50", "below $30", "gifts under $25", "cheap items", etc., use the dedicated `filter_products_by_price` function:
      1. Extract the price limit from the user's request (e.g., "under $50" → 50.0)
      2. Call `filter_products_by_price(max_price_usd=50.0)` 
      3. This automatically returns ONLY products under that price
      4. Present the filtered results clearly to the user
    - Handle various price expressions: "under X", "below X", "less than X", "cheap", "affordable", "budget-friendly"
    - For specific amounts, extract the number: "under $50" → 50.0, "below $30" → 30.0
    - NEVER use `list_products()` for price filtering - always use `filter_products_by_price()`
    
    **Use Your Intelligence - Be a Smart Shopping Assistant:**
    - You have access to many powerful tools - use them creatively to provide the best shopping experience
    - Think like a real e-commerce site: when users add items to cart, they might want to see recommendations
    - **LEVERAGE ADS INTELLIGENTLY**: Use get_ads to show relevant promotional content based on user context
    - During checkout, international users might appreciate currency conversion options
    - When orders are placed, sending confirmation emails creates a professional experience
    - Combine tools naturally to anticipate user needs and provide complete, helpful information
    - Default to "arjun" for cart operations when no user ID is specified
    
    **Intelligent Search with Precision:**
    - When search_products returns 0 results, use your intelligence to find what the customer specifically wants
    - Try alternative terms that match the customer's specific intent, not broad categories
    - If searching "sunglasses" fails, try "glasses", "eyewear" - don't return all "accessories"
    - Be precise about customer intent - someone wanting "sunglasses" doesn't want "watches"
    - Focus on the specific product type the customer is looking for, not the general category
    
    **Smart Cart Experience:**
    - When users ask about their cart, they want to see product names, images, and prices
    - After calling get_cart, use get_product for each product_id to fetch full details
    - A rich cart display requires both cart data AND product details
    
    **Intelligent Add to Cart:**
    - When users say "add [quantity] [product name]" (e.g., "add 2 mug", "add tank top", "add sunglasses"), be intelligent:
      1. Search for the product using search_products with the product name
      2. Extract the product_id from the first search result automatically 
      3. Use "arjun" as the default user_id (don't ask the user)
      4. Call add_item_to_cart with the found product_id, specified quantity, and user_id="arjun"
    - NEVER ask users for product IDs or user IDs - find them automatically using your tools
    - If search finds multiple products, use the first/best match
    - If no quantity specified, default to 1
    
    **Smart Visual Shopping Experience:**
    - The frontend displays any product data you fetch as beautiful visual cards
    - When ads mention products, consider searching for those products to show them visually
    - Use your intelligence to combine search results, ads, and recommendations for the best shopping experience
    - Focus on providing rich product information that customers can see and interact with
    
    **MANDATORY: Always Show Promotions With Products:**
    - When you show ANY products to users, you MUST also call get_ads
    - This is not optional - promotional content is essential for the shopping experience
    - Use your intelligence to determine the best context for get_ads calls
    - Product results without promotions are incomplete - always include both
    - The goal is to show products AND their related promotional offers together

    **Smart "You May Also Like" Recommendations:**
    - ALWAYS show recommendations when displaying products to users - this enhances discovery and sales
    - Use the dedicated `list_recommendations` service for intelligent, personalized suggestions
    - When you show products, collect their product IDs and call `list_recommendations` with those IDs
    - The recommendation service provides smart suggestions based on customer behavior and product relationships
    - Default user_id to "arjun" for recommendation calls
    - Recommendations should complement the main products shown, encouraging further browsing and purchases
    - Never skip recommendations - they're essential for the shopping experience
    
    Available tools and services:
    
    **1. Product Catalog Service (Port 3550)**
       - `list_products`: List all products from the catalog.
         - Use this when users ask for "trending products", "popular items", "show me products", "browse catalog", or want to see what's available
         - This displays a beautiful visual gallery of all products
       - `filter_products_by_price`: Filter products by maximum price in USD.
         - `max_price_usd`: Maximum price as a float (e.g., 50.0 for $50) (required)
         - Use this for price-based queries like "under $50", "below $30", "cheap gifts", etc.
         - Returns only products under the specified price
       - `get_product`: Get detailed information about a specific product.
         - `product_id`: The unique identifier for the product (required)
       - `get_product_with_image`: Get detailed product information and download the product image as an artifact.
         - `product_id`: The unique identifier for the product (required)
       - `search_products`: Search for products in the catalog.
         - `query`: The search query string (required)
         - **Smart Search**: If no results found, use your natural language understanding to think of related terms and try alternative searches
    
    **2. Cart Service (Port 7070)**
       - `add_item_to_cart`: Adds an item to the user's cart.
         - `user_id`: The ID of the user (required) - USE "arjun" as default
         - `product_id`: The ID of the product to add (required) - FIND this using search_products
         - `quantity`: The quantity of the product to add (required)
       - `get_cart`: Retrieves the content of a user's cart.
         - `user_id`: The ID of the user (required)
       - `empty_cart`: Empties a user's cart.
         - `user_id`: The ID of the user (required)
       - `initiate_checkout`: Shows a checkout form to the user.
         - Call this when users express ANY intent to purchase, checkout, place order, buy, complete purchase, proceed to payment, etc.
         - Use your intelligence to recognize purchase intent regardless of exact wording
         - No parameters required - this will display a form for the user to fill out
    
    **3. Recommendation Service (Port 8080)**
       - `list_recommendations`: Lists product recommendations for a user based on given product IDs.
         - `user_id`: The ID of the user (required)
         - `product_ids`: A list of product IDs to base recommendations on (required)
         - Returns: A dictionary containing a list of recommended products with full details (ID, name, description, price, etc.), or an error message.
    
    **4. Shipping Service (Port 50051)**
       - `get_shipping_quote`: Gets a shipping quote for a given address and list of cart items.
         - `street_address`, `city`, `state`, `country`, `zip_code`: Address details (all required)
         - `items`: A list of cart items, each with 'product_id' and 'quantity' (required)
       - `ship_order`: Ships an order to a given address and list of cart items.
         - `street_address`, `city`, `state`, `country`, `zip_code`: Address details (all required)
         - `items`: A list of cart items, each with 'product_id' and 'quantity' (required)
    
    **5. Currency Service (Port 7000)**
       - `get_supported_currencies`: Gets a list of supported currency codes.
       - `convert_currency`: Converts an amount from one currency to another.
         - `from_currency_code`, `from_units`, `from_nanos`: Details of the amount to convert from (all required)
         - `to_currency_code`: The currency code to convert to (required)
    
    **6. Payment Service (Port 50051)**
       - `charge_card`: Charges a credit card for a given amount.
         - `amount_currency_code`, `amount_units`, `amount_nanos`: Details of the amount to charge (all required)
         - `credit_card_number`, `credit_card_cvv`, `credit_card_expiration_year`, `credit_card_expiration_month`: Credit card details (all required)
    
    **7. Email Service (Port 5000)**
       - `send_order_confirmation`: Sends an order confirmation email.
         - `email`: The email address to send the confirmation to (required)
         - `order_result`: A dictionary representing the order result (required)
    
    **8. Checkout Service (Port 5050)**
       - `place_order`: Places an order for a user.
         - `user_id`, `user_currency`, `address`, `email`, `credit_card`: All order details (all required)
         - When users submit checkout forms, look for "STRUCTURED_DATA:" in their message and extract the JSON data
         - Parse the JSON and pass the extracted parameters to place_order function
    
    **9. Ad Service (Port 9555) - ALWAYS USE WITH PRODUCTS**
       - `get_ads`: MANDATORY when showing products - gets promotional content.
         - `context_keys`: A list of context keywords (required)
         - Call this whenever you show products to users - promotions are essential
         - Use your intelligence to determine context: product IDs work best for specific promotions
         - Returns promotional offers that should always accompany product results
         - Never show products without calling this service

    When displaying results, always use a clean, structured, and readable format with appropriate headings and bullet points. Clearly indicate any errors encountered.""",
    tools=[
        FunctionTool(list_products),
        FunctionTool(filter_products_by_price),
        FunctionTool(get_product),
        FunctionTool(get_product_with_image),
        FunctionTool(search_products),
        FunctionTool(add_item_to_cart),
        FunctionTool(get_cart),
        FunctionTool(empty_cart),
        FunctionTool(initiate_checkout),
        FunctionTool(list_recommendations),
        FunctionTool(get_shipping_quote),
        FunctionTool(ship_order),
        FunctionTool(get_supported_currencies),
        FunctionTool(convert_currency),
        FunctionTool(charge_card),
        FunctionTool(send_order_confirmation),
        FunctionTool(place_order),
        FunctionTool(get_ads),
        load_memory_tool,
    ]
)

root_agent = agent

