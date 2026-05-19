"""
Growix — Fiyat Optimizasyon Ajanı
Trend verisi + rekabet seviyesi + maliyet yapısını birleştirerek
satıcının hem kârlı hem rekabetçi kalmasını sağlayan optimal fiyatı hesaplar.
"""
from __future__ import annotations
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ── Platform sabitleri 
COMMISSION: dict[str, float] = {
    "trendyol":    0.15,
    "hepsiburada": 0.14,
    "n11":         0.12,
}
CARGO: dict[str, float] = {
    "trendyol":    39.0,
    "hepsiburada": 35.0,
    "n11":         30.0,
}
MIN_MARGIN = 0.30   # Satıcıyı zarardan koruyacak minimum kâr marjı
TARGET_MARGIN = 0.35


@dataclass
class PricingResult:
    optimal_price: float
    min_price: float
    strategy: str           # "premium" | "market" | "competitive" | "floor"
    strategy_label: str     # Türkçe açıklama
    margin_at_optimal: float
    net_profit_per_unit: float
    commission_amount: float
    cargo_cost: float


@dataclass
class ProfitScenario:
    units: int
    revenue: float
    net_profit: float
    margin: float


@dataclass
class ProfitReport:
    cost_price: float
    optimal_price: float
    commission_amount: float
    cargo_cost: float
    net_profit_per_unit: float
    profit_margin: float
    scenarios: list[ProfitScenario]
    action: str   # Jüriye gösterilecek aksiyon önerisi


class PriceAgent:
    """
    Trend + rekabet verisine göre akıllı fiyatlandırma yapan ajan.
    Gemini çağrısı gerektirmez — deterministik kural motoru.
    """

    def optimize(
        self,
        cost_price: float,
        platform: str,
        suggested_price: float,
        trend_change: float,
        competition_level: str,
    ) -> PricingResult:
        """
        Akıllı fiyatlandırma stratejisi:
        - HOT trend + Düşük rekabet  → premium fiyat (piyasa + %12)
        - Yükselen trend + Orta rek  → piyasa fiyatı
        - Stabil + Yüksek rekabet    → piyasa − %5 (rekabetçi)
        - Düşen trend                → minimum kârlı fiyat + uyarı
        """
        plat = platform.lower()
        comm_rate = COMMISSION.get(plat, 0.15)
        cargo     = CARGO.get(plat, 39.0)

        # Zarardan koruyan taban fiyat
        min_price = round((cost_price + cargo) / (1 - comm_rate - MIN_MARGIN), 2)

        # AI'ın önerdiği fiyat taban fiyatın altındaysa düzelt
        base = max(suggested_price, min_price)

        # Strateji seç
        if trend_change >= 35 and competition_level in ("Düşük", "düşük"):
            strategy        = "premium"
            strategy_label  = "Prim Fiyatlandırma — Yüksek talep, düşük rekabet"
            optimal_price   = round(base * 1.12, 2)
        elif trend_change >= 15:
            strategy        = "market"
            strategy_label  = "Piyasa Fiyatı — İstikrarlı büyüme trendi"
            optimal_price   = round(base * 1.05, 2)
        elif trend_change >= 0:
            if competition_level in ("Yüksek", "yüksek"):
                strategy        = "competitive"
                strategy_label  = "Rekabetçi Fiyat — Yüksek rekabet, hacim hedefi"
                optimal_price   = round(base * 0.97, 2)
            else:
                strategy        = "market"
                strategy_label  = "Piyasa Fiyatı — Dengeli pazar"
                optimal_price   = round(base, 2)
        else:
            strategy        = "floor"
            strategy_label  = "Taban Fiyat — Düşen trend, marjı koru"
            optimal_price   = min_price

        # optimal_price asla taban fiyatın altına düşmesin
        optimal_price = max(optimal_price, min_price)

        comm_amount      = round(optimal_price * comm_rate, 2)
        net_profit       = round(optimal_price - cost_price - comm_amount - cargo, 2)
        margin_pct       = round((net_profit / optimal_price) * 100, 1)

        logger.info(
            "[price_agent] strateji=%s fiyat=%.2f marj=%%%.1f",
            strategy, optimal_price, margin_pct
        )

        return PricingResult(
            optimal_price       = optimal_price,
            min_price           = min_price,
            strategy            = strategy,
            strategy_label      = strategy_label,
            margin_at_optimal   = margin_pct,
            net_profit_per_unit = net_profit,
            commission_amount   = comm_amount,
            cargo_cost          = cargo,
        )

    def profit_report(
        self,
        cost_price: float,
        platform: str,
        optimal_price: float,
    ) -> ProfitReport:
        """5 / 10 / 20 / 50 / 100 adet satış senaryosu üretir."""
        plat      = platform.lower()
        comm_rate = COMMISSION.get(plat, 0.15)
        cargo     = CARGO.get(plat, 39.0)

        comm_amount = round(optimal_price * comm_rate, 2)
        net_unit    = round(optimal_price - cost_price - comm_amount - cargo, 2)
        margin      = round((net_unit / optimal_price) * 100, 1)

        scenarios = [
            ProfitScenario(
                units      = u,
                revenue    = round(optimal_price * u, 2),
                net_profit = round(net_unit * u, 2),
                margin     = margin,
            )
            for u in (5, 10, 20, 50, 100)
        ]

        if net_unit < 0:
            action = "⛔ Bu fiyat ile zarar ediyorsunuz. Fiyatı artırın veya maliyeti düşürün."
        elif margin < 15:
            action = "⚠️ Marj çok düşük. Ürün fiyatını veya hacmi artırmanızı öneririz."
        elif margin >= 35:
            action = "✅ Sağlıklı marj. Pazar payı için reklam bütçesi ayırabilirsiniz."
        else:
            action = "👍 Makul marj. Satış hacmini artırmaya odaklanın."

        return ProfitReport(
            cost_price          = cost_price,
            optimal_price       = optimal_price,
            commission_amount   = comm_amount,
            cargo_cost          = cargo,
            net_profit_per_unit = net_unit,
            profit_margin       = margin,
            scenarios           = scenarios,
            action              = action,
        )


price_agent = PriceAgent()