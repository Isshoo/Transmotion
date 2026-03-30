"""Social Auth routes"""

from flask import Blueprint

from app.config.extensions import limiter
from app.layers.controllers import social_auth_controller

social_auth_bp = Blueprint("social_auth", __name__, url_prefix="/api/auth")

auth_limit = limiter.limit("5/minute")


@social_auth_bp.route("/google", methods=["POST"])
@auth_limit
def google_auth():
    return social_auth_controller.google_auth()
