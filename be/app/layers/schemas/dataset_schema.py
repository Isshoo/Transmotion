"""Dataset validation schemas"""

from marshmallow import Schema, fields, validate


class DatasetUploadSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
        error_messages={"required": "Nama dataset harus diisi"},
    )
    description = fields.String(
        validate=validate.Length(max=1000),
        load_default=None,
    )


class ColumnSettingsSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    text_column = fields.String(
        required=True,
        error_messages={"required": "Kolom teks harus dipilih"},
    )
    label_column = fields.String(
        required=True,
        error_messages={"required": "Kolom label harus dipilih"},
    )


class RawDataQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=50, validate=validate.Range(min=1, max=10000))
    search = fields.String(load_default=None)
    filter_label = fields.String(load_default=None)


class PreprocessedQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=50, validate=validate.Range(min=1, max=10000))
    search = fields.String(load_default=None)
    filter_label = fields.String(load_default=None)


class AddPreprocessedRowSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    raw_text = fields.String(
        required=True,
        validate=validate.Length(min=1, max=10000),
        error_messages={"required": "Teks asli harus diisi"},
    )
    preprocessed_text = fields.String(
        required=True,
        validate=validate.Length(min=1, max=10000),
        error_messages={"required": "Teks terpreproses harus diisi"},
    )
    label = fields.String(
        required=True,
        error_messages={"required": "Label harus diisi"},
    )


class UpdatePreprocessedRowSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    preprocessed_text = fields.String(validate=validate.Length(min=1, max=10000))
    label = fields.String()


class DatasetListQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    search = fields.String(validate=validate.Length(max=100))
    status = fields.String(validate=validate.OneOf(["uploaded", "ready", "error"]))
    sort_by = fields.String(
        load_default="created_at",
        validate=validate.OneOf(["created_at", "name", "num_rows_raw"]),
    )
    sort_order = fields.String(
        load_default="desc",
        validate=validate.OneOf(["asc", "desc"]),
    )
