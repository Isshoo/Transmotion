"""TrainedModel and Prediction validation schemas"""

from marshmallow import Schema, fields, validate


class UpdateTrainedModelSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    name = fields.String(validate=validate.Length(min=1, max=255))
    description = fields.String(validate=validate.Length(max=1000))
    is_active = fields.Boolean()
    is_public = fields.Boolean()


class ModelListQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    model_type = fields.String(validate=validate.OneOf(["mbert", "xlmr"]))
    is_active = fields.Boolean()
    is_public = fields.Boolean()
    sort_by = fields.String(
        load_default="created_at",
        validate=validate.OneOf(["created_at", "accuracy", "f1_score", "name"]),
    )
    sort_order = fields.String(
        load_default="desc",
        validate=validate.OneOf(["asc", "desc"]),
    )


class ClassifyTextSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    text = fields.String(
        required=True,
        validate=validate.Length(min=1, max=5000),
        error_messages={"required": "Teks harus diisi"},
    )
    model_id = fields.String(
        required=True,
        error_messages={"required": "Model harus dipilih"},
    )


class PredictionListQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    model_id = fields.String()
    user_id = fields.String()  # hanya untuk admin
