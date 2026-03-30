"""Auth routes - Authentication endpoints"""

from flask import Blueprint

from app.config.extensions import limiter
from app.layers.controllers import auth_controller
from app.layers.middlewares.auth_middleware import jwt_required_custom

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

auth_limit = limiter.limit("5/minute")


@auth_bp.route("/register", methods=["POST"])
@auth_limit
def register():
    return auth_controller.register()


@auth_bp.route("/login", methods=["POST"])
@auth_limit
def login():
    return auth_controller.login()


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required_custom
def refresh():
    return auth_controller.refresh()


@auth_bp.route("/logout", methods=["POST"])
@jwt_required_custom
def logout():
    return auth_controller.logout()


@auth_bp.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    return auth_controller.verify_email(token)


@auth_bp.route("/resend-verification", methods=["POST"])
@auth_limit
def resend_verification():
    return auth_controller.resend_verification()


@auth_bp.route("/forgot-password", methods=["POST"])
@auth_limit
def forgot_password():
    return auth_controller.forgot_password()


@auth_bp.route("/reset-password", methods=["POST"])
@auth_limit
def reset_password():
    return auth_controller.reset_password()


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required_custom
def change_password():
    return auth_controller.change_password()
