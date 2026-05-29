"""Entry point — pastikan threaded=True untuk SSE."""

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = app.config.get("PORT", 5000)
    host = app.config.get("HOST", "0.0.0.0")
    debug = app.config.get("DEBUG", True)

    cors_origins = app.config.get("CORS_ORIGINS", ["*"])
    cors_str = (
        ", ".join(cors_origins) if isinstance(cors_origins, list) else str(cors_origins)
    )
    frontend_url = app.config.get("FRONTEND_URL", "http://localhost:3000")

    print(
        f"\n{'=' * 55}\n\n"
        f"🚀 Transmotion Server Started\n\n"
        f"{'-' * 55}\n\n"
        f"⚙️  Environment  : {app.config.get('ENVIRONMENT', 'Development')}\n"
        f"🔗 Server URL   : http://{host}:{port}\n"
        f"🔗 API URL      : http://{host}:{port}/api\n"
        f"📡 SSE URL      : http://{host}:{port}/api/sse\n"
        f"🔌 CORS Origins : {cors_str}\n"
        f"🔗 Frontend URL : {frontend_url}\n\n"
        f"{'=' * 55}\n"
    )

    # threaded=True WAJIB untuk SSE agar setiap koneksi dapat thread sendiri
    app.run(host=host, port=port, debug=debug, threaded=True)
