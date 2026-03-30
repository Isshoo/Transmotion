from threading import Thread

import resend
from flask import copy_current_request_context, current_app, render_template_string
from flask_mail import Message

from app.config.extensions import mail
from app.lib.mailer.templates import (
    PASSWORD_RESET_EMAIL_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
)
from app.utils.logger import logger


def send_email(to, subject, html_body, text_body=None):
    try:
        resend_api_key = current_app.config.get("RESEND_API_KEY")

        if resend_api_key:
            resend.api_key = resend_api_key

            @copy_current_request_context
            def send_resend():
                try:
                    params = {
                        "from": current_app.config.get(
                            "MAIL_FROM", "onboarding@resend.dev"
                        ),
                        "to": [to],
                        "subject": subject,
                        "html": html_body,
                    }
                    if text_body:
                        params["text"] = text_body

                    resend.Emails.send(params)
                    logger.info(f"Email sent via Resend to {to}: {subject}")
                except Exception as e:
                    logger.error(f"Failed to send email via Resend to {to}: {e}")

            thread = Thread(target=send_resend)
            thread.start()
            logger.info(f"Resend email task started in background for {to}")
            return True

        # Fallback to Flask-Mail if Resend is not configured
        msg = Message(
            subject=subject,
            recipients=[to],
            html=html_body,
            body=text_body or "Silakan buka email ini di aplikasi yang mendukung HTML.",
        )

        @copy_current_request_context
        def send_msg(message):
            try:
                mail.send(message)
                logger.info(f"Background email sent via Flask-Mail to {to}: {subject}")
            except Exception as e:
                logger.error(f"Failed to send email via Flask-Mail to {to}: {e}")

        thread = Thread(target=send_msg, args=(msg,))
        thread.start()

        logger.info(f"Flask-Mail task started in background for {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to start background email task for {to}: {e}")
        return False


def send_verification_email(to, token):
    base_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")
    verification_url = f"{base_url}/verify-email?token={token}"

    html_body = render_template_string(
        VERIFICATION_EMAIL_TEMPLATE, verification_url=verification_url
    )
    return send_email(to=to, subject="Verifikasi Email Kamu", html_body=html_body)


def send_password_reset_email(to, token):
    base_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")
    reset_url = f"{base_url}/reset-password?token={token}"

    html_body = render_template_string(
        PASSWORD_RESET_EMAIL_TEMPLATE, reset_url=reset_url
    )
    return send_email(to=to, subject="Reset Password Kamu", html_body=html_body)
