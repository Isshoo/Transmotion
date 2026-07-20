"""Auth service - Business logic for authentication"""

import secrets
from datetime import datetime, timedelta, timezone

from flask_jwt_extended import create_access_token, create_refresh_token

from app.config.extensions import db
from app.layers.models.user import User
from app.utils.exceptions import (
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
)
from app.utils.password import hash_password, verify_password


def register(email, password, name):
    # Check if email exists
    if db.session.query(User).filter_by(email=email.lower()).first():
        raise ConflictError("Email is already registered")

    # Create verification token
    verification_token = secrets.token_urlsafe(32)

    # Create user
    user = User(
        email=email.lower(),
        password_hash=hash_password(password),
        name=name,
        verification_token=verification_token,
        verification_token_expires=datetime.now(timezone.utc) + timedelta(hours=24),
    )

    db.session.add(user)
    db.session.commit()

    return user


def login(email, password):
    user = db.session.query(User).filter_by(email=email.lower()).first()
    if not user:
        raise UnauthorizedError("Account not found")
    if user.auth_provider == "google" and not user.password_hash:
        raise UnauthorizedError(
            "This account is registered via Google. Please login with Google."
        )

    if not verify_password(password, user.password_hash):
        raise UnauthorizedError("Incorrect email or password")

    if not user.is_active:
        raise UnauthorizedError("Account has been disabled")
    if not user.is_verified:
        raise UnauthorizedError("Account is not verified. Please check your email.")

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    db.session.commit()

    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return user, access_token, refresh_token


def refresh_token(user_id):
    user = db.session.get(User, user_id)

    if not user:
        raise UnauthorizedError("Account not found")

    if not user.is_active:
        raise UnauthorizedError("Account has been disabled")

    return create_access_token(identity=user.id)


def verify_email(token):
    user = db.session.query(User).filter_by(verification_token=token).first()

    if not user:
        raise BadRequestError("Invalid verification token")

    if user.verification_token_expires < datetime.now(timezone.utc):
        raise BadRequestError("Verification token has expired")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.session.commit()

    return user


def resend_verification(email):
    user = db.session.query(User).filter_by(email=email.lower()).first()

    if not user:
        raise NotFoundError("Account not found")

    if user.is_verified:
        raise BadRequestError("Email is already verified")

    user.verification_token = secrets.token_urlsafe(32)
    user.verification_token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    db.session.commit()

    return user


def forgot_password(email):
    user = db.session.query(User).filter_by(email=email.lower()).first()

    if not user:
        return None

    user.reset_token = secrets.token_urlsafe(32)
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.session.commit()

    return user


def reset_password(token, new_password):
    user = db.session.query(User).filter_by(reset_token=token).first()

    if not user:
        raise BadRequestError("Invalid reset token")

    if user.reset_token_expires < datetime.now(timezone.utc):
        raise BadRequestError("Reset token has expired")

    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()

    return user


def change_password(user, current_password, new_password):
    if not verify_password(current_password, user.password_hash):
        raise UnauthorizedError("Current password is incorrect")

    user.password_hash = hash_password(new_password)
    db.session.commit()

    return user
