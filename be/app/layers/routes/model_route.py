"""TrainedModel & Prediction routes"""

from flask import Blueprint

from app.layers.controllers import model_controller
from app.layers.middlewares.auth_middleware import (
    admin_required,
    jwt_required_custom,
    optional_jwt,
)

model_bp = Blueprint("models", __name__, url_prefix="/api/models")
prediction_bp = Blueprint("predictions", __name__, url_prefix="/api/predictions")


# ── Model routes ───────────────────────────────────────────────────────────────


@model_bp.route("", methods=["GET"])
@jwt_required_custom
def list_models():
    return model_controller.list_models()


@model_bp.route("/active", methods=["GET"])
@optional_jwt
def get_active_models():
    """Endpoint publik — untuk dropdown klasifikasi."""
    return model_controller.get_active_models()


@model_bp.route("/<model_id>", methods=["GET"])
@jwt_required_custom
def get_model(model_id):
    return model_controller.get_model(model_id)


@model_bp.route("/<model_id>", methods=["PUT", "PATCH"])
@admin_required
def update_model(model_id):
    return model_controller.update_model(model_id)


@model_bp.route("/<model_id>", methods=["DELETE"])
@admin_required
def delete_model(model_id):
    return model_controller.delete_model(model_id)


@model_bp.route("/evaluation/datasets", methods=["GET"])
@jwt_required_custom
def get_evaluation_datasets():
    return model_controller.get_evaluation_datasets()


@model_bp.route("/evaluation/compare", methods=["GET"])
@jwt_required_custom
def get_evaluation_compare():
    return model_controller.get_evaluation_compare()


# ── Classification routes ──────────────────────────────────────────────────────


@prediction_bp.route("/classify", methods=["POST"])
@optional_jwt
def classify():
    """Klasifikasi teks — bisa diakses tanpa login (opsional)."""
    return model_controller.classify()


@prediction_bp.route("/classify/batch", methods=["POST"])
@optional_jwt
def classify_batch():
    return model_controller.classify_batch()


@prediction_bp.route("", methods=["GET"])
@jwt_required_custom
def list_predictions():
    return model_controller.list_predictions()
