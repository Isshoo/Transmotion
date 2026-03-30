from flask import Flask

from app.layers.routes.auth_route import auth_bp
from app.layers.routes.social_auth_route import social_auth_bp
from app.layers.routes.user_route import user_bp


def register_routes(app: Flask) -> None:
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(social_auth_bp)
