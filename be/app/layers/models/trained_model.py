"""TrainedModel database model"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON

from app.config.extensions import db


class TrainedModel(db.Model):
    __tablename__ = "trained_models"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(Text, nullable=True)

    # File info
    file_path = db.Column(db.String(500), nullable=True)  # path ke .pt / folder
    file_size = db.Column(db.BigInteger, nullable=True)  # bytes

    # Model info
    model_type = db.Column(db.String(20), nullable=False)  # "mbert" / "xlmr"
    base_model_name = db.Column(db.String(255), nullable=True)
    # contoh: "bert-base-multilingual-cased" / "xlm-roberta-base"

    # Label mapping — penting untuk inference
    label_map = db.Column(JSON, nullable=True)
    # contoh: {"0": "negatif", "1": "netral", "2": "positif"}
    num_labels = db.Column(db.Integer, nullable=True)

    # Test set metrics
    accuracy = db.Column(db.Float, nullable=True)
    f1_score = db.Column(db.Float, nullable=True)
    precision = db.Column(db.Float, nullable=True)
    recall = db.Column(db.Float, nullable=True)
    mcc = db.Column(db.Float, nullable=True)  # Matthews Correlation Coefficient
    roc_auc = db.Column(db.Float, nullable=True)  # ROC-AUC (macro OvR)
    mean_std = db.Column(db.Float, nullable=True)  # std dev confidence scores

    # Eval set metrics
    eval_accuracy = db.Column(db.Float, nullable=True)
    eval_f1 = db.Column(db.Float, nullable=True)
    eval_precision = db.Column(db.Float, nullable=True)
    eval_recall = db.Column(db.Float, nullable=True)

    # Confusion matrix & per-class (test)
    confusion_matrix = db.Column(JSON, nullable=True)
    per_class_metrics = db.Column(JSON, nullable=True)
    macro_avg = db.Column(JSON, nullable=True)
    weighted_avg = db.Column(JSON, nullable=True)

    # Confusion matrix & per-class (eval)
    eval_confusion_matrix = db.Column(JSON, nullable=True)
    eval_per_class_metrics = db.Column(JSON, nullable=True)
    eval_macro_avg = db.Column(JSON, nullable=True)
    eval_weighted_avg = db.Column(JSON, nullable=True)

    # Config yang dipakai saat training (snapshot dari hyperparams)
    training_config = db.Column(JSON, nullable=True)

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_public = db.Column(db.Boolean, default=True, nullable=False)

    # Foreign keys
    job_id = db.Column(
        db.String(36),
        ForeignKey("training_jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    job = db.relationship("TrainingJob", back_populates="trained_model")
    predictions = db.relationship("Prediction", back_populates="model", lazy="dynamic")

    def __repr__(self):
        return f"<TrainedModel {self.name}>"

    def is_drive_model(self) -> bool:
        """Model tersimpan di Google Drive, butuh Colab untuk inference."""
        return bool(self.file_path and self.file_path.startswith("/content/drive/"))

    def to_dict(self, include_job=False):
        from sqlalchemy import func

        from app.config.extensions import db
        from app.layers.models.prediction import Prediction

        prediction_count = self.predictions.count()
        per_label_rows = (
            db.session.query(Prediction.predicted_label, func.count(Prediction.id))
            .filter(Prediction.model_id == self.id)
            .group_by(Prediction.predicted_label)
            .all()
        )
        per_label = {label: count for label, count in per_label_rows}

        job = self.job

        # Fallback ke job jika kolom di model kosong
        def _fb(attr, job_attr=None):
            val = getattr(self, attr, None)
            if val is not None:
                return val
            if job and job_attr:
                return getattr(job, job_attr, None)
            return None

        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "model_type": self.model_type,
            "base_model_name": self.base_model_name,
            "label_map": self.label_map,
            "num_labels": self.num_labels,
            # Test set metrics
            "accuracy": self.accuracy,
            "f1_score": self.f1_score,
            "precision": self.precision,
            "recall": self.recall,
            "mcc": self.mcc,
            "roc_auc": self.roc_auc,
            "mean_std": self.mean_std,
            # Eval set metrics
            "eval_accuracy": self.eval_accuracy,
            "eval_f1": self.eval_f1,
            "eval_precision": self.eval_precision,
            "eval_recall": self.eval_recall,
            # Evaluation data fallback dari job
            "confusion_matrix": _fb("confusion_matrix", "confusion_matrix"),
            "per_class_metrics": _fb("per_class_metrics", "per_class_metrics"),
            "macro_avg": _fb("macro_avg", "macro_avg"),
            "weighted_avg": _fb("weighted_avg", "weighted_avg"),
            "eval_confusion_matrix": _fb(
                "eval_confusion_matrix", "eval_confusion_matrix"
            ),
            "eval_per_class_metrics": _fb(
                "eval_per_class_metrics", "eval_per_class_metrics"
            ),
            "eval_macro_avg": _fb("eval_macro_avg", "eval_macro_avg"),
            "eval_weighted_avg": _fb("eval_weighted_avg", "eval_weighted_avg"),
            "epoch_logs": job.epoch_logs if job else None,
            "file_path": self.file_path,
            "file_size": self.file_size,
            "is_drive_model": self.is_drive_model(),
            "is_active": self.is_active,
            "is_public": self.is_public,
            "job_id": self.job_id,
            "prediction_count": prediction_count,
            "per_label": per_label,
            "training_config": self.training_config,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_job and job:
            data["job"] = {
                "id": job.id,
                "dataset_id": job.dataset_id,
                "dataset_name": job.dataset.name if job.dataset else None,
                "split_info": job.split_info,
                "hyperparams": job.hyperparams,
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "finished_at": job.finished_at.isoformat() if job.finished_at else None,
                "duration_seconds": job.duration_seconds(),
                "epoch_logs": job.epoch_logs or [],
            }

        return data
