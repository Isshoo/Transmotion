"""TrainedModel & Prediction controller"""

from flask import request
from marshmallow import ValidationError

from app.layers.schemas.model_schema import (
    ClassifyTextSchema,
    ModelListQuerySchema,
    PredictionListQuerySchema,
    UpdateTrainedModelSchema,
)
from app.layers.services import model_service
from app.utils.response import error_response, paginated_response, success_response


def _parse_validation_error(err: ValidationError):
    return error_response(
        message=f"Validasi gagal: {', '.join([v[0] for v in err.messages.values()])}",
        errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
        status_code=422,
    )


# ── Trained Models ─────────────────────────────────────────────────────────────


def list_models():
    try:
        params = ModelListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_validation_error(err)

    models, total = model_service.get_all_models(
        page=params["page"],
        per_page=params["per_page"],
        model_type=params.get("model_type"),
        is_active=params.get("is_active"),
        is_public=params.get("is_public"),
        sort_by=params.get("sort_by", "created_at"),
        sort_order=params.get("sort_order", "desc"),
    )
    return paginated_response(
        data=[m.to_dict(include_job=True) for m in models],
        total=total,
        page=params["page"],
        per_page=params["per_page"],
        message="Daftar model berhasil diambil",
    )


def get_model(model_id):
    model = model_service.get_model_by_id(model_id)
    return success_response(
        data=model.to_dict(include_job=True),
        message="Detail model berhasil diambil",
    )


def get_active_models():
    """Untuk dropdown di halaman klasifikasi — hanya model aktif & publik."""
    models = model_service.get_active_models()
    return success_response(
        data=[
            {
                "id": m.id,
                "name": m.name,
                "model_type": m.model_type,
                "accuracy": m.accuracy,
                "num_labels": m.num_labels,
                "labels": list((m.label_map or {}).values()),
            }
            for m in models
        ],
        message="Model aktif berhasil diambil",
    )


def update_model(model_id):
    try:
        data = UpdateTrainedModelSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_validation_error(err)

    model = model_service.update_model(model_id, **data)
    return success_response(data=model.to_dict(), message="Model berhasil diperbarui")


def delete_model(model_id):
    model_service.delete_model(model_id)
    return success_response(message="Model berhasil dihapus")


# ── Classification ─────────────────────────────────────────────────────────────


def classify():
    try:
        data = ClassifyTextSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_validation_error(err)

    user_id = getattr(request, "current_user", None)
    user_id = user_id.id if user_id else None

    prediction = model_service.classify(
        model_id=data["model_id"],
        text=data["text"],
        user_id=user_id,
    )
    return success_response(
        data=prediction.to_dict(),
        message="Klasifikasi berhasil",
    )


def list_predictions():
    try:
        params = PredictionListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_validation_error(err)

    # User biasa hanya bisa lihat prediksi milik sendiri
    user = getattr(request, "current_user", None)
    user_id = (
        None if (user and user.role.value == "admin") else (user.id if user else None)
    )

    predictions, total = model_service.get_predictions(
        page=params["page"],
        per_page=params["per_page"],
        model_id=params.get("model_id"),
        user_id=user_id,
    )
    return paginated_response(
        data=[p.to_dict() for p in predictions],
        total=total,
        page=params["page"],
        per_page=params["per_page"],
        message="Riwayat prediksi berhasil diambil",
    )
