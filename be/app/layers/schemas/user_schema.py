"""User validation schemas"""

import re

from marshmallow import Schema, ValidationError, fields, validate, validates

_PASSWORD_MIN_LEN = 8
_PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")


def _validate_password_strength(value: str) -> None:
    if value is None:
        return
    if len(value) < _PASSWORD_MIN_LEN:
        raise ValidationError(f"Password minimal {_PASSWORD_MIN_LEN} karakter")
    if not _PASSWORD_REGEX.match(value):
        raise ValidationError(
            "Password harus mengandung huruf besar, huruf kecil, dan angka"
        )


class UpdateUserSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    name = fields.String(
        validate=validate.Length(max=100, error="Nama lengkap maksimal 100 karakter")
    )
    avatar_url = fields.URL(error_messages={"invalid": "Format URL avatar tidak valid"})


class CreateUserSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}

    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email harus diisi",
            "invalid": "Format email tidak valid",
        },
    )
    password = fields.String(
        required=True,
        load_only=True,
        error_messages={"required": "Password harus diisi"},
    )
    name = fields.String(
        required=True,
        validate=validate.Length(max=100, error="Nama maksimal 100 karakter"),
        error_messages={"required": "Nama harus diisi"},
    )
    role = fields.String(
        validate=validate.OneOf(
            ["user", "admin"], error="Role harus berupa 'user' atau 'admin'"
        )
    )
    is_verified = fields.Boolean(
        error_messages={"invalid": "Format status verifikasi tidak valid"}
    )
    is_active = fields.Boolean(
        error_messages={"invalid": "Format status aktif tidak valid"}
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        _validate_password_strength(value)


class UpdateUserAdminSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    email = fields.Email(
        error_messages={
            "invalid": "Format email tidak valid",
        },
    )
    password = fields.String(
        load_only=True,
    )
    name = fields.String(
        validate=validate.Length(max=100, error="Nama maksimal 100 karakter"),
    )
    role = fields.String(
        validate=validate.OneOf(
            ["user", "admin"], error="Role harus berupa 'user' atau 'admin'"
        )
    )
    is_verified = fields.Boolean(
        error_messages={"invalid": "Format status verifikasi tidak valid"}
    )
    is_active = fields.Boolean(
        error_messages={"invalid": "Format status aktif tidak valid"}
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        _validate_password_strength(value)


class UserListQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    page = fields.Integer(
        load_default=1, validate=validate.Range(min=1, error="Halaman minimal 1")
    )
    per_page = fields.Integer(
        load_default=20,
        validate=validate.Range(
            min=1, max=100, error="Per halaman antara 1 sampai 100"
        ),
    )
    search = fields.String(
        validate=validate.Length(max=100, error="Pencarian maksimal 100 karakter")
    )
    role = fields.String(
        validate=validate.OneOf(
            ["user", "admin"], error="Role harus berupa 'user' atau 'admin'"
        )
    )
    is_verified = fields.Boolean(
        error_messages={"invalid": "Format status verifikasi tidak valid"}
    )
    is_active = fields.Boolean(
        error_messages={"invalid": "Format status aktif tidak valid"}
    )
    sort_by = fields.String(
        load_default="created_at",
        validate=validate.OneOf(
            ["created_at", "username", "email"],
            error="Penyortiran hanya berdasarkan created_at, username, atau email",
        ),
    )
    sort_order = fields.String(
        load_default="desc",
        validate=validate.OneOf(
            ["asc", "desc"], error="Urutan penyortiran harus 'asc' atau 'desc'"
        ),
    )
