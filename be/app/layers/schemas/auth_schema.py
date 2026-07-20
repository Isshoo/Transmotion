"""Auth validation schemas"""

import re

from marshmallow import Schema, ValidationError, fields, validate, validates

_PASSWORD_MIN_LEN = 8
_PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")


def _validate_password_strength(value: str) -> None:
    if value is None:
        return
    if len(value) < _PASSWORD_MIN_LEN:
        raise ValidationError(f"Minimum Password is {_PASSWORD_MIN_LEN} characters")
    if not _PASSWORD_REGEX.match(value):
        raise ValidationError("Password must contain uppercase, lowercase, and numbers")


class RegisterSchema(Schema):
    error_messages = {"unknown": "Unknown field"}

    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required",
            "invalid": "Invalid email format",
        },
    )
    password = fields.String(
        required=True,
        load_only=True,
        error_messages={"required": "Password is required"},
    )
    name = fields.String(
        required=True,
        validate=validate.Length(max=100, error="Maximum name is 100 characters"),
        error_messages={"required": "Name is required"},
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        _validate_password_strength(value)


class LoginSchema(Schema):
    error_messages = {"unknown": "Unknown field"}

    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required",
            "invalid": "Invalid email format",
        },
    )
    password = fields.String(
        required=True,
        load_only=True,
        error_messages={"required": "Password is required"},
    )


class RefreshTokenSchema(Schema):
    error_messages = {"unknown": "Unknown field"}

    refresh_token = fields.String(
        required=True, error_messages={"required": "Refresh token is required"}
    )


class ForgotPasswordSchema(Schema):
    error_messages = {"unknown": "Unknown field"}

    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required",
            "invalid": "Invalid email format",
        },
    )


class ResetPasswordSchema(Schema):
    error_messages = {"unknown": "Unknown field"}

    token = fields.String(
        required=True, error_messages={"required": "Token is required"}
    )
    password = fields.String(
        required=True,
        validate=validate.Length(
            min=_PASSWORD_MIN_LEN,
            error=f"Minimum Password is {_PASSWORD_MIN_LEN} characters",
        ),
        load_only=True,
        error_messages={"required": "Password is required"},
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        _validate_password_strength(value)


class ChangePasswordSchema(Schema):
    error_messages = {"unknown": "Unknown field"}

    current_password = fields.String(
        required=True,
        load_only=True,
        error_messages={"required": "Current password is required"},
    )
    new_password = fields.String(
        required=True,
        validate=validate.Length(
            min=_PASSWORD_MIN_LEN,
            error=f"New password must be at least {_PASSWORD_MIN_LEN} characters",
        ),
        load_only=True,
        error_messages={"required": "New password is required"},
    )

    @validates("new_password")
    def validate_new_password(self, value, **kwargs):
        _validate_password_strength(value)
