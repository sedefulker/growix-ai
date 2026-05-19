import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import content
from app.api.routes import trends
from app.core.database import engine, Base
from app.models import db_models

# ── LOGGING AYARI (Kritik: Ajanların kararlarını terminalde canlı izlemek için) ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)
# ──────────────────────────────────────────────────────────────────────────

def get_application() -> FastAPI:
    # Uygulama başlarken veritabanı tablolarını otomatik hazırla
    Base.metadata.create_all(bind=engine)
    
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="Growix: E-ticaret satıcıları için otonom karar destek mekanizması backend servisleri.",
        version="1.0.0"
    )

    # Frontend (Next.js) bağlantı izinleri (CORS)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/health", tags=["Sistem"])
    async def health_check():
        return {"durum": "aktif", "proje": settings.PROJECT_NAME}

    # İçerik Üretim Ajanı Rotaları
    application.include_router(
        content.router, 
        prefix="/api/v1/content", 
        tags=["İçerik Üretim Ajanı"]
    )

    # Trend Analiz Ajanı Rotaları
    application.include_router(
        trends.router,
        prefix="/api/v1/trends",                                     
        tags=["Trend Ajanı"]                                         
    )

    return application

app = get_application()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)