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


def _parse_err(err: ValidationError):
    return error_response(
        message=f"Validasi gagal: {', '.join([v[0] for v in err.messages.values()])}",
        errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
        status_code=422,
    )


# ── Model ──────────────────────────────────────────────────────────────────────


def list_models():
    try:
        params = ModelListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_err(err)

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
    stats = model_service.get_prediction_stats(model_id)
    data = model.to_dict(include_job=True)
    data.update(stats)
    return success_response(data=data, message="Detail model berhasil diambil")


def get_active_models():
    model_type = request.args.get("model_type")
    models = model_service.get_active_models(model_type=model_type)
    return success_response(
        data=[
            {
                "id": m.id,
                "name": m.name,
                "model_type": m.model_type,
                "accuracy": m.accuracy,
                "f1_score": m.f1_score,
                "num_labels": m.num_labels,
                "labels": list((m.label_map or {}).values()),
                "label_map": m.label_map,
            }
            for m in models
        ],
        message="Model aktif berhasil diambil",
    )


def update_model(model_id):
    try:
        data = UpdateTrainedModelSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_err(err)

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
        return _parse_err(err)

    current_user = getattr(request, "current_user", None)
    user_id = current_user.id if current_user else None

    prediction = model_service.classify(
        model_id=data["model_id"],
        text=data["text"],
        user_id=user_id,
    )
    return success_response(data=prediction.to_dict(), message="Klasifikasi berhasil")


def classify_batch():
    """Klasifikasi banyak teks sekaligus (dari CSV atau list)."""
    data = request.get_json() or {}
    model_id = data.get("model_id")
    texts = data.get("texts", [])

    if not model_id:
        return error_response("model_id harus diisi", 400)
    if not texts or not isinstance(texts, list):
        return error_response("texts harus berupa list", 400)
    if len(texts) > 500:
        return error_response("Maksimal 500 teks per request", 400)

    current_user = getattr(request, "current_user", None)
    user_id = current_user.id if current_user else None

    results = []
    errors = []

    for i, text in enumerate(texts):
        if not isinstance(text, str) or not text.strip():
            errors.append({"index": i, "error": "Teks kosong"})
            continue
        try:
            pred = model_service.classify(
                model_id=model_id,
                text=text.strip(),
                user_id=user_id,
            )
            results.append(pred.to_dict())
        except Exception as e:
            errors.append({"index": i, "text": text[:50], "error": str(e)})

    return success_response(
        data={"results": results, "errors": errors, "total": len(texts)},
        message=f"{len(results)} teks berhasil diklasifikasikan",
    )


def list_predictions():
    try:
        params = PredictionListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_err(err)

    current_user = getattr(request, "current_user", None)
    # Admin bisa lihat semua, user biasa hanya milik sendiri
    if current_user and current_user.role.value == "admin":
        filter_user_id = params.get("user_id")
    else:
        filter_user_id = current_user.id if current_user else None

    predictions, total = model_service.get_predictions(
        page=params["page"],
        per_page=params["per_page"],
        model_id=params.get("model_id"),
        user_id=filter_user_id,
    )
    return paginated_response(
        data=[p.to_dict() for p in predictions],
        total=total,
        page=params["page"],
        per_page=params["per_page"],
        message="Riwayat prediksi berhasil diambil",
    )


def get_evaluation_datasets():
    """
    Ambil daftar dataset yang memiliki minimal 1 model terlatih
    (mbert atau xlmr). Untuk filter di halaman evaluasi.
    """
    from sqlalchemy import distinct

    from app.config.extensions import db
    from app.layers.models.dataset import Dataset
    from app.layers.models.trained_model import TrainedModel
    from app.layers.models.training_job import TrainingJob

    # Ambil dataset_id yang punya model terlatih
    dataset_ids = (
        db.session.query(distinct(TrainingJob.dataset_id))
        .join(TrainedModel, TrainedModel.job_id == TrainingJob.id)
        .filter(TrainingJob.dataset_id.isnot(None))
        .all()
    )
    ids = [r[0] for r in dataset_ids]

    datasets = (
        db.session.query(Dataset)
        .filter(Dataset.id.in_(ids))
        .order_by(Dataset.name.asc())
        .all()
    )

    return success_response(
        data=[
            {
                "id": ds.id,
                "name": ds.name,
                "num_rows_preprocessed": ds.num_rows_preprocessed,
                "labels": list((ds.class_distribution_preprocessed or {}).keys()),
                "text_column": ds.text_column,
                "label_column": ds.label_column,
            }
            for ds in datasets
        ],
        message="Dataset evaluasi berhasil diambil",
    )


def get_evaluation_compare():
    """
    Ambil semua model terlatih beserta info job dan dataset-nya,
    dikelompokkan per dataset.
    Query param: dataset_id (opsional)
    """
    from flask import request as flask_request

    from app.config.extensions import db
    from app.layers.models.trained_model import TrainedModel
    from app.layers.models.training_job import TrainingJob

    dataset_id = flask_request.args.get("dataset_id")

    query = (
        db.session.query(TrainedModel)
        .join(TrainingJob, TrainedModel.job_id == TrainingJob.id)
        .filter(TrainingJob.dataset_id.isnot(None))
        .order_by(TrainingJob.dataset_id.asc(), TrainingJob.created_at.asc())
    )

    if dataset_id:
        query = query.filter(TrainingJob.dataset_id == dataset_id)

    models = query.all()

    # Kelompokkan: { dataset_id: { name, mbert: [...], xlmr: [...] } }
    grouped = {}
    for m in models:
        job = m.job
        if not job or not job.dataset_id:
            continue

        ds_id = job.dataset_id
        ds_name = job.dataset.name if job.dataset else ds_id

        if ds_id not in grouped:
            grouped[ds_id] = {
                "dataset_id": ds_id,
                "dataset_name": ds_name,
                "mbert": [],
                "xlmr": [],
            }

        model_dict = m.to_dict(include_job=True)
        # Tambahkan test_size dari split_info untuk pengelompokan split
        model_dict["test_size"] = (
            job.split_info.get("test_size") if job.split_info else None
        )

        if m.model_type == "mbert":
            grouped[ds_id]["mbert"].append(model_dict)
        elif m.model_type == "xlmr":
            grouped[ds_id]["xlmr"].append(model_dict)

    return success_response(
        data=list(grouped.values()),
        message="Data evaluasi berhasil diambil",
    )
