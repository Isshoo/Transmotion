"""TrainingJob database model"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON

from app.config.extensions import db


class ModelType(PyEnum):
    MBERT = "mbert"
    XLMR = "xlmr"


class JobStatus(PyEnum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TrainingJob(db.Model):
    __tablename__ = "training_jobs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_name = db.Column(db.String(255), nullable=True)
    model_type = db.Column(Enum(ModelType), nullable=False)
    hyperparams = db.Column(JSON, nullable=False, default=dict)
    split_info = db.Column(JSON, nullable=True)

    status = db.Column(
        Enum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True
    )
    progress = db.Column(db.Integer, default=0)
    current_epoch = db.Column(db.Integer, default=0)
    total_epochs = db.Column(db.Integer, default=0)
    epoch_logs = db.Column(JSON, nullable=True, default=list)

    # Test set metrics (final)
    final_accuracy = db.Column(db.Float, nullable=True)
    final_f1 = db.Column(db.Float, nullable=True)
    final_precision = db.Column(db.Float, nullable=True)
    final_recall = db.Column(db.Float, nullable=True)
    final_mcc = db.Column(db.Float, nullable=True)
    final_roc_auc = db.Column(db.Float, nullable=True)
    final_mean_std = db.Column(db.Float, nullable=True)

    # Eval set metrics (dari validation selama training)
    eval_accuracy = db.Column(db.Float, nullable=True)
    eval_f1 = db.Column(db.Float, nullable=True)
    eval_precision = db.Column(db.Float, nullable=True)
    eval_recall = db.Column(db.Float, nullable=True)

    # Confusion matrix & per-class (test set)
    confusion_matrix = db.Column(JSON, nullable=True)
    per_class_metrics = db.Column(JSON, nullable=True)
    macro_avg = db.Column(JSON, nullable=True)
    weighted_avg = db.Column(JSON, nullable=True)

    # Confusion matrix & per-class (eval set)
    eval_confusion_matrix = db.Column(JSON, nullable=True)
    eval_per_class_metrics = db.Column(JSON, nullable=True)
    eval_macro_avg = db.Column(JSON, nullable=True)
    eval_weighted_avg = db.Column(JSON, nullable=True)

    error_message = db.Column(Text, nullable=True)
    started_at = db.Column(db.DateTime(timezone=True), nullable=True)
    finished_at = db.Column(db.DateTime(timezone=True), nullable=True)
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
    colab_session_id = db.Column(db.String(255), nullable=True)

    dataset_id = db.Column(
        db.String(36),
        ForeignKey("datasets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by = db.Column(
        db.String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    dataset = db.relationship("Dataset", back_populates="training_jobs")
    creator = db.relationship("User", foreign_keys=[created_by])
    trained_model = db.relationship("TrainedModel", back_populates="job", uselist=False)

    def __repr__(self):
        return f"<TrainingJob {self.id} [{self.status.value}]>"

    def duration_seconds(self):
        if self.started_at and self.finished_at:
            return int((self.finished_at - self.started_at).total_seconds())
        return None

    def display_name(self):
        if self.job_name:
            return self.job_name
        model = self.model_type.value.upper()
        ds = self.dataset.name if self.dataset else "?"
        return f"{model} — {ds}"

    def to_dict(self, include_model=False):
        data = {
            "id": self.id,
            "job_name": self.job_name,
            "display_name": self.display_name(),
            "model_type": self.model_type.value,
            "hyperparams": self.hyperparams,
            "split_info": self.split_info,
            "status": self.status.value,
            "progress": self.progress,
            "current_epoch": self.current_epoch,
            "total_epochs": self.total_epochs,
            "epoch_logs": self.epoch_logs or [],
            # Test set
            "final_accuracy": self.final_accuracy,
            "final_f1": self.final_f1,
            "final_precision": self.final_precision,
            "final_recall": self.final_recall,
            "final_mcc": self.final_mcc,
            "final_roc_auc": self.final_roc_auc,
            "final_mean_std": self.final_mean_std,
            # Eval set
            "eval_accuracy": self.eval_accuracy,
            "eval_f1": self.eval_f1,
            "eval_precision": self.eval_precision,
            "eval_recall": self.eval_recall,
            # Confusion matrix test
            "confusion_matrix": self.confusion_matrix,
            "per_class_metrics": self.per_class_metrics,
            "macro_avg": self.macro_avg,
            "weighted_avg": self.weighted_avg,
            # Confusion matrix eval
            "eval_confusion_matrix": self.eval_confusion_matrix,
            "eval_per_class_metrics": self.eval_per_class_metrics,
            "eval_macro_avg": self.eval_macro_avg,
            "eval_weighted_avg": self.eval_weighted_avg,
            "error_message": self.error_message,
            "duration_seconds": self.duration_seconds(),
            "colab_session_id": self.colab_session_id,
            "dataset_id": self.dataset_id,
            "dataset_name": self.dataset.name if self.dataset else None,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_model and self.trained_model:
            data["trained_model"] = self.trained_model.to_dict()
        return data
