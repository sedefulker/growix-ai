import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session # EKLEDİK

from app.services.gemini_client import gemini_client
from app.models.schemas import ProductListingResponse
from app.models.db_models import ProductContent # EKLEDİK
from app.core.database import get_db # EKLEDİK

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post(
    "/generate-listing", 
    response_model=ProductListingResponse, 
    status_code=status.HTTP_200_OK
)
async def generate_listing(
    image: UploadFile = File(...),
    brief_description: str = Form(...),
    db: Session = Depends(get_db) # Veritabanı bağlantısı EKLEDİK
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Desteklenmeyen dosya türü."
        )

    try:
        image_bytes = await image.read()
        
        # 1. AI İçeriği Üretir
        result = await gemini_client.generate_product_listing(
            image_data=image_bytes,
            brief_description=brief_description
        )

        # 2. Veritabanına Kaydetme (EKLEDİK)
        new_content = ProductContent(
            seo_title=result.seo_title,
            base_description=result.base_description,
            tone_sincere=result.tone_sincere,
            tone_professional=result.tone_professional,
            tone_youthful=result.tone_youthful,
            tags=result.tags
        )
        db.add(new_content)
        db.commit() # Supabase'e gönderir
        db.refresh(new_content)

        return result
        
    except Exception as e:
        logger.error(f"Hata: {repr(e)}")
        db.rollback() # Hata olursa işlemi geri al
        raise HTTPException(status_code=500, detail="İçerik kaydedilemedi.")
    finally:
        await image.close()