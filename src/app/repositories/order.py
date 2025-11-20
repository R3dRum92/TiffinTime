from typing import List
from uuid import UUID
from datetime import datetime

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger


async def create_order(
    client: AsyncClient, 
    order_data: schemas.OrderRequest
) -> schemas.OrderCreateResponse:
    """Create a new order in the database"""
    
    # Calculate total price
    total_price = order_data.unit_price * order_data.quantity
    
    # Prepare order data - match exact column names from your schema
    order_dict = {
        "user_id": str(order_data.user_id),
        "vendor_id": str(order_data.vendor_id),
        "menu": str(order_data.menu_id),
        "order_date": datetime.now().isoformat(),
        "Quantity": order_data.quantity,
        "unit price": order_data.unit_price,
        "total price": total_price,
        "pickup": order_data.pickup,
        "is_delivered": False,  # Add this - new orders are not delivered
    }
    
    try:
        # Insert order into database
        response = await client.table("orders").insert(order_dict).execute()
        
        if not response.data:
            logger.error("Failed to create order - no data returned")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order"
            )
        
        created_order = response.data[0]
        
        logger.info(f"Order created successfully: {created_order.get('order_id')}")
        
        return schemas.OrderCreateResponse(
            success=True,
            message="Order placed successfully",
            order_id=created_order.get("order_id")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


async def get_user_orders(
    client: AsyncClient, 
    user_id: UUID
) -> List[schemas.OrderResponse]:
    """Get all orders for a specific user"""
    
    try:
        response = (
            await client.table("orders")
            .select("*")
            .eq("user_id", str(user_id))
            .order("order_date", desc=True)
            .execute()
        )
        
        orders = []
        for order in response.data:
            orders.append(
                schemas.OrderResponse(
                    id=order.get("order_id"),
                    user_id=order.get("user_id"),
                    vendor_id=order.get("vendor_id"),
                    menu_id=order.get("menu"),
                    order_date=order.get("order_date"),
                    quantity=order.get("Quantity"),
                    unit_price=order.get("unit price"),
                    total_price=order.get("total price"),
                    pickup=order.get("pickup"),
                    is_delivered=order.get("is_delivered", False),  # Add this
                )
            )
        
        return orders
        
    except Exception as e:
        logger.error(f"Failed to fetch user orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )


# Add new function to update order delivery status
async def update_order_status(
    client: AsyncClient,
    order_id: UUID,
    status_update: schemas.OrderStatusUpdate
) -> schemas.BaseResponse:
    """Update the delivery status of an order"""
    
    try:
        # Update order status
        response = (
            await client.table("orders")
            .update({"is_delivered": status_update.is_delivered})
            .eq("order_id", str(order_id))
            .execute()
        )
        
        if not response.data:
            logger.error(f"Order not found: {order_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        logger.info(f"Order status updated: {order_id} - delivered: {status_update.is_delivered}")
        
        return schemas.BaseResponse(
            message=f"Order status updated to {'delivered' if status_update.is_delivered else 'pending'}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update order status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(e)}"
        )


# Add function to get vendor orders (for vendors to see their orders)
async def get_vendor_orders(
    client: AsyncClient,
    vendor_id: UUID,
    delivered: bool | None = None
) -> List[schemas.OrderResponse]:
    """Get all orders for a specific vendor, optionally filter by delivery status"""
    
    try:
        query = (
            client.table("orders")
            .select("*")
            .eq("vendor_id", str(vendor_id))
        )
        
        # Filter by delivery status if specified
        if delivered is not None:
            query = query.eq("is_delivered", delivered)
        
        response = await query.order("order_date", desc=True).execute()
        
        orders = []
        for order in response.data:
            orders.append(
                schemas.OrderResponse(
                    id=order.get("order_id"),
                    user_id=order.get("user_id"),
                    vendor_id=order.get("vendor_id"),
                    menu_id=order.get("menu"),
                    order_date=order.get("order_date"),
                    quantity=order.get("Quantity"),
                    unit_price=order.get("unit price"),
                    total_price=order.get("total price"),
                    pickup=order.get("pickup"),
                    is_delivered=order.get("is_delivered", False),
                )
            )
        
        return orders
        
    except Exception as e:
        logger.error(f"Failed to fetch vendor orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch vendor orders: {str(e)}"
        )