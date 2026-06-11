"""Dashboard controller"""

from sqlalchemy import desc, func

from app.config.extensions import db
from app.layers.models.dataset import Dataset
from app.layers.models.prediction import Prediction
from app.layers.models.trained_model import TrainedModel
from app.layers.models.training_job import JobStatus, TrainingJob
from app.layers.models.user import User
from app.utils.response import success_response


def get_stats():
    # ── Hitung total keseluruhan ──────────────────────────────────────────────
    total_users = db.session.query(User).count()
    total_datasets = db.session.query(Dataset).count()
    total_models = db.session.query(TrainedModel).count()
    total_jobs = db.session.query(TrainingJob).count()
    total_predictions = db.session.query(Prediction).count()

    # ── Perbandingan mBERT vs XLM-R ──────────────────────────────────────────
    model_type_rows = (
        db.session.query(TrainedModel.model_type, func.count(TrainedModel.id))
        .group_by(TrainedModel.model_type)
        .all()
    )
    model_type_counts = {mt: count for mt, count in model_type_rows}

    # Rata-rata F1 per tipe model
    model_type_avg_f1_rows = (
        db.session.query(TrainedModel.model_type, func.avg(TrainedModel.f1_score))
        .filter(TrainedModel.f1_score.isnot(None))
        .group_by(TrainedModel.model_type)
        .all()
    )
    model_type_avg_f1 = {mt: round(avg, 4) for mt, avg in model_type_avg_f1_rows}

    # ── Model terbaik (F1 tertinggi) ─────────────────────────────────────────
    best_model = (
        db.session.query(TrainedModel)
        .filter(TrainedModel.f1_score.isnot(None))
        .order_by(desc(TrainedModel.f1_score))
        .first()
    )

    # ── Model paling banyak digunakan (prediksi terbanyak) ───────────────────
    most_used_row = (
        db.session.query(
            Prediction.model_id, func.count(Prediction.id).label("cnt")
        )
        .group_by(Prediction.model_id)
        .order_by(func.count(Prediction.id).desc())
        .first()
    )
    most_used_model = None
    if most_used_row and most_used_row.model_id:
        m = db.session.get(TrainedModel, most_used_row.model_id)
        if m:
            most_used_model = {
                "id": m.id,
                "name": m.name,
                "model_type": m.model_type,
                "prediction_count": most_used_row.cnt,
            }

    # ── Distribusi label prediksi ─────────────────────────────────────────────
    label_dist_rows = (
        db.session.query(Prediction.predicted_label, func.count(Prediction.id))
        .group_by(Prediction.predicted_label)
        .all()
    )
    prediction_label_distribution = {
        label: count for label, count in label_dist_rows if label
    }

    # ── Data terbaru ──────────────────────────────────────────────────────────
    recent_datasets = (
        db.session.query(Dataset).order_by(desc(Dataset.created_at)).limit(5).all()
    )
    recent_models = (
        db.session.query(TrainedModel)
        .order_by(desc(TrainedModel.created_at))
        .limit(5)
        .all()
    )

    # ── Job yang sedang aktif ─────────────────────────────────────────────────
    active_jobs = (
        db.session.query(TrainingJob)
        .filter(TrainingJob.status.in_([JobStatus.QUEUED, JobStatus.RUNNING]))
        .order_by(desc(TrainingJob.created_at))
        .limit(3)
        .all()
    )

    return success_response(
        data={
            "totals": {
                "users": total_users,
                "datasets": total_datasets,
                "models": total_models,
                "training_jobs": total_jobs,
                "predictions": total_predictions,
            },
            "model_comparison": {
                "counts": model_type_counts,
                "avg_f1": model_type_avg_f1,
            },
            "best_model": {
                "id": best_model.id,
                "name": best_model.name,
                "model_type": best_model.model_type,
                "f1_score": best_model.f1_score,
                "accuracy": best_model.accuracy,
            }
            if best_model
            else None,
            "most_used_model": most_used_model,
            "prediction_label_distribution": prediction_label_distribution,
            "recent_datasets": [d.to_dict() for d in recent_datasets],
            "recent_models": [m.to_dict() for m in recent_models],
            "active_jobs": [j.to_dict() for j in active_jobs],
        },
        message="Dashboard statistics retrieved successfully",
    )
