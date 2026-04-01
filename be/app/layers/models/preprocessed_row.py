"""PreprocessedRow — hasil preprocessing teks per baris"""

from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Text

from app.config.extensions import db


class PreprocessedRow(db.Model):
    __tablename__ = "preprocessed_rows"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    dataset_id = db.Column(
        db.String(36),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    raw_text = db.Column(Text, nullable=False)  # teks asli dari kolom teks
    preprocessed_text = db.Column(Text, nullable=False)  # setelah preprocessing
    label = db.Column(db.String(255), nullable=False, index=True)
    row_index = db.Column(db.Integer, nullable=True)  # posisi baris di raw file

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

    dataset = db.relationship("Dataset", back_populates="preprocessed_rows")

    def __repr__(self):
        return f"<PreprocessedRow {self.id} [{self.label}]>"

    def to_dict(self):
        return {
            "id": self.id,
            "dataset_id": self.dataset_id,
            "raw_text": self.raw_text,
            "preprocessed_text": self.preprocessed_text,
            "label": self.label,
            "row_index": self.row_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
