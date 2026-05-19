# backend/app/api/routes/trends.py
import logging
from fastapi import APIRouter, HTTPException, Path
from app.services.trend_service import analyze_trend

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/analyze/{keyword}", summary="Ürün anahtar kelimesine göre pazar ve trend analizini başlatır.")
async def get_trend_analysis(
    keyword: str = Path(..., description="Analiz edilecek ürünün ham başlığı veya SEO başlığı.")
):
    """
    Growix Pazar İstihbarat Raporu - Trend Analiz Endpoint'i
    - Gelen uzun e-ticaret başlıklarını temizler.
    - Wikipedia Pageviews API üzerinden tüketici ilgisini ölçer.
    - Olası kesintilerde kurşungeçirmez simülasyon motoruna (smart_mock) zarif düşüş (fallback) yapar.
    """
    if not keyword or len(keyword.strip()) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Geçersiz anahtar kelime. Analiz için en az 2 karakter gereklidir."
        )
    
    try:
        logger.info(self_log := f"[trends_router] Rota tetiklendi, kelime: '{keyword[:40]}...'")
        
        # Servis katmanındaki asenkron analiz motorunu çağırıyoruz
        result = await analyze_trend(keyword)
        return result
        
    except Exception as e:
        logger.error(f"[trends_router] Kritik hata oluştu: {e}")
        raise HTTPException(
            status_code=500,
            detail="Trend ve pazar analizi gerçekleştirilirken iç sunucu hatası oluştu."
        )