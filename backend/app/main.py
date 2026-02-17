"""
Krishi-Net Backend — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.db.init_db import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Krishi-Net AI Agricultural Platform API",
)

# ── CORS ──
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ── Routes ──
app.include_router(api_router, prefix=settings.API_V1_STR)


# ── Startup ──
@app.on_event("startup")
async def startup_event():
    print("🌾 Starting Krishi-Net Backend...")
    await init_db()

    # Try to load ML model (optional — won't crash if missing)
    try:
        from app.services.ml_service import ml_service

        ml_service.load_model(settings.MODEL_PATH)
    except Exception as e:
        print(f"⚠️  ML model not loaded (optional): {e}")

    print(f"✅ Krishi-Net API ready at http://0.0.0.0:8000")
    print(f"📖 API docs at http://0.0.0.0:8000/docs")


# ── Health Check ──
@app.get("/health")
def health_check():
    return {"status": "ok", "version": settings.VERSION}
