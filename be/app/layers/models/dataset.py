"""Dataset database model"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON

from app.config.extensions import db


class DatasetStatus(PyEnum):
    UPLOADED = "uploaded"  # baru diupload, kolom belum dikonfigurasi
    READY = "ready"  # kolom sudah diatur, siap dipakai training
    ERROR = "error"


class PreprocessingStatus(PyEnum):
    IDLE = "idle"  # belum pernah dipreprocess
    RUNNING = "running"  # sedang preprocessing
    COMPLETED = "completed"  # selesai
    ERROR = "error"  # gagal


class Dataset(db.Model):
    __tablename__ = "datasets"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(Text, nullable=True)

    # File raw (setelah cleaning dasar saat upload)
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=True)

    # Skema
    columns = db.Column(JSON, nullable=True)  # nama semua kolom
    num_rows_raw = db.Column(
        db.Integer, nullable=True
    )  # jumlah baris setelah cleaning upload

    # Pengaturan kolom (diatur user setelah upload)
    text_column = db.Column(db.String(100), nullable=True)
    label_column = db.Column(db.String(100), nullable=True)

    # Distribusi kelas
    class_distribution_raw = db.Column(JSON, nullable=True)
    # contoh: {"positif": 300, "negatif": 200, "netral": 100}
    class_distribution_preprocessed = db.Column(JSON, nullable=True)

    # Preprocessing
    preprocessing_status = db.Column(
        Enum(PreprocessingStatus),
        default=PreprocessingStatus.IDLE,
        nullable=False,
    )
    preprocessing_error = db.Column(Text, nullable=True)
    num_rows_preprocessed = db.Column(db.Integer, nullable=True)

    # Status keseluruhan
    status = db.Column(
        Enum(DatasetStatus),
        default=DatasetStatus.UPLOADED,
        nullable=False,
    )
    error_message = db.Column(Text, nullable=True)

    # Relasi
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
    uploader = db.relationship("User", foreign_keys=[uploaded_by])
    training_jobs = db.relationship(
        "TrainingJob", back_populates="dataset", lazy="dynamic"
    )
    preprocessed_rows = db.relationship(
        "PreprocessedRow",
        back_populates="dataset",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Dataset {self.name}>"

    def columns_configured(self):
        return bool(self.text_column and self.label_column)

    def to_dict(self, include_jobs=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "columns": self.columns,
            "num_rows_raw": self.num_rows_raw,
            "text_column": self.text_column,
            "label_column": self.label_column,
            "class_distribution_raw": self.class_distribution_raw,
            "class_distribution_preprocessed": self.class_distribution_preprocessed,
            "num_rows_preprocessed": self.num_rows_preprocessed,
            "preprocessing_status": self.preprocessing_status.value,
            "preprocessing_error": self.preprocessing_error,
            "columns_configured": self.columns_configured(),
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
