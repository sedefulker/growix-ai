"""
Growix — Ana Orkestratör
5 ajanı sırayla çalıştırır; her ajanın çıktısı bir sonrakinin girdisi olur.
Bu dosya Growix'i "araçlar topluluğu"ndan gerçek bir agentic sisteme dönüştürür.

Pipeline:
  [Ajan 1] Trend     → Google Autocomplete ile pazar sinyali
  [Ajan 2] İçerik    → Gemini Vision ile SEO içerik + trend bağlamı
  [Ajan 3] Rakip     → Trend verisinden rekabet çıkarımı
  [Ajan 4] Fiyat     → Trend + rekabet → optimal fiyat stratejisi
  [Ajan 5] Kâr       → Senaryo analizi + aksiyon önerisi
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, asdict
from typing import AsyncIterator, Any

from app.services.trend_service import analyze_trend
from app.services.gemini_client import gemini_client
from app.agents.price_agent import price_agent, PricingResult, ProfitReport

logger = logging.getLogger(__name__)


# ── Ortak veri yapıları 

@dataclass
class AgentEvent:
    """SSE stream için her adımda gönderilen olay."""
    agent: int          # 1-5
    label: str
    status: str         # "running" | "done" | "error"
    data: dict | None = None


@dataclass
class FullAnalysisResult:
    listing_id: int
    trend: dict
    content: dict
    pricing: dict
    profit: dict
    agent_log: list[str]


# ── Orkestratör 

class GrowixOrchestrator:
    """
    Tüm ajanları koordine eden ana sınıf.
    `run_stream` metodu AsyncIterator döndürerek SSE üzerinden
    her adımı anlık olarak frontend'e iletir.
    """

    async def run_stream(
        self,
        image_data: bytes,
        brief: str,
        cost_price: float,
        platform: str,
        db_saver,           # Callable: (result_dict) → int (yeni satır id'si)
    ) -> AsyncIterator[AgentEvent]:
        """
        5 ajanı sırasıyla çalıştırır ve her adımı yield eder.
        Tek bir Gemini çağrısı yapılır (kota dostu).
        """
        log: list[str] = []

        # ── AJAN 1: Trend 
        yield AgentEvent(agent=1, label="Trend Ajanı", status="running")
        try:
            trend_data = await analyze_trend(brief)
            log.append(f"Trend: {trend_data['trend_change']:+.1f}%, Rekabet: {trend_data['competition_level']}")
            yield AgentEvent(agent=1, label="Trend Ajanı", status="done", data=trend_data)
        except Exception as e:
            logger.error("[orca.ajan1] %s", e)
            trend_data = _fallback_trend(brief)
            yield AgentEvent(agent=1, label="Trend Ajanı", status="error", data=trend_data)

        await asyncio.sleep(0.05)   # UI'ın adımı görmesi için minimal gecikme

        # ── AJAN 2: İçerik 
        yield AgentEvent(agent=2, label="İçerik Ajanı", status="running")
        try:
            enriched_brief = _inject_trend_context(brief, trend_data)
            content = await gemini_client.generate_product_listing(
                image_data=image_data,
                brief_description=enriched_brief,
                cost_price=cost_price,
                platform=platform,
            )
            content_dict = content.model_dump()
            log.append(f"Başlık: {content.seo_title[:50]}...")
            yield AgentEvent(agent=2, label="İçerik Ajanı", status="done", data=content_dict)
        except Exception as e:
            logger.error("[orca.ajan2] %s", e)
            yield AgentEvent(agent=2, label="İçerik Ajanı", status="error")
            return   # İçerik üretilemezse devam etme

        await asyncio.sleep(0.05)

        # ── AJAN 3: Rakip (kural tabanlı, Gemini çağrısı yok) ─────────────
        yield AgentEvent(agent=3, label="Rakip Ajanı", status="running")
        competitor_data = _build_competitor_context(trend_data)
        log.append(f"Rakip tahmini: {competitor_data['competitor_count']} satıcı")
        yield AgentEvent(agent=3, label="Rakip Ajanı", status="done", data=competitor_data)

        await asyncio.sleep(0.05)

        # ── AJAN 4: Fiyat 
        yield AgentEvent(agent=4, label="Fiyat Ajanı", status="running")
        try:
            pricing: PricingResult = price_agent.optimize(
                cost_price       = cost_price,
                platform         = platform,
                suggested_price  = float(content.suggested_price or 0),
                trend_change     = trend_data.get("trend_change", 0),
                competition_level= trend_data.get("competition_level", "Orta"),
            )
            pricing_dict = asdict(pricing)
            log.append(
                f"Strateji: {pricing.strategy} | Fiyat: {pricing.optimal_price:.2f} TL"
                f" | Marj: %{pricing.margin_at_optimal}"
            )
            yield AgentEvent(agent=4, label="Fiyat Ajanı", status="done", data=pricing_dict)
        except Exception as e:
            logger.error("[orca.ajan4] %s", e)
            yield AgentEvent(agent=4, label="Fiyat Ajanı", status="error")
            return

        await asyncio.sleep(0.05)

        # ── AJAN 5: Kâr 
        yield AgentEvent(agent=5, label="Kâr Ajanı", status="running")
        profit: ProfitReport = price_agent.profit_report(
            cost_price    = cost_price,
            platform      = platform,
            optimal_price = pricing.optimal_price,
        )
        profit_dict = asdict(profit)
        log.append(f"20 adet kâr: {profit.scenarios[2].net_profit:.2f} TL | {profit.action}")
        yield AgentEvent(agent=5, label="Kâr Ajanı", status="done", data=profit_dict)

        # ── Supabase'e kaydet 
        try:
            listing_id = await asyncio.get_event_loop().run_in_executor(
                None,
                db_saver,
                {
                    "content":   content_dict,
                    "pricing":   pricing_dict,
                    "profit":    profit_dict,
                    "trend":     trend_data,
                    "cost_price": cost_price,
                    "platform":   platform,
                },
            )
        except Exception as e:
            logger.error("[orca.db] %s", e)
            listing_id = -1

        # ── Final sonuç 
        final = FullAnalysisResult(
            listing_id = listing_id,
            trend      = trend_data,
            content    = content_dict,
            pricing    = pricing_dict,
            profit     = profit_dict,
            agent_log  = log,
        )
        yield AgentEvent(
            agent  = 0,
            label  = "Analiz Tamamlandı",
            status = "complete",
            data   = asdict(final),
        )


# ── Yardımcı fonksiyonlar 

def _inject_trend_context(brief: str, trend: dict) -> str:
    """
    Trend verisini Gemini'ye bağlam olarak ekler.
    Bu sayede içerik ajanı trende uygun SEO başlıkları üretir.
    """
    change   = trend.get("trend_change", 0)
    comp     = trend.get("competition_level", "Orta")
    signal   = trend.get("insight", {}).get("signal", "stable")

    context = (
        f"\n\n── PAZAR BAĞLAMI (Trend Ajanı Verisi) ──\n"
        f"Bu ürün kategorisinde son 7 günde %{change:+.1f} trend değişimi var.\n"
        f"Rekabet seviyesi: {comp}.\n"
    )
    if signal == "hot":
        context += "Talep yüksek, fırsat penceresi dar. Acil satın alma dilini kullan.\n"
    elif signal == "falling":
        context += "Talep düşüyor. Değer önerisini öne çıkar, uzun vadeli faydaları vurgula.\n"

    return brief + context


def _build_competitor_context(trend: dict) -> dict:
    """
    Trend verisinden rakip analizi çıkarır.
    Gemini çağrısı gerektirmez — kota dostu.
    """
    comp  = trend.get("competition_level", "Orta")
    count = trend.get("competitor_count", 50)
    wkly  = trend.get("weekly_searches", 5000)

    if comp in ("Yüksek", "yüksek"):
        advice = "Fiyat veya benzersiz içerikle farklılaşın. Başlıkta marka + özellik vurgulayın."
    elif comp in ("Düşük", "düşük"):
        advice = "Piyasada boşluk var. Hızlı stok yapın, trend tepe yapmadan listeye alın."
    else:
        advice = "Dengeli pazar. SEO kalitesi ve fotoğraf kalitesi belirleyici olacak."

    return {
        "competitor_count":  count,
        "competition_level": comp,
        "weekly_searches":   wkly,
        "advice":            advice,
    }


def _fallback_trend(brief: str) -> dict:
    """Trend ajanı çökerse minimum geçerli veri döndürür."""
    return {
        "keyword":           brief[:40],
        "category":          "genel",
        "trend_change":      0.0,
        "weekly_searches":   5000,
        "competitor_count":  50,
        "competition_level": "Orta",
        "insight": {
            "signal":            "stable",
            "emoji":             "📊",
            "text":              "Trend verisi alınamadı, piyasa analizi yapılamadı.",
            "competition_label": "Rekabet: Orta",
            "weekly_label":      "Tahmini Arama: ~5.000",
        },
        "related_keywords":  [],
        "data_source":       "fallback",
    }


orchestrator = GrowixOrchestrator()