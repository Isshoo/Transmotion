"""Dataset routes"""

from flask import Blueprint

from app.layers.controllers import dataset_controller
from app.layers.middlewares.auth_middleware import admin_required, jwt_required_custom

dataset_bp = Blueprint("datasets", __name__, url_prefix="/api/datasets")


@dataset_bp.route("", methods=["GET"])
@jwt_required_custom
def list_datasets():
    return dataset_controller.list_datasets()


@dataset_bp.route("/<dataset_id>", methods=["GET"])
@jwt_required_custom
def get_dataset(dataset_id):
    return dataset_controller.get_dataset(dataset_id)


@dataset_bp.route("", methods=["POST"])
@admin_required
def upload_dataset():
    return dataset_controller.upload_dataset()


@dataset_bp.route("/<dataset_id>", methods=["DELETE"])
@admin_required
def delete_dataset(dataset_id):
    return dataset_controller.delete_dataset(dataset_id)


@dataset_bp.route("/<dataset_id>/columns", methods=["PUT"])
@admin_required
def set_columns(dataset_id):
    return dataset_controller.set_columns(dataset_id)


@dataset_bp.route("/<dataset_id>/raw", methods=["GET"])
@jwt_required_custom
def get_raw_data(dataset_id):
    return dataset_controller.get_raw_data(dataset_id)


@dataset_bp.route("/<dataset_id>/preprocess", methods=["POST"])
@admin_required
def start_preprocessing(dataset_id):
    return dataset_controller.start_preprocessing(dataset_id)


@dataset_bp.route("/<dataset_id>/preprocessed", methods=["GET"])
@jwt_required_custom
def get_preprocessed_data(dataset_id):
    return dataset_controller.get_preprocessed_data(dataset_id)


@dataset_bp.route("/<dataset_id>/preprocessed", methods=["POST"])
@admin_required
def add_preprocessed_row(dataset_id):
    return dataset_controller.add_preprocessed_row(dataset_id)


@dataset_bp.route("/<dataset_id>/preprocessed/<row_id>", methods=["PUT", "PATCH"])
@admin_required
def update_preprocessed_row(dataset_id, row_id):
    return dataset_controller.update_preprocessed_row(dataset_id, row_id)


@dataset_bp.route("/<dataset_id>/preprocessed/<row_id>", methods=["DELETE"])
@admin_required
def delete_preprocessed_row(dataset_id, row_id):
    return dataset_controller.delete_preprocessed_row(dataset_id, row_id)
