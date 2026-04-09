from flask import Flask

from app.layers.routes.auth_route import auth_bp
from app.layers.routes.dataset_route import dataset_bp
from app.layers.routes.model_route import model_bp, prediction_bp
from app.layers.routes.social_auth_route import social_auth_bp
from app.layers.routes.sse_route import sse_bp
from app.layers.routes.training_job_route import colab_bp, training_job_bp
from app.layers.routes.user_route import user_bp


def register_routes(app: Flask) -> None:
    app.register_blueprint(auth_bp)
    app.register_blueprint(social_auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(dataset_bp)
    app.register_blueprint(training_job_bp)
    app.register_blueprint(colab_bp)
    app.register_blueprint(model_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(sse_bp)
