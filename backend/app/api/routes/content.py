import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.services.gemini_client import gemini_client
from app.models.db_models import ProductContent
from app.core.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

# ── KOMİSYON & KARGO TABLOLARI 
PLATFORM_COMMISSION = {
    "trendyol":    0.15,
    "hepsiburada": 0.14,
    "n11":         0.12,
}

PLATFORM_CARGO = {
    "trendyol":    39.0,
    "hepsiburada": 35.0,
    "n11":         30.0,
}

TARGET_MARGIN = 0.35


def calculate_profit(cost_price: float, platform: str, suggested_price: float) -> dict:
    platform_key    = platform.lower()
    commission_rate = PLATFORM_COMMISSION.get(platform_key, 0.15)
    cargo_cost      = PLATFORM_CARGO.get(platform_key, 39.0)

    # AI zararına fiyat önerdiyse hedef marjı koruyacak fiyatı hesapla
    min_price = round((cost_price + cargo_cost) / (1 - commission_rate - TARGET_MARGIN), 2)
    if suggested_price < min_price:
        suggested_price = min_price

    commission_amount = round(suggested_price * commission_rate, 2)
    net_profit        = round(suggested_price - cost_price - commission_amount - cargo_cost, 2)
    profit_margin     = round((net_profit / suggested_price) * 100, 1)
    monthly_profit_20 = round(net_profit * 20, 2)

    return {
        "suggested_price":   suggested_price,
        "cost_price":        cost_price,
        "commission_rate":   commission_rate,
        "commission_amount": commission_amount,
        "cargo_cost":        cargo_cost,
        "net_profit":        net_profit,
        "profit_margin":     profit_margin,
        "estimated_profit":  monthly_profit_20,
        "platform":          platform_key,
    }


# ── GENERATE LISTING 
@router.post("/generate-listing", response_model=dict, status_code=status.HTTP_200_OK)
async def generate_listing(
    image:             UploadFile = File(...),
    brief_description: str        = Form(...),
    cost_price:        float      = Form(...),
    platform:          str        = Form("trendyol"),
    db:                Session    = Depends(get_db),
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Desteklenmeyen dosya türü.",
        )

    try:
        image_bytes = await image.read()

        # 1. Gemini AI — maliyet bilgisiyle zenginleştirilmiş prompt
        result = await gemini_client.generate_product_listing(
            image_data=image_bytes,
            brief_description=brief_description,
            cost_price=cost_price,
            platform=platform,
        )

        # 2. Kâr hesap motoru — 
        profit_data = calculate_profit(
            cost_price=cost_price,
            platform=platform,
            suggested_price=float(result.suggested_price or 0),
        )

        # 3. Supabase'e kaydet
        new_content = ProductContent(
            seo_title=result.seo_title,
            base_description=result.base_description,
            tone_sincere=result.tone_sincere,
            tone_professional=result.tone_professional,
            tone_youthful=result.tone_youthful,
            tags=result.tags,
            suggested_price=profit_data["suggested_price"],
            estimated_profit=profit_data["estimated_profit"],
            pricing_logic=result.pricing_logic,
            cost_price=cost_price,
            commission_amount=profit_data["commission_amount"],
            cargo_cost=profit_data["cargo_cost"],
            net_profit=profit_data["net_profit"],
            profit_margin=profit_data["profit_margin"],
            platform=platform.lower(),
        )
        db.add(new_content)
        db.commit()
        db.refresh(new_content)

        # 4. Frontend'e gönder
        return {
            **result.model_dump(),
            **profit_data,
            "id": new_content.id,
        }

    except Exception as e:
        logger.error(f"Hata: {repr(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="İçerik oluşturulamadı.")
    finally:
        await image.close()


# ── GET ALL LISTINGS — Dashboard 
@router.get("/listings", response_model=list, status_code=status.HTTP_200_OK)
def get_all_listings(
    skip:  int     = 0,
    limit: int     = 20,
    db:    Session = Depends(get_db),
):
    listings = (
        db.query(ProductContent)
        .order_by(ProductContent.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id":              item.id,
            "seo_title":       item.seo_title,
            "suggested_price": item.suggested_price,
            "net_profit":      item.net_profit,
            "profit_margin":   item.profit_margin,
            "platform":        item.platform,
            "tags":            item.tags,
        }
        for item in listings
    ]


# ── GET SINGLE LISTING — Detay Sayfası 
@router.get("/listings/{listing_id}", response_model=dict, status_code=status.HTTP_200_OK)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    item = db.query(ProductContent).filter(ProductContent.id == listing_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Analiz bulunamadı.")

    return {
        "id":                item.id,
        "seo_title":         item.seo_title,
        "base_description":  item.base_description,
        "tone_sincere":      item.tone_sincere,
        "tone_professional": item.tone_professional,
        "tone_youthful":     item.tone_youthful,
        "tags":              item.tags,
        "suggested_price":   item.suggested_price,
        "estimated_profit":  item.estimated_profit,
        "pricing_logic":     item.pricing_logic,
        "cost_price":        item.cost_price,
        "commission_amount": item.commission_amount,
        "cargo_cost":        item.cargo_cost,
        "net_profit":        item.net_profit,
        "profit_margin":     item.profit_margin,
        "platform":          item.platform,
    }