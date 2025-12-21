from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import BackgroundTasks, HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.email import send_delivery_email_resend
from utils.logger import logger


async def create_order(
    client: AsyncClient,
    order_data: schemas.OrderRequest,
    user_id: UUID,
    vendor_id: UUID,
    menu_id: UUID,
) -> schemas.OrderCreateResponse:
    """Create a new order in the database"""

    # Calculate total price
    total_price = order_data.unit_price * order_data.quantity

    # Prepare order data - match exact column names from your schema
    order_dict = {
        "user_id": str(user_id),
        "vendor_id": str(vendor_id),
        "menu": str(menu_id),
        "order_date": datetime.now().isoformat(),
        "quantity": order_data.quantity,
        "unit_price": order_data.unit_price,
        "total_price": total_price,
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
                detail="Failed to create order",
            )

        created_order = response.data[0]

        logger.info(f"Order created successfully: {created_order.get('order_id')}")

        return schemas.OrderCreateResponse(
            success=True,
            message="Order placed successfully",
            order_id=created_order.get("order_id"),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}",
        )


async def get_user_orders(
    client: AsyncClient, user_id: UUID
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
                    quantity=order.get("quantity"),
                    unit_price=order.get("unit_price"),
                    total_price=order.get("total_price"),
                    pickup=order.get("pickup"),
                    is_delivered=order.get("is_delivered", False),  # Add this
                )
            )

        return orders

    except Exception as e:
        logger.error(f"Failed to fetch user orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}",
        )


# Add new function to update order delivery status
async def update_order_status(
    client: AsyncClient,
    order_id: UUID,
    status_update: schemas.OrderStatusUpdate,
    background_tasks: BackgroundTasks,
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
                status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
            )

        updated_order = response.data[0]

        logger.info(
            f"Order status updated: {order_id} - delivered: {status_update.is_delivered}"
        )

        if status_update.is_delivered is True:
            user_id = updated_order.get("user_id")

            if user_id:
                try:
                    user_res = (
                        await client.table("users")
                        .select("email, name")
                        .eq("id", user_id)
                        .single()
                        .execute()
                    )

                    user_data = user_res.data

                    if user_data and user_data.get("email"):
                        background_tasks.add_task(
                            send_delivery_email_resend,
                            email_to=user_data["email"],
                            user_name=user_data.get("name", "Valued Customer"),
                            order_id=str(updated_order.get("order_id", order_id)),
                            pickup=updated_order.get("pickup", "Pickup Point"),
                            total_price=float(updated_order.get("total_price", 0)),
                        )
                    else:
                        logger.warning(f"User {user_id} found but has no email")
                except Exception as fetch_error:
                    logger.error(
                        f"Failed to fetch user for email notification: {fetch_error}"
                    )
            else:
                logger.warning(f"Order {order_id} updated but has no user_id")

        return schemas.BaseResponse(
            message=f"Order status updated to {'delivered' if status_update.is_delivered else 'pending'}"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update order status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(e)}",
        )


# Add function to get vendor orders (for vendors to see their orders)
async def get_vendor_orders(
    client: AsyncClient, vendor_id: UUID, delivered: bool | None = None
) -> List[schemas.OrderResponse]:
    """Get all orders for a specific vendor, optionally filter by delivery status"""

    try:
        query = client.table("orders").select("*").eq("vendor_id", str(vendor_id))

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
                    quantity=order.get("quantity"),
                    unit_price=order.get("unit_price"),
                    total_price=order.get("total_price"),
                    pickup=order.get("pickup"),
                    is_delivered=order.get("is_delivered", False),
                )
            )

        return orders

    except Exception as e:
        logger.error(f"Failed to fetch vendor orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch vendor orders: {str(e)}",
        )


async def link_orders_to_payment(
    db: AsyncClient, order_ids: List[UUID], payment_id: UUID
):
    data, count = (
        await db.table("orders")
        .update({"payment_id": str(payment_id)})
        .in_("order_id", [str(oid) for oid in order_ids])
        .execute()
    )
    return data
