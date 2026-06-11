"""User validation schemas"""

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


class UpdateUserSchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    name = fields.String(
        validate=validate.Length(max=100, error="Maximum Name is 100 characters")
    )
    avatar_url = fields.URL(error_messages={"invalid": "Invalid avatar URL format"})


class CreateUserSchema(Schema):
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
    role = fields.String(
        validate=validate.OneOf(
            ["user", "admin"], error="Role must be 'user' or 'admin'"
        )
    )
    is_verified = fields.Boolean(
        error_messages={"invalid": "Invalid verification status format"}
    )
    is_active = fields.Boolean(
        error_messages={"invalid": "Invalid active status format"}
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        _validate_password_strength(value)


class UpdateUserAdminSchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    email = fields.Email(
        error_messages={
            "invalid": "Invalid email format",
        },
    )
    password = fields.String(
        load_only=True,
    )
    name = fields.String(
        validate=validate.Length(max=100, error="Maximum name is 100 characters"),
    )
    role = fields.String(
        validate=validate.OneOf(
            ["user", "admin"], error="Role must be 'user' or 'admin'"
        )
    )
    is_verified = fields.Boolean(
        error_messages={"invalid": "Invalid verification status format"}
    )
    is_active = fields.Boolean(
        error_messages={"invalid": "Invalid active status format"}
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        _validate_password_strength(value)


class UserListQuerySchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    page = fields.Integer(
        load_default=1, validate=validate.Range(min=1, error="Minimum page is 1")
    )
    per_page = fields.Integer(
        load_default=20,
        validate=validate.Range(
            min=1, max=100, error="Per page must be between 1 and 100"
        ),
    )
    search = fields.String(
        validate=validate.Length(max=100, error="Search maximum is 100 characters")
    )
    role = fields.String(
        validate=validate.OneOf(
            ["user", "admin"], error="Role must be 'user' or 'admin'"
        )
    )
    is_verified = fields.Boolean(
        error_messages={"invalid": "Invalid verification status format"}
    )
    is_active = fields.Boolean(
        error_messages={"invalid": "Invalid active status format"}
    )
    sort_by = fields.String(
        load_default="created_at",
        validate=validate.OneOf(
            ["created_at", "username", "email"],
            error="Sort by only based on created_at, username, or email",
        ),
    )
    sort_order = fields.String(
        load_default="desc",
        validate=validate.OneOf(
            ["asc", "desc"], error="Sort order must be 'asc' or 'desc'"
        ),
    )
