"""Prediction database model"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON

from app.config.extensions import db


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Input
    input_text = db.Column(Text, nullable=False)

    # Output
    predicted_label = db.Column(db.String(100), nullable=True)
    predicted_index = db.Column(db.Integer, nullable=True)
    confidence = db.Column(db.Float, nullable=True)  # skor tertinggi (0–1)
    all_scores = db.Column(JSON, nullable=True)
    # contoh: {"negatif": 0.05, "netral": 0.12, "positif": 0.83}

    # Meta
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Foreign keys
    model_id = db.Column(
        db.String(36),
        ForeignKey("trained_models.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    user_id = db.Column(
        db.String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Relationships
    model = db.relationship("TrainedModel", back_populates="predictions")
    user = db.relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Prediction {self.id} → {self.predicted_label}>"

    def to_dict(self):
        return {
            "id": self.id,
            "input_text": self.input_text,
            "predicted_label": self.predicted_label,
            "predicted_index": self.predicted_index,
            "confidence": self.confidence,
            "all_scores": self.all_scores,
            "model_id": self.model_id,
            "model_name": self.model.name if self.model else None,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
