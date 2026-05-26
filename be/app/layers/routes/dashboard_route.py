"""Dashboard routes"""

from flask import Blueprint

from app.layers.controllers import dashboard_controller
from app.layers.middlewares.auth_middleware import admin_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    return dashboard_controller.get_stats()
