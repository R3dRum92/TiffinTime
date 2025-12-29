from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from supabase import AsyncClient

from app import schemas
from app.repositories import order
from db.supabase import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post(
    "/{vendor_id}/{menu_id}",
    response_model=schemas.OrderCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    order_data: schemas.OrderRequest,
    vendor_id: UUID,
    menu_id: UUID,
    client: AsyncClient = Depends(get_db),
    user: schemas.UserID = Depends(get_current_user),
):
    """Create a new order"""
    return await order.create_order(
        client=client,
        order_data=order_data,
        user_id=user.id,
        vendor_id=vendor_id,
        menu_id=menu_id,
    )


@router.get(
    "/user/{user_id}",
    response_model=List[schemas.OrderResponse],
    status_code=status.HTTP_200_OK,
)
async def get_user_orders(user_id: UUID, client: AsyncClient = Depends(get_db)):
    """Get all orders for a specific user"""
    return await order.get_user_orders(client=client, user_id=user_id)


@router.get(
    "/vendor/{vendor_id}",
    response_model=List[schemas.OrderResponse],
    status_code=status.HTTP_200_OK,
)
async def get_vendor_orders(
    vendor_id: UUID,
    delivered: Optional[bool] = Query(None, description="Filter by delivery status"),
    client: AsyncClient = Depends(get_db),
):
    """Get all orders for a specific vendor, optionally filter by delivery status"""
    return await order.get_vendor_orders(
        client=client, vendor_id=vendor_id, delivered=delivered
    )


@router.patch(
    "/{order_id}/status",
    response_model=schemas.BaseResponse,
    status_code=status.HTTP_200_OK,
)
async def update_order_status(
    order_id: UUID,
    status_update: schemas.OrderStatusUpdate,
    background_tasks: BackgroundTasks,
    client: AsyncClient = Depends(get_db),
):
    """Update the delivery status of an order (for vendors)"""
    return await order.update_order_status(
        client=client,
        order_id=order_id,
        status_update=status_update,
        background_tasks=background_tasks,
    )
