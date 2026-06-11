"""Social Auth service"""

from datetime import datetime, timezone

import requests as http_requests
from flask_jwt_extended import create_access_token, create_refresh_token

from app.config.extensions import db
from app.layers.models.user import User
from app.utils.exceptions import (
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
)
from app.utils.logger import logger


def verify_google_token(access_token: str) -> dict:
    try:
        response = http_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
    except Exception:
        raise BadRequestError("Failed to connect to Google server") from None
    if response.status_code != 200:
        raise UnauthorizedError("Invalid Google token")
    data = response.json()
    if not data.get("email"):
        raise BadRequestError("Email not available from Google")
    return {
        "email": data.get("email"),
        "name": data.get("name"),
        "avatar_url": data.get("picture"),
        "provider_id": data.get("sub"),
    }


def google_auth(access_token: str, intent: str = "login"):
    """
    intent='login'    → hanya user terdaftar yang bisa masuk
    intent='register' → buat akun baru, tolak jika sudah ada
    """
    user_info = verify_google_token(access_token)
    email = user_info["email"].lower()
    provider_id = user_info["provider_id"]
    # Cari user yang sudah ada
    existing = (
        db.session.query(User)
        .filter_by(auth_provider="google", provider_id=provider_id)
        .first()
        or db.session.query(User).filter_by(email=email).first()
    )
    # ── LOGIN ──
    if intent == "login":
        if not existing:
            raise NotFoundError("Account not found. Please register first.")
        if not existing.is_active:
            raise UnauthorizedError("Account has been disabled.")
        if existing.auth_provider == "local" and existing.provider_id != provider_id:
            raise ConflictError(
                "This email is already registered using email and password. "
                "Please login with your email and password."
            )
        # Link provider jika belum
        if not existing.provider_id:
            existing.provider_id = provider_id
            existing.auth_provider = "google"
            existing.is_verified = True
        existing.last_login_at = datetime.now(timezone.utc)
        if user_info["avatar_url"] and not existing.avatar_url:
            existing.avatar_url = user_info["avatar_url"]
        db.session.commit()
        return (
            existing,
            create_access_token(identity=existing.id),
            create_refresh_token(identity=existing.id),
            False,
        )
    # ── REGISTER ──
    if intent == "register":
        if existing:
            if existing.auth_provider == "local":
                raise ConflictError(
                    "This email is already registered using email and password. "
                    "Please login with your email and password."
                )
            else:
                raise ConflictError("This email is already registered. Please login.")

        new_user = User(
            email=email,
            password_hash=None,
            name=user_info["name"],
            avatar_url=user_info["avatar_url"],
            auth_provider="google",
            provider_id=provider_id,
            is_verified=True,
            last_login_at=datetime.now(timezone.utc),
        )
        db.session.add(new_user)
        db.session.commit()
        logger.info(f"New user registered via Google: {email}")
        return (
            new_user,
            create_access_token(identity=new_user.id),
            create_refresh_token(identity=new_user.id),
            True,
        )
    raise BadRequestError("Invalid intent.")
