from marshmallow import Schema, fields, validate


class CreateTrainingJobSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}

    dataset_id = fields.String(
        required=True,
        error_messages={"required": "Dataset harus dipilih"},
    )
    model_type = fields.String(
        required=True,
        validate=validate.OneOf(["mbert", "xlmr"]),
        error_messages={"required": "Tipe model harus dipilih"},
    )
    job_name = fields.String(
        validate=validate.Length(min=1, max=255),
        load_default=None,
    )

    # Split — sekarang 3-way
    test_size = fields.Float(
        required=True,
        validate=validate.Range(min=0.05, max=0.4),
        error_messages={"required": "Ukuran test set harus diisi"},
    )
    eval_size = fields.Float(
        load_default=0.1,
        validate=validate.Range(min=0.05, max=0.3),
    )

    # Hyperparameters
    learning_rate = fields.Float(
        load_default=2e-5,
        validate=validate.Range(min=1e-6, max=1e-3),
    )
    epochs = fields.Integer(
        load_default=3,
        validate=validate.Range(min=1, max=20),
    )
    batch_size = fields.Integer(
        load_default=16,
        validate=validate.OneOf([8, 16, 32]),
    )
    # max_length: integer atau string "auto"
    max_length = fields.Raw(load_default="auto")
    warmup_steps = fields.Float(
        load_default=0.0,
        validate=validate.Range(min=0.0, max=1.0),
    )
    weight_decay = fields.Float(
        load_default=0.01,
        validate=validate.Range(min=0.0, max=1.0),
    )
    dropout = fields.Float(
        load_default=0.1,
        validate=validate.Range(min=0.0, max=0.5),
    )
    optimizer = fields.String(
        load_default="adamw",
        validate=validate.OneOf(["adamw", "adam", "sgd", "adafactor"]),
    )


class SplitPreviewSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    dataset_id = fields.String(required=True)
    test_size = fields.Float(
        required=True,
        validate=validate.Range(min=0.05, max=0.4),
    )
    eval_size = fields.Float(
        load_default=0.1,
        validate=validate.Range(min=0.05, max=0.3),
    )


class UpdateJobProgressSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    current_epoch = fields.Integer(required=True)
    total_epochs = fields.Integer(required=True)
    progress = fields.Integer(
        required=True,
        validate=validate.Range(min=0, max=100),
    )
    # Train metrics
    train_loss = fields.Float(load_default=None)
    train_accuracy = fields.Float(load_default=None)
    train_f1 = fields.Float(load_default=None)
    # Eval metrics (validation set)
    eval_loss = fields.Float(load_default=None)
    eval_accuracy = fields.Float(load_default=None)
    eval_precision = fields.Float(load_default=None)
    eval_recall = fields.Float(load_default=None)
    eval_f1 = fields.Float(load_default=None)
    colab_session_id = fields.String(load_default=None)


class CompleteJobSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    model_name = fields.String(required=True)
    # Eval set metrics
    eval_accuracy = fields.Float(load_default=None)
    eval_f1 = fields.Float(load_default=None)
    eval_precision = fields.Float(load_default=None)
    eval_recall = fields.Float(load_default=None)
    # Test set metrics
    accuracy = fields.Float(required=True)
    f1_score = fields.Float(required=True)
    precision = fields.Float(load_default=None)
    recall = fields.Float(load_default=None)
    # Advanced metrics (test set)
    mcc = fields.Float(load_default=None)
    roc_auc = fields.Float(load_default=None)
    mean_std = fields.Float(load_default=None)
    # Struktur
    label_map = fields.Str(required=True)
    base_model_name = fields.String(load_default=None)
    colab_session_id = fields.String(load_default=None)
    file_path = fields.String(load_default=None)
    confusion_matrix = fields.Str(load_default=None)
    per_class_metrics = fields.Str(load_default=None)
    macro_avg = fields.Str(load_default=None)
    weighted_avg = fields.Str(load_default=None)
    # Eval set evaluation
    eval_confusion_matrix = fields.Str(load_default=None)
    eval_per_class_metrics = fields.Str(load_default=None)
    eval_macro_avg = fields.Str(load_default=None)
    eval_weighted_avg = fields.Str(load_default=None)


class JobListQuerySchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    status = fields.String(
        validate=validate.OneOf(
            ["queued", "running", "completed", "failed", "cancelled"]
        )
    )
    model_type = fields.String(validate=validate.OneOf(["mbert", "xlmr"]))
    sort_order = fields.String(
        load_default="desc", validate=validate.OneOf(["asc", "desc"])
    )
