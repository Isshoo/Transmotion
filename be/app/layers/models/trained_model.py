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

    # Metrik evaluasi
    accuracy = db.Column(db.Float, nullable=True)
    f1_score = db.Column(db.Float, nullable=True)
    precision = db.Column(db.Float, nullable=True)
    recall = db.Column(db.Float, nullable=True)

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

    def to_dict(self, include_job=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "model_type": self.model_type,
            "base_model_name": self.base_model_name,
            "label_map": self.label_map,
            "num_labels": self.num_labels,
            "accuracy": self.accuracy,
            "f1_score": self.f1_score,
            "precision": self.precision,
            "recall": self.recall,
            "training_config": self.training_config,
            "file_size": self.file_size,
            "is_active": self.is_active,
            "is_public": self.is_public,
            "job_id": self.job_id,
            "prediction_count": self.predictions.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_job and self.job:
            data["job"] = {
                "id": self.job.id,
                "dataset_name": self.job.dataset.name if self.job.dataset else None,
                "started_at": self.job.started_at.isoformat()
                if self.job.started_at
                else None,
                "finished_at": self.job.finished_at.isoformat()
                if self.job.finished_at
                else None,
                "duration_seconds": self.job.duration_seconds(),
            }
        return data
