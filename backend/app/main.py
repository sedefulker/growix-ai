import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import content, trends
from app.api.routes import analysis          # ← YENİ
from app.core.database import engine, Base
from app.models import db_models

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)


def get_application() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title       = settings.PROJECT_NAME,
        description = "Growix: 5 ajanlı otonom e-ticaret karar destek sistemi.",
        version     = "2.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins  = ["http://localhost:3000"],
        allow_credentials = True,
        allow_methods  = ["*"],
        allow_headers  = ["*"],
    )

    @app.get("/health", tags=["Sistem"])
    async def health():
        return {"durum": "aktif", "proje": settings.PROJECT_NAME, "version": "2.0.0"}

    # Mevcut rotalar (geriye dönük uyumluluk)
    app.include_router(content.router,  prefix="/api/v1/content", tags=["İçerik Ajanı"])
    app.include_router(trends.router,   prefix="/api/v1/trends",  tags=["Trend Ajanı"])

    # Yeni: 5 ajanlı tam analiz (SSE stream)
    app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Orkestratör — 5 Ajan"])

    return app


app = get_application()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)