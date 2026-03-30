"""User routes - User management endpoints"""

from flask import Blueprint

from app.layers.controllers import user_controller
from app.layers.middlewares.auth_middleware import admin_required, jwt_required_custom

user_bp = Blueprint("users", __name__, url_prefix="/api/users")


@user_bp.route("/me", methods=["GET"])
@jwt_required_custom
def get_me():
    return user_controller.get_me()


@user_bp.route("/me", methods=["PUT", "PATCH"])
@jwt_required_custom
def update_me():
    return user_controller.update_me()


@user_bp.route("/me/avatar", methods=["POST"])
@jwt_required_custom
def upload_avatar():
    return user_controller.upload_avatar()


@user_bp.route("", methods=["GET"])
@admin_required
def get_users():
    return user_controller.get_users()


@user_bp.route("/<user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    return user_controller.get_user(user_id)


@user_bp.route("", methods=["POST"])
@admin_required
def create_user():
    return user_controller.create_user()


@user_bp.route("/<user_id>", methods=["PUT", "PATCH"])
@admin_required
def update_user(user_id):
    return user_controller.update_user(user_id)


@user_bp.route("/<user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    return user_controller.delete_user(user_id)


@user_bp.route("/<user_id>/deactivate", methods=["POST"])
@admin_required
def deactivate_user(user_id):
    return user_controller.deactivate_user(user_id)


@user_bp.route("/<user_id>/activate", methods=["POST"])
@admin_required
def activate_user(user_id):
    return user_controller.activate_user(user_id)
