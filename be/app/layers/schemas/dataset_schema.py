"""Dataset validation schemas"""

from marshmallow import Schema, fields, validate


class DatasetUploadSchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
        error_messages={"required": "Dataset name is required"},
    )
    description = fields.String(
        validate=validate.Length(max=1000),
        load_default=None,
    )


class ColumnSettingsSchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    text_column = fields.String(
        required=True,
        error_messages={"required": "Text column must be selected"},
    )
    label_column = fields.String(
        required=True,
        error_messages={"required": "Label column must be selected"},
    )


class RawDataQuerySchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(
        load_default=50, validate=validate.Range(min=1, max=10000)
    )
    search = fields.String(load_default=None)
    filter_label = fields.String(load_default=None)


class PreprocessedQuerySchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(
        load_default=50, validate=validate.Range(min=1, max=10000)
    )
    search = fields.String(load_default=None)
    filter_label = fields.String(load_default=None)


class AddPreprocessedRowSchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    raw_text = fields.String(
        required=True,
        validate=validate.Length(min=10, max=10000),
        error_messages={"required": "Original text is required"},
    )
    label = fields.String(
        required=True,
        error_messages={"required": "Label is required"},
    )


class UpdatePreprocessedRowSchema(Schema):
    error_messages = {"unknown": "Unknown field"}
    preprocessed_text = fields.String(validate=validate.Length(min=10, max=10000))
    label = fields.String()


class DatasetListQuerySchema(Schema):
    error_messages = {"unknown": "Unknown field"}
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
