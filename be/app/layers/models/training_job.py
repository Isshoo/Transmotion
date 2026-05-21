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

    # Process tracking
    status = db.Column(
        Enum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True
    )
    progress = db.Column(db.Integer, default=0)
    current_epoch = db.Column(db.Integer, default=0)
    total_epochs = db.Column(db.Integer, default=0)
    epoch_logs = db.Column(JSON, nullable=True, default=list)

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

        # Proxy metrics dari trained_model (single source of truth).
        # Key tetap sama agar frontend tidak perlu diubah.
        tm = self.trained_model
        data.update(
            {
                # Test set metrics
                "final_accuracy": tm.accuracy if tm else None,
                "final_f1": tm.f1_score if tm else None,
                "final_precision": tm.precision if tm else None,
                "final_recall": tm.recall if tm else None,
                "final_mcc": tm.mcc if tm else None,
                "final_roc_auc": tm.roc_auc if tm else None,
                "final_mean_std": tm.mean_std if tm else None,
                # Eval set metrics
                "eval_accuracy": tm.eval_accuracy if tm else None,
                "eval_f1": tm.eval_f1 if tm else None,
                "eval_precision": tm.eval_precision if tm else None,
                "eval_recall": tm.eval_recall if tm else None,
                # Confusion matrix & per-class (test)
                "confusion_matrix": tm.confusion_matrix if tm else None,
                "per_class_metrics": tm.per_class_metrics if tm else None,
                "macro_avg": tm.macro_avg if tm else None,
                "weighted_avg": tm.weighted_avg if tm else None,
                # Confusion matrix & per-class (eval)
                "eval_confusion_matrix": tm.eval_confusion_matrix if tm else None,
                "eval_per_class_metrics": tm.eval_per_class_metrics if tm else None,
                "eval_macro_avg": tm.eval_macro_avg if tm else None,
                "eval_weighted_avg": tm.eval_weighted_avg if tm else None,
            }
        )

        if include_model and tm:
            data["trained_model"] = tm.to_dict()
        return data
