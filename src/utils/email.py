import os

import resend

from app.settings import settings

resend.api_key = settings.RESEND_API_KEY

html_template = """
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #f97316;">Order Delivered! 🎉</h2>
        <p>Hi <strong>{name}</strong>,</p>
        <p>Your order <strong>#{order_id}</strong> is ready for pickup at <strong>{pickup}</strong>.</p>
        <p><strong>Total:</strong> ৳{total}</p>
        <br>
        <p style="font-size: 12px; color: #888;">Thank you for ordering with TiffinTime.</p>
    </div>
</body>
</html>
"""


def send_delivery_email_resend(
    email_to: str, user_name: str, order_id: str, pickup: str, total_price: float
):

    message_body = html_template.format(
        name=user_name, order_id=order_id[:8].upper(), pickup=pickup, total=total_price
    )

    try:
        r = resend.Emails.send(
            {
                "from": "TiffinTime <orders@resend.dev>",
                "to": email_to,
                "subject": "Your Order is Ready!",
                "html": message_body,
            }
        )
        print(f"Email sent successfully: {r}")
        return r
    except Exception as e:
        print(f"Failed to send email: {e}")
