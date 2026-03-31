"""TrainedModel & Prediction service"""

from sqlalchemy import asc, desc

from app.config.extensions import db
from app.layers.models.prediction import Prediction
from app.layers.models.trained_model import TrainedModel
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger

# ── Trained Model ─────────────────────────────────────────────────────────────


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

    offset = (page - 1) * per_page
    models = query.offset(offset).limit(per_page).all()

    return models, total


def get_active_models():
    """Untuk dropdown di halaman klasifikasi."""
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
    return model


def delete_model(model_id: str):
    import os

    model = get_model_by_id(model_id)

    # Hapus file
    if model.file_path and os.path.exists(model.file_path):
        try:
            os.remove(model.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete model file {model.file_path}: {e}")

    db.session.delete(model)
    db.session.commit()
    logger.info(f"Model deleted: {model_id}")


# ── Prediction ────────────────────────────────────────────────────────────────


def classify(model_id: str, text: str, user_id: str | None) -> Prediction:
    """
    Jalankan inferensi teks menggunakan model yang dipilih.
    Model dimuat dari file .pt — cocok untuk deployment ringan.
    """
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    model_record = get_model_by_id(model_id)

    if not model_record.is_active:
        raise BadRequestError("Model tidak aktif")
    if not model_record.file_path:
        raise BadRequestError("File model tidak tersedia")

    try:
        # Tentukan base model berdasarkan tipe
        if model_record.base_model_name:
            base = model_record.base_model_name
        elif model_record.model_type == "mbert":
            base = "bert-base-multilingual-cased"
        else:
            base = "xlm-roberta-base"

        # Load tokenizer dan model
        tokenizer = AutoTokenizer.from_pretrained(base)
        hf_model = AutoModelForSequenceClassification.from_pretrained(
            base, num_labels=model_record.num_labels or 2
        )

        # Load weights dari file yang disimpan
        state_dict = torch.load(model_record.file_path, map_location="cpu")
        hf_model.load_state_dict(state_dict)
        hf_model.eval()

        # Tokenisasi
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

        # Map label
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
        logger.error(f"Classification error: {e}")
        raise BadRequestError(f"Gagal melakukan klasifikasi: {str(e)}") from None


def get_predictions(page=1, per_page=20, model_id=None, user_id=None):
    query = db.session.query(Prediction)

    if model_id:
        query = query.filter(Prediction.model_id == model_id)
    if user_id:
        query = query.filter(Prediction.user_id == user_id)

    total = query.count()
    query = query.order_by(desc(Prediction.created_at))

    offset = (page - 1) * per_page
    predictions = query.offset(offset).limit(per_page).all()

    return predictions, total
