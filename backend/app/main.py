import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import content
from app.core.database import engine, Base # EKLEDİK
from app.models import db_models # Modelleri görmesi için EKLEDİK

def get_application() -> FastAPI:
    # Veritabanı tablolarını Supabase üzerinde otomatik oluşturur
    Base.metadata.create_all(bind=engine) # EKLEDİK
    
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="Growix: E-ticaret satıcıları için otonom karar destek mekanizması backend servisleri.",
        version="1.0.0"
    )

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

    application.include_router(
        content.router, 
        prefix="/api/v1/content", 
        tags=["İçerik Üretim Ajanı"]
    )

    return application

app = get_application()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)