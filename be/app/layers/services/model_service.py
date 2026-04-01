"""TrainedModel & Prediction service"""

import os

from sqlalchemy import asc, desc

from app.config.extensions import db
from app.layers.models.prediction import Prediction
from app.layers.models.trained_model import TrainedModel
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger

# ── Model cache (hindari reload tiap request) ──────────────────────────────────
# Key: model_id, Value: (tokenizer, hf_model, label_map)
_model_cache: dict = {}
_MAX_CACHE = 3  # maksimal 3 model di RAM sekaligus


def _evict_cache_if_needed():
    if len(_model_cache) >= _MAX_CACHE:
        oldest_key = next(iter(_model_cache))
        del _model_cache[oldest_key]
        logger.info(f"Model cache evicted: {oldest_key}")


def _load_model(model_record: TrainedModel):
    """
    Load tokenizer + model ke memori.
    Coba load dari file .pt dulu, jika gagal load base model saja (untuk testing).
    """
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    model_id = model_record.id

    if model_id in _model_cache:
        return _model_cache[model_id]

    if model_record.model_type == "mbert":
        base = model_record.base_model_name or "bert-base-multilingual-cased"
    else:
        base = model_record.base_model_name or "xlm-roberta-base"

    num_labels = model_record.num_labels or len(model_record.label_map or {}) or 2

    try:
        tokenizer = AutoTokenizer.from_pretrained(base)
        hf_model = AutoModelForSequenceClassification.from_pretrained(
            base, num_labels=num_labels
        )

        # Load fine-tuned weights jika file tersedia
        if model_record.file_path and os.path.exists(model_record.file_path):
            state_dict = torch.load(
                model_record.file_path, map_location="cpu", weights_only=True
            )
            hf_model.load_state_dict(state_dict)
            logger.info(f"Loaded fine-tuned weights for model {model_id}")
        else:
            logger.warning(
                f"Model file not found for {model_id}, using base weights only"
            )

        hf_model.eval()

        _evict_cache_if_needed()
        _model_cache[model_id] = (tokenizer, hf_model)
        return tokenizer, hf_model

    except Exception as e:
        logger.error(f"Failed to load model {model_id}: {e}")
        raise BadRequestError(f"Gagal memuat model: {e}") from None


def invalidate_model_cache(model_id: str):
    """Panggil ini saat model diupdate/dihapus."""
    if model_id in _model_cache:
        del _model_cache[model_id]


# ── Trained Model CRUD ─────────────────────────────────────────────────────────


def get_model_by_id(model_id: str) -> TrainedModel:
    model = db.session.get(TrainedModel, model_id)
    if not model:
        raise NotFoundError("Model tidak ditemukan")
    return model


def get_all_models(
    page=1,
    per_page=20,
    model_type=None,
    is_active=None,
    is_public=None,
    sort_by="created_at",
    sort_order="desc",
):
    query = db.session.query(TrainedModel)

    if model_type:
        query = query.filter(TrainedModel.model_type == model_type)
    if is_active is not None:
        query = query.filter(TrainedModel.is_active == is_active)
    if is_public is not None:
        query = query.filter(TrainedModel.is_public == is_public)

    total = query.count()

    sort_col = getattr(TrainedModel, sort_by, TrainedModel.created_at)
    sort_fn = desc if sort_order == "desc" else asc
    query = query.order_by(sort_fn(sort_col))

    models = query.offset((page - 1) * per_page).limit(per_page).all()
    return models, total


def get_active_models():
    """Untuk dropdown klasifikasi — hanya model aktif & publik."""
    return (
        db.session.query(TrainedModel)
        .filter(TrainedModel.is_active, TrainedModel.is_public)
        .order_by(desc(TrainedModel.created_at))
        .all()
    )


def update_model(model_id: str, **kwargs) -> TrainedModel:
    model = get_model_by_id(model_id)
    allowed = {"name", "description", "is_active", "is_public"}
    for key, value in kwargs.items():
        if key in allowed and value is not None:
            setattr(model, key, value)
    db.session.commit()
    invalidate_model_cache(model_id)
    return model


def delete_model(model_id: str):
    model = get_model_by_id(model_id)

    if model.file_path and os.path.exists(model.file_path):
        try:
            os.remove(model.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete model file: {e}")

    invalidate_model_cache(model_id)
    db.session.delete(model)
    db.session.commit()
    logger.info(f"Model deleted: {model_id}")


# ── Classification ─────────────────────────────────────────────────────────────


def classify(model_id: str, text: str, user_id: str | None) -> Prediction:
    import torch

    model_record = get_model_by_id(model_id)

    if not model_record.is_active:
        raise BadRequestError("Model tidak aktif")

    tokenizer, hf_model = _load_model(model_record)

    try:
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )

        with torch.no_grad():
            outputs = hf_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)[0]

        label_map = model_record.label_map or {}
        all_scores = {
            label_map.get(str(i), str(i)): round(float(p), 4)
            for i, p in enumerate(probs)
        }
        predicted_index = int(probs.argmax())
        predicted_label = label_map.get(str(predicted_index), str(predicted_index))
        confidence = round(float(probs[predicted_index]), 4)

        prediction = Prediction(
            input_text=text,
            predicted_label=predicted_label,
            predicted_index=predicted_index,
            confidence=confidence,
            all_scores=all_scores,
            model_id=model_id,
            user_id=user_id,
        )
        db.session.add(prediction)
        db.session.commit()

        logger.info(
            f"Prediction: model={model_id} label={predicted_label} conf={confidence}"
        )
        return prediction

    except (BadRequestError, NotFoundError):
        raise
    except Exception as e:
        logger.error(f"Classification error for model {model_id}: {e}")
        raise BadRequestError(f"Gagal melakukan klasifikasi: {e}") from None


def get_predictions(
    page=1,
    per_page=20,
    model_id=None,
    user_id=None,
):
    query = db.session.query(Prediction)

    if model_id:
        query = query.filter(Prediction.model_id == model_id)
    if user_id:
        query = query.filter(Prediction.user_id == user_id)

    total = query.count()
    predictions = (
        query.order_by(desc(Prediction.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return predictions, total


def get_prediction_stats(model_id: str) -> dict:
    """Statistik prediksi untuk halaman detail model."""
    from sqlalchemy import func

    total = (
        db.session.query(func.count(Prediction.id))
        .filter(Prediction.model_id == model_id)
        .scalar()
    ) or 0

    per_label = (
        db.session.query(Prediction.predicted_label, func.count(Prediction.id))
        .filter(Prediction.model_id == model_id)
        .group_by(Prediction.predicted_label)
        .all()
    )

    return {
        "total_predictions": total,
        "per_label": {label: count for label, count in per_label},
    }
