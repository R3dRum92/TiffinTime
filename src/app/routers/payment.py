from fastapi import APIRouter, Depends, Form, Request, status
from fastapi.responses import RedirectResponse
from sslcommerz_lib import SSLCOMMERZ
from supabase import AsyncClient

from app import enums, schemas
from app.repositories.order import link_orders_to_payment
from app.repositories.payment import (
    create_payment,
    create_payment_session,
    get_sslcommerz,
    get_transaction_status_by_session,
    get_transaction_status_by_tranid,
    update_payment_status,
    validate_transaction,
)
from app.repositories.user_details import get_user_details
from app.settings import settings
from db.supabase import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/payment", tags=["payment"])


@router.post("/init", status_code=status.HTTP_200_OK)
async def init_payment(
    request: schemas.PaymentInitiationRequest,
    sslcz: SSLCOMMERZ = Depends(get_sslcommerz),
    db: AsyncClient = Depends(get_db),
    user: schemas.UserBase = Depends(get_current_user),
):
    """
    Initialize a payment and create a record in the database.
    """
    user: schemas.UserDetails = await get_user_details(user.id, db)
    post_body = {
        "total_amount": request.total_amount,
        "currency": "BDT",
        "tran_id": request.tran_id,
        "success_url": f"{settings.API_URL}/payment/success",
        "fail_url": f"{settings.API_URL}/payment/fail",
        "cancel_url": f"{settings.API_URL}/payment/cancel",
        "emi_option": 0,
        "cus_name": user.name,
        "cus_email": user.email,
        "cus_phone": user.phone_number,
        "cus_add1": request.cus_add1,
        "cus_city": request.cus_city,
        "cus_country": "Bangladesh",
        "shipping_method": "NO",
        "num_of_item": request.num_of_item,
        "product_name": request.product_name,
        "product_category": request.product_category,
        "product_profile": "general",
    }
    response = create_payment_session(sslcz, post_body)

    payment = schemas.PaymentCreate(
        user_id=user.id,
        amount=request.total_amount,
        transaction_id=request.tran_id,
    )
    new_payment = await create_payment(db, payment)

    if request.order_ids:
        await link_orders_to_payment(db, request.order_ids, new_payment.get("id"))

    return response


@router.post("/success", status_code=status.HTTP_200_OK)
async def payment_success(
    request: Request,
    sslcz: SSLCOMMERZ = Depends(get_sslcommerz),
    db: AsyncClient = Depends(get_db),
):
    """
    Handle successful payment and update the payment status in the database.
    """
    form_data = await request.form()
    val_id = form_data.get("val_id")

    if not val_id:
        return RedirectResponse(
            url=f"{settings.CLIENT_ORIGIN_URL}/payment/status?status=fail",
            status_code=status.HTTP_303_SEE_OTHER,
        )

    response = validate_transaction(sslcz, val_id)
    if response["status"] == "VALID":
        tran_id = response["tran_id"]
        await update_payment_status(db, tran_id, enums.PaymentStatus.SUCCESS)

        return RedirectResponse(
            url=f"{settings.CLIENT_ORIGIN_URL}/payment/status?status=success&tran_id={tran_id}",
            status_code=status.HTTP_303_SEE_OTHER,
        )
    return RedirectResponse(
        url=f"{settings.CLIENT_ORIGIN_URL}/payment/status?status=fail",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.post("/fail", status_code=status.HTTP_400_BAD_REQUEST)
async def payment_fail(
    request: Request,
    db: AsyncClient = Depends(get_db),
):
    """
    Handle failed payment and update the payment status in the database.
    """
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    if tran_id:
        await update_payment_status(db, tran_id, enums.PaymentStatus.FAILED)
    return RedirectResponse(
        url=f"{settings.CLIENT_ORIGIN_URL}/payment/status?status=fail&tran_id={tran_id}",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.post("/cancel", status_code=status.HTTP_200_OK)
async def payment_cancel(
    request: Request,
    db: AsyncClient = Depends(get_db),
):
    """
    Handle cancelled payment and update the payment status in the database.
    """
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    if tran_id:
        await update_payment_status(db, tran_id, enums.PaymentStatus.CANCELLED)
    return RedirectResponse(
        url=f"{settings.CLIENT_ORIGIN_URL}/payment/status?status=cancel",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.post("/ipn", status_code=status.HTTP_200_OK)
async def payment_ipn(
    request: dict,
    sslcz: SSLCOMMERZ = Depends(get_sslcommerz),
    db: AsyncClient = Depends(get_db),
):
    """
    Handle Instant Payment Notification (IPN) and update the payment status.
    """
    if sslcz.hash_validate_ipn(request):
        response = validate_transaction(sslcz, request["val_id"])
        if response["status"] == "VALID":
            tran_id = response["tran_id"]
            await update_payment_status(db, tran_id, enums.PaymentStatus.SUCCESS)
            return response
    await update_payment_status(db, request.get("tran_id"), enums.PaymentStatus.FAILED)
    return {"message": "IPN validation failed"}


@router.get("/transaction-status-session/{sessionkey}", status_code=status.HTTP_200_OK)
async def transaction_status_session(
    sessionkey: str,
    sslcz: SSLCOMMERZ = Depends(get_sslcommerz),
):
    response = get_transaction_status_by_session(sslcz, sessionkey)
    return response


@router.get("/transaction-status-tranid/{tranid}", status_code=status.HTTP_200_OK)
async def transaction_status_tranid(
    tranid: str,
    sslcz: SSLCOMMERZ = Depends(get_sslcommerz),
):
    response = get_transaction_status_by_tranid(sslcz, tranid)
    return response
