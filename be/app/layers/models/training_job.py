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

    # Config
    model_type = db.Column(Enum(ModelType), nullable=False)
    hyperparams = db.Column(JSON, nullable=False, default=dict)
    # hyperparams contoh:
    # {
    #   "learning_rate": 2e-5,
    #   "epochs": 3,
    #   "batch_size": 16,
    #   "max_length": 128,
    #   "warmup_steps": 0,
    #   "weight_decay": 0.01
    # }

    # Status & progress
    status = db.Column(
        Enum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True
    )
    progress = db.Column(db.Integer, default=0)  # 0-100 (%)
    current_epoch = db.Column(db.Integer, default=0)
    total_epochs = db.Column(db.Integer, default=0)

    # Metrics per epoch — list of dicts
    epoch_logs = db.Column(JSON, nullable=True, default=list)
    # contoh: [{"epoch": 1, "train_loss": 0.45, "val_loss": 0.38, "val_accuracy": 0.87}]

    # Hasil akhir
    final_accuracy = db.Column(db.Float, nullable=True)
    final_f1 = db.Column(db.Float, nullable=True)
    final_precision = db.Column(db.Float, nullable=True)
    final_recall = db.Column(db.Float, nullable=True)

    # Error info
    error_message = db.Column(Text, nullable=True)

    # Timestamps
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

    # Colab session identifier (opsional, untuk tracking)
    colab_session_id = db.Column(db.String(255), nullable=True)

    # Foreign keys
    dataset_id = db.Column(
        db.String(36),
        ForeignKey("datasets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by = db.Column(
        db.String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    dataset = db.relationship("Dataset", back_populates="training_jobs")
    creator = db.relationship("User", foreign_keys=[created_by])
    trained_model = db.relationship("TrainedModel", back_populates="job", uselist=False)

    def __repr__(self):
        return f"<TrainingJob {self.id} [{self.status.value}]>"

    def duration_seconds(self):
        if self.started_at and self.finished_at:
            return int((self.finished_at - self.started_at).total_seconds())
        return None

    def to_dict(self, include_model=False):
        data = {
            "id": self.id,
            "model_type": self.model_type.value,
            "hyperparams": self.hyperparams,
            "status": self.status.value,
            "progress": self.progress,
            "current_epoch": self.current_epoch,
            "total_epochs": self.total_epochs,
            "epoch_logs": self.epoch_logs or [],
            "final_accuracy": self.final_accuracy,
            "final_f1": self.final_f1,
            "final_precision": self.final_precision,
            "final_recall": self.final_recall,
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
