"""Environment configuration"""

import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


def get_env(key, default=None, cast=str):
    value = os.getenv(key, default)
    if value is None:
        return None
    try:
        if cast is bool:
            return value.lower() in ("true", "1", "yes", "on")
        return cast(value)
    except (ValueError, TypeError) as err:
        raise ValueError(f"Invalid value for {key}: {value}") from err


def get_required_env(key):
    value = os.getenv(key)
    if not value:
        raise ValueError(f"{key} is required but not set.")
    return value


def get_list_env(key, default=""):
    value = os.getenv(key, default)
    return [item.strip() for item in value.split(",") if item.strip()]


class Config:
    # App
    ENVIRONMENT = get_env("FLASK_ENV", "development")
    PORT = get_env("PORT", 5000, int)
    HOST = get_env("HOST", "127.0.0.1")

    # Flask
    SECRET_KEY = get_env("SECRET_KEY", "dev-secret-key-change-in-production")

    # Database
    SQLALCHEMY_DATABASE_URI = get_env(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/db_name"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 300}

    # JWT
    JWT_SECRET_KEY = get_env("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=get_env("JWT_ACCESS_HOURS", 24, int))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=get_env("JWT_REFRESH_DAYS", 30, int))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Frontend URL (for email links)
    FRONTEND_URL = get_env("FRONTEND_URL", "http://localhost:3000")

    # CORS
    CORS_ORIGINS = get_list_env("CORS_ORIGINS", "http://localhost:3000")

    # Mail (SMTP / Flask-Mail)
    MAIL_SERVER = get_env("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = get_env("MAIL_PORT", 587, int)
    MAIL_USE_TLS = get_env("MAIL_USE_TLS", "True", bool)
    MAIL_USE_SSL = get_env("MAIL_USE_SSL", "False", bool)
    MAIL_USERNAME = get_env("MAIL_USERNAME")
    MAIL_PASSWORD = get_env("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = get_env("MAIL_DEFAULT_SENDER")

    # Mail (Resend)
    RESEND_API_KEY = get_env("RESEND_API_KEY")
    MAIL_FROM = get_env("MAIL_FROM")

    # Cloudinary
    CLOUDINARY_CLOUD_NAME = get_env("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = get_env("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = get_env("CLOUDINARY_API_SECRET")

    # Rate Limiting
    RATELIMIT_DEFAULT = get_env("RATELIMIT_DEFAULT", "120/minute")
    RATELIMIT_STORAGE_URI = get_env("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_STRATEGY = get_env("RATELIMIT_STRATEGY", "fixed-window")
    RATELIMIT_HEADERS_ENABLED = get_env("RATELIMIT_HEADERS_ENABLED", "True", bool)

    # Colab Integration
    COLAB_API_KEY = get_env("COLAB_API_KEY", "")


class DevelopmentConfig(Config):
    ENVIRONMENT = "Development"
    DEBUG = True
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    ENVIRONMENT = "Production"
    DEBUG = False
    SQLALCHEMY_ECHO = False

    SECRET_KEY = get_required_env("SECRET_KEY")
    JWT_SECRET_KEY = get_required_env("JWT_SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = get_required_env("DATABASE_URL")
    COLAB_API_KEY = get_required_env("COLAB_API_KEY")

    RATELIMIT_STORAGE_URI = get_env("RATELIMIT_STORAGE_URI", "redis://localhost:6379")


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    env = get_env("FLASK_ENV", "development").lower()
    return config.get(env, config["default"])
