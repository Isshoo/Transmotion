"""Dataset validation schemas"""

from marshmallow import Schema, fields, validate


class DatasetUploadSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}

    name = fields.String(
        required=True,
        validate=validate.Length(
            min=1, max=255, error="Nama dataset harus antara 1-255 karakter"
        ),
        error_messages={"required": "Nama dataset harus diisi"},
    )
    description = fields.String(
        validate=validate.Length(max=1000, error="Deskripsi maksimal 1000 karakter"),
        load_default=None,
    )


class DatasetPreprocessSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}

    text_column = fields.String(
        required=True,
        error_messages={"required": "Nama kolom teks harus diisi"},
    )
    label_column = fields.String(
        required=True,
        error_messages={"required": "Nama kolom label harus diisi"},
    )
    test_size = fields.Float(
        load_default=0.1,
        validate=validate.Range(
            min=0.05, max=0.4, error="Test size harus antara 0.05-0.4"
        ),
    )
    val_size = fields.Float(
        load_default=0.1,
        validate=validate.Range(
            min=0.05, max=0.4, error="Val size harus antara 0.05-0.4"
        ),
    )


class DatasetListQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}

    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    search = fields.String(validate=validate.Length(max=100))
    status = fields.String(
        validate=validate.OneOf(
            ["uploaded", "preprocessing", "ready", "error"],
            error="Status tidak valid",
        )
    )
    sort_by = fields.String(
        load_default="created_at",
        validate=validate.OneOf(["created_at", "name", "num_samples"]),
    )
    sort_order = fields.String(
        load_default="desc",
        validate=validate.OneOf(["asc", "desc"]),
    )
