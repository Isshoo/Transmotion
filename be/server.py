"""
Entry point for the Flask application.
Run with python: python server.py
Run with gunicorn: gunicorn server:app --bind 0.0.0.0:5000
Run with waitress: waitress-serve --host=0.0.0.0 --port=5000 server:app
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    # Config from app directly
    port = app.config.get("PORT", 5000)
    host = app.config.get("HOST", "0.0.0.0")
    debug = app.config.get("DEBUG", True)

    cors_origins = app.config.get("CORS_ORIGINS", ["*"])
    frontend_url = app.config.get("FRONTEND_URL", "http://localhost:3000")
    if isinstance(cors_origins, list):
        cors_str = ", ".join(cors_origins)
    else:
        cors_str = str(cors_origins)

    server_url = f"http://{host}:{port}"

    # Startup log
    print(
        f"\n{'=' * 55}\n\n"
        f"🚀 Transmotion Server Started Successfully\n\n"
        f"{'-' * 55}\n\n"
        f"⚙️  Environment  : {app.config.get('ENVIRONMENT', 'Development')}\n"
        f"🔗 Server URL   : {server_url}\n"
        f"🔗 API URL      : {server_url}/api\n"
        f"🔌 CORS Origins : {cors_str}\n"
        f"🔗 Frontend URL : {frontend_url}\n\n"
        f"{'=' * 55}\n"
    )

    app.run(host=host, port=port, debug=debug)
