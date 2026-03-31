"""Dataset database model"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON

from app.config.extensions import db


class DatasetStatus(PyEnum):
    UPLOADED = "uploaded"
    PREPROCESSING = "preprocessing"
    READY = "ready"
    ERROR = "error"


class Dataset(db.Model):
    __tablename__ = "datasets"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(Text, nullable=True)

    # File info
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=True)  # bytes

    # Dataset metadata (diisi setelah preprocessing)
    num_samples = db.Column(db.Integer, nullable=True)
    num_labels = db.Column(db.Integer, nullable=True)
    labels = db.Column(JSON, nullable=True)  # ["positif", "negatif", ...]
    text_column = db.Column(db.String(100), nullable=True)  # nama kolom teks
    label_column = db.Column(db.String(100), nullable=True)  # nama kolom label
    columns = db.Column(JSON, nullable=True)  # semua kolom yang ada di file

    # Split info (diisi setelah preprocessing)
    train_size = db.Column(db.Integer, nullable=True)
    val_size = db.Column(db.Integer, nullable=True)
    test_size = db.Column(db.Integer, nullable=True)

    # Status
    status = db.Column(
        Enum(DatasetStatus),
        default=DatasetStatus.UPLOADED,
        nullable=False,
    )
    error_message = db.Column(Text, nullable=True)

    # Relations
    uploaded_by = db.Column(
        db.String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
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
    training_jobs = db.relationship(
        "TrainingJob", back_populates="dataset", lazy="dynamic"
    )
    uploader = db.relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<Dataset {self.name}>"

    def to_dict(self, include_jobs=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "num_samples": self.num_samples,
            "num_labels": self.num_labels,
            "labels": self.labels,
            "text_column": self.text_column,
            "label_column": self.label_column,
            "columns": self.columns,
            "train_size": self.train_size,
            "val_size": self.val_size,
            "test_size": self.test_size,
            "status": self.status.value,
            "error_message": self.error_message,
            "uploaded_by": self.uploaded_by,
            "uploader_name": self.uploader.name if self.uploader else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_jobs:
            data["training_jobs_count"] = self.training_jobs.count()
        return data
