from sslcommerz_lib import SSLCOMMERZ
from supabase import AsyncClient

from app import enums, schemas
from app.settings import settings


def get_sslcommerz() -> SSLCOMMERZ:
    sslcommerz_settings = {
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_pass": settings.SSLCOMMERZ_STORE_PASS,
        "issandbox": True,  # Set to False in production
    }
    return SSLCOMMERZ(sslcommerz_settings)


async def create_payment(
    db: AsyncClient,
    payment: schemas.PaymentCreate,
):
    response = (
        await db.from_("payments").insert(payment.model_dump(mode="json")).execute()
    )
    return response.data[0]


async def update_payment_status(
    db: AsyncClient,
    transaction_id: str,
    status: enums.PaymentStatus,
):
    response = (
        await db.from_("payments")
        .update({"status": status})
        .eq("transaction_id", transaction_id)
        .execute()
    )
    return response.data[0]


def create_payment_session(sslcz: SSLCOMMERZ, post_body: dict):
    response = sslcz.createSession(post_body)
    return response


def validate_transaction(sslcz: SSLCOMMERZ, val_id: str):
    response = sslcz.validationTransactionOrder(val_id)
    return response


def get_transaction_status_by_session(sslcz: SSLCOMMERZ, sessionkey: str):
    response = sslcz.transaction_query_session(sessionkey)
    return response


def get_transaction_status_by_tranid(sslcz: SSLCOMMERZ, tranid: str):
    response = sslcz.transaction_query_tranid(tranid)
    return response
