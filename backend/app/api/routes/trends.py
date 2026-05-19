import logging

from fastapi import APIRouter, HTTPException, Path

from app.services.trend_service import analyze_trend

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/analyze/{keyword}",
    summary="Ürün anahtar kelimesine göre gerçek zamanlı pazar trend analizi.",
)
async def get_trend_analysis(
    keyword: str = Path(..., description="Analiz edilecek ürün başlığı veya SEO başlığı."),
):
    keyword = keyword.strip()

    if len(keyword) < 2:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz anahtar kelime. En az 2 karakter gereklidir.",
        )

    logger.info("[trends] Analiz başlatıldı: '%s'", keyword[:60])

    try:
        result = await analyze_trend(keyword)
        return result
    except Exception as exc:
        logger.error("[trends] Hata: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Trend analizi sırasında sunucu hatası oluştu.",
        )