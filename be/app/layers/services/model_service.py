"""TrainedModel & Prediction service"""

import os
import threading

from sqlalchemy import asc, desc

from app.config.extensions import db
from app.layers.models.prediction import Prediction
from app.layers.models.trained_model import TrainedModel
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger

# ── Model cache (hindari reload tiap request) ──────────────────────────────────
# Key: model_id, Value: (tokenizer, hf_model, label_map)
_model_cache: dict = {}
_model_cache_lock = threading.RLock()
_MAX_CACHE = 3  # maksimal 3 model di RAM sekaligus


def _evict_cache_if_needed():
    with _model_cache_lock:
        if len(_model_cache) >= _MAX_CACHE:
            oldest_key = next(iter(_model_cache))
            del _model_cache[oldest_key]
            logger.info(f"Model cache evicted: {oldest_key}")


def invalidate_model_cache(model_id: str):
    """Panggil ini saat model diupdate/dihapus."""
    with _model_cache_lock:
        if model_id in _model_cache:
            del _model_cache[model_id]


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

    sortable_columns = {
        "created_at": TrainedModel.created_at,
        "updated_at": TrainedModel.updated_at,
        "name": TrainedModel.name,
        "model_type": TrainedModel.model_type,
        "is_active": TrainedModel.is_active,
        "is_public": TrainedModel.is_public,
    }
    sort_col = sortable_columns.get(sort_by, TrainedModel.created_at)
    sort_fn = desc if sort_order == "desc" else asc
    query = query.order_by(sort_fn(sort_col))

    models = query.offset((page - 1) * per_page).limit(per_page).all()
    return models, total


def get_active_models(model_type=None):
    """Untuk dropdown klasifikasi — hanya model aktif & publik."""
    query = (
        db.session.query(TrainedModel)
        .filter(TrainedModel.is_active, TrainedModel.is_public)
    )
    if model_type:
        query = query.filter(TrainedModel.model_type == model_type)
    return query.order_by(desc(TrainedModel.created_at)).all()


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
    from flask import current_app

    from app.layers.services import colab_service

    model = get_model_by_id(model_id)

    # Jika model ada di Drive, minta Colab hapus foldernya
    if model.file_path and model.file_path.startswith("/content/drive/"):
        session = colab_service.get_active_session()
        if session:
            api_key = current_app.config.get("COLAB_API_KEY", "")
            try:
                import requests as http_requests

                http_requests.post(
                    f"{session['url']}/models/delete",
                    json={"file_path": model.file_path},
                    headers={"X-Backend-Key": api_key},
                    timeout=30,
                )
                logger.info(f"Drive folder deletion requested: {model.file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete Drive folder: {e}")
        else:
            logger.warning(
                f"Colab offline — Drive folder not deleted: {model.file_path}"
            )

    # Hapus file lokal jika ada (classifier weights)
    if model.file_path and os.path.exists(model.file_path):
        try:
            os.remove(model.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete local file: {e}")

    invalidate_model_cache(model_id)
    db.session.delete(model)
    db.session.commit()
    logger.info(f"Model deleted: {model_id}")


# ── Classification ─────────────────────────────────────────────────────────────


def classify(model_id: str, text: str, user_id: str | None) -> Prediction:
    """
    Klasifikasi teks.
    Jika model ada di Drive (file_path berisi /content/drive/...),
    forward ke Colab inference endpoint.
    Jika model ada lokal, jalankan langsung.
    """
    from flask import current_app

    model_record = get_model_by_id(model_id)

    if not model_record.is_active:
        raise BadRequestError("Model tidak aktif")
    if not model_record.file_path:
        raise BadRequestError("File model tidak tersedia")

    file_path = model_record.file_path

    # Tentukan apakah model ada di Drive atau lokal
    is_drive_path = file_path.startswith("/content/drive/")

    if is_drive_path:
        result = _classify_via_colab(model_record, text, current_app)
    else:
        result = _classify_local(model_record, text)

    prediction = Prediction(
        input_text=text,
        predicted_label=result["predicted_label"],
        predicted_index=result["predicted_index"],
        confidence=result["confidence"],
        all_scores=result["all_scores"],
        model_id=model_id,
        user_id=user_id,
    )
    db.session.add(prediction)
    db.session.commit()

    logger.info(
        f"Prediction: model={model_id[:8]} "
        f"label={result['predicted_label']} "
        f"conf={result['confidence']}"
    )
    return prediction


def _classify_via_colab(model_record, text: str, app) -> dict:
    """Forward inference ke Colab server."""
    import requests as http_requests

    from app.layers.services import colab_service

    session = colab_service.get_active_session()
    if not session:
        raise BadRequestError(
            "Colab tidak aktif. Model ini tersimpan di Google Drive dan "
            "memerlukan Colab untuk inference. Hidupkan Colab terlebih dahulu."
        )

    api_key = app.config.get("COLAB_API_KEY", "")
    url = f"{session['url']}/predict"

    try:
        res = http_requests.post(
            url,
            json={
                "model_id": model_record.id,
                "file_path": model_record.file_path,
                "base_model_name": model_record.base_model_name,
                "num_labels": model_record.num_labels,
                "label_map": model_record.label_map,
                "text": text,
            },
            headers={"X-Backend-Key": api_key},
            timeout=120,
        )
        res.raise_for_status()
        data = res.json()

        logger.info(
            "Colab inference completed: model=%s success=%s",
            model_record.id,
            data.get("success"),
        )

        if not data.get("success"):
            raise BadRequestError(f"Colab inference gagal: {data.get('error')}")

        return data["data"]

    except http_requests.exceptions.Timeout:
        raise BadRequestError(
            "Inference timeout. Coba lagi — model mungkin sedang dimuat pertama kali."
        )
    except http_requests.exceptions.RequestException as e:
        raise BadRequestError(f"Gagal menghubungi Colab: {e}")


def _classify_local(model_record, text: str) -> dict:
    """
    Load dan jalankan inference dari file lokal.
    Dipakai jika file_path menunjuk ke storage lokal.
    """
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    model_id = model_record.id

    if model_id not in _model_cache:
        if not os.path.exists(model_record.file_path):
            raise BadRequestError(
                f"File model tidak ditemukan: {model_record.file_path}"
            )

        base = model_record.base_model_name or (
            "bert-base-multilingual-cased"
            if model_record.model_type == "mbert"
            else "xlm-roberta-base"
        )
        num_labels = model_record.num_labels or len(model_record.label_map or {}) or 2

        tokenizer = AutoTokenizer.from_pretrained(base)
        hf_model = AutoModelForSequenceClassification.from_pretrained(
            base, num_labels=num_labels
        )
        state_dict = torch.load(
            model_record.file_path, map_location="cpu", weights_only=True
        )
        hf_model.load_state_dict(state_dict)
        hf_model.eval()

        _evict_cache_if_needed()
        _model_cache[model_id] = (tokenizer, hf_model)

    tokenizer, hf_model = _model_cache[model_id]

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True,
    )
    with torch.no_grad():
        probs = torch.softmax(hf_model(**inputs).logits, dim=1)[0]

    label_map = model_record.label_map or {}
    all_scores = {
        label_map.get(str(i), str(i)): round(float(p), 4) for i, p in enumerate(probs)
    }
    predicted_index = int(probs.argmax())
    return {
        "predicted_label": label_map.get(str(predicted_index), str(predicted_index)),
        "predicted_index": predicted_index,
        "confidence": round(float(probs[predicted_index]), 4),
        "all_scores": all_scores,
    }


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
