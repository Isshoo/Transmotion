"""Training job validation schemas"""

from marshmallow import Schema, fields, validate


class CreateTrainingJobSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}

    dataset_id = fields.String(
        required=True,
        error_messages={"required": "Dataset harus dipilih"},
    )
    model_type = fields.String(
        required=True,
        validate=validate.OneOf(
            ["mbert", "xlmr"], error="Tipe model harus 'mbert' atau 'xlmr'"
        ),
        error_messages={"required": "Tipe model harus dipilih"},
    )
    # Hyperparameters
    learning_rate = fields.Float(
        load_default=2e-5,
        validate=validate.Range(
            min=1e-6, max=1e-3, error="Learning rate harus antara 1e-6 dan 1e-3"
        ),
    )
    epochs = fields.Integer(
        load_default=3,
        validate=validate.Range(min=1, max=20, error="Epochs harus antara 1-20"),
    )
    batch_size = fields.Integer(
        load_default=16,
        validate=validate.OneOf([8, 16, 32], error="Batch size harus 8, 16, atau 32"),
    )
    max_length = fields.Integer(
        load_default=128,
        validate=validate.OneOf(
            [64, 128, 256, 512], error="Max length harus 64, 128, 256, atau 512"
        ),
    )
    warmup_steps = fields.Integer(
        load_default=0,
        validate=validate.Range(min=0, max=1000),
    )
    weight_decay = fields.Float(
        load_default=0.01,
        validate=validate.Range(min=0.0, max=0.1),
    )


class UpdateJobProgressSchema(Schema):
    """Dipakai oleh Colab untuk update progress"""

    error_messages = {"unknown": "Kolom tidak dikenal"}

    current_epoch = fields.Integer(required=True)
    total_epochs = fields.Integer(required=True)
    progress = fields.Integer(
        required=True,
        validate=validate.Range(min=0, max=100),
    )
    train_loss = fields.Float(load_default=None)
    val_loss = fields.Float(load_default=None)
    val_accuracy = fields.Float(load_default=None)
    val_f1 = fields.Float(load_default=None)
    colab_session_id = fields.String(load_default=None)


class CompleteJobSchema(Schema):
    """Dipakai oleh Colab saat training selesai"""

    error_messages = {"unknown": "Kolom tidak dikenal"}

    model_name = fields.String(required=True)
    accuracy = fields.Float(required=True)
    f1_score = fields.Float(required=True)
    precision = fields.Float(load_default=None)
    recall = fields.Float(load_default=None)
    label_map = fields.Dict(required=True)
    # label_map: {"0": "negatif", "1": "positif"}
    base_model_name = fields.String(load_default=None)
    colab_session_id = fields.String(load_default=None)


class JobListQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}

    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    status = fields.String(
        validate=validate.OneOf(
            ["queued", "running", "completed", "failed", "cancelled"],
        )
    )
    model_type = fields.String(validate=validate.OneOf(["mbert", "xlmr"]))
    sort_order = fields.String(
        load_default="desc", validate=validate.OneOf(["asc", "desc"])
    )
