"""User validation schemas"""

from marshmallow import Schema, fields, validate


class UpdateUserSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    name = fields.String(
        validate=validate.Length(max=100, error="Nama lengkap maksimal 100 karakter")
    )
    avatar_url = fields.URL(error_messages={"invalid": "Format URL avatar tidak valid"})


class CreateUserSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    email = fields.Email(error_messages={"invalid": "Format email tidak valid"})
    name = fields.String(
        validate=validate.Length(max=100, error="Nama lengkap maksimal 100 karakter")
    )
    password = fields.String(
        validate=validate.Length(
            min=6, max=128, error="Password harus antara 6 sampai 128 karakter"
        )
    )
    role = fields.String(
        validate=validate.OneOf(
            ["user", "admin"], error="Role harus berupa 'user' atau 'admin'"
        )
    )
    is_verified = fields.Boolean(
        error_messages={"invalid": "Format status verifikasi tidak valid"}
    )
    auth_provider = fields.String(
        validate=validate.OneOf(["local"], error="Auth provider harus berupa 'email''")
    )


class UpdateUserAdminSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    email = fields.Email(error_messages={"invalid": "Format email tidak valid"})
    name = fields.String(
        validate=validate.Length(max=100, error="Nama lengkap maksimal 100 karakter")
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
