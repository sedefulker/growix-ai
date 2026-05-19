"""
Growix — 5 Ajanlı Tam Analiz Endpoint'i
SSE (Server-Sent Events) üzerinden her ajanın ilerlemesini
gerçek zamanlı olarak frontend'e iletir.

Jüri, "Ajan 1 tamamlandı → Ajan 2 başlıyor..." akışını
canlı izler. Bu Growix'in agentic yapısını görsel olarak kanıtlar.
"""
from __future__ import annotations

import json
import logging
from dataclasses import asdict

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.agents.orchestrator import AgentEvent, orchestrator
from app.core.database import get_db
from app.models.db_models import ProductContent

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Yardımcılar ──────────────────────────────────────────────────────────────

def _sse(event: AgentEvent) -> str:
    """AgentEvent'i tarayıcı uyumlu SSE formatına dönüştürür."""
    payload = {
        "agent":  event.agent,
        "label":  event.label,
        "status": event.status,
        "data":   event.data,
    }
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _save_to_db(db: Session, bundle: dict) -> int:
    """Orkestratör çıktısını Supabase'e kaydeder ve yeni satır id'sini döndürür."""
    content  = bundle["content"]
    pricing  = bundle["pricing"]
    profit   = bundle["profit"]

    scenarios = profit.get("scenarios", [])
    estimated = scenarios[2]["net_profit"] if len(scenarios) > 2 else None

    row = ProductContent(
        seo_title         = content.get("seo_title", ""),
        base_description  = content.get("base_description", ""),
        tone_sincere      = content.get("tone_sincere"),
        tone_professional = content.get("tone_professional"),
        tone_youthful     = content.get("tone_youthful"),
        tags              = content.get("tags", []),
        suggested_price   = pricing.get("optimal_price"),
        estimated_profit  = estimated,
        pricing_logic     = content.get("pricing_logic"),
        cost_price        = bundle["cost_price"],
        commission_amount = pricing.get("commission_amount"),
        cargo_cost        = pricing.get("cargo_cost"),
        net_profit        = pricing.get("net_profit_per_unit"),
        profit_margin     = pricing.get("margin_at_optimal"),
        platform          = bundle["platform"],
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row.id


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post(
    "/stream",
    summary="5 ajanı sırayla çalıştırır; her adımı SSE ile iletir.",
    response_class=StreamingResponse,
)
async def full_analysis_stream(
    image:             UploadFile = File(...),
    brief_description: str        = Form(...),
    cost_price:        float      = Form(...),
    platform:          str        = Form("trendyol"),
    db:                Session    = Depends(get_db),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Yalnızca görsel dosyaları kabul edilir.",
        )

    image_data = await image.read()
    await image.close()

    def db_saver(bundle: dict) -> int:
        return _save_to_db(db, bundle)

    async def event_stream():
        try:
            async for event in orchestrator.run_stream(
                image_data        = image_data,
                brief             = brief_description,
                cost_price        = cost_price,
                platform          = platform,
                db_saver          = db_saver,
            ):
                yield _sse(event)
        except Exception as exc:
            logger.error("[analysis.stream] Kritik hata: %s", exc)
            db.rollback()
            error_event = AgentEvent(
                agent=0,
                label="Sistem Hatası",
                status="error",
                data={"message": "Analiz sırasında beklenmeyen bir hata oluştu."},
            )
            yield _sse(error_event)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",
        },
    )