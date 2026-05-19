"""
Growix — İade Risk Ajanı (Ajan 6)
Ürün görseli + açıklamasını Gemini Vision ile analiz ederek
iade risklerini tespit eder, somut düzeltme önerileri ve
finansal etki hesabı üretir.
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ── Kategori bazlı ortalama iade oranları (Türkiye e-ticaret verileri) ─────
CATEGORY_RETURN_RATES: dict[str, float] = {
    "giyim":      0.32,
    "elektronik": 0.18,
    "spor":       0.14,
    "ev":         0.20,
    "kozmetik":   0.12,
    "oyuncak":    0.10,
    "gıda":       0.05,
    "bahçe":      0.08,
    "el yapımı":  0.15,
    "genel":      0.22,
}

# ── Kategori bazlı kritik kontrol listesi 
CATEGORY_CHECKLIST: dict[str, list[str]] = {
    "giyim": [
        "Beden tablosu (S/M/L karşılığı cm değerleri)",
        "Kumaş/malzeme içeriği (% pamuk, polyester vb.)",
        "Renk doğruluğu — fotoğraf gerçek rengi yansıtıyor mu",
        "Yıkama ve bakım talimatları",
        "Modelin üzerindeki beden ve boy bilgisi",
    ],
    "elektronik": [
        "Teknik özellikler listesi (RAM, depolama, ekran vb.)",
        "Uyumlu cihaz/model listesi",
        "Kutu içeriği detayı",
        "Garanti süresi ve koşulları",
        "Şarj/bağlantı standardı (USB-C, Lightning vb.)",
    ],
    "spor": [
        "Ölçü/beden tablosu",
        "Malzeme ve dayanıklılık bilgisi",
        "Kullanım alanı (iç/dış mekan)",
        "Maksimum yük/kullanıcı kapasitesi",
    ],
    "ev": [
        "Kesin ölçüler (en × boy × yükseklik cm)",
        "Malzeme ve yüzey bilgisi",
        "Montaj gereksinimi ve zorluk seviyesi",
        "Renk/ton — monitör farkından kaynaklanan beklenti farkı riski",
    ],
    "kozmetik": [
        "İçerik listesi (INCI formatında)",
        "Cilt tipi uygunluğu",
        "Kullanım miktarı ve süresi",
        "Allerjen uyarıları",
    ],
    "genel": [
        "Net ürün ölçüleri",
        "Malzeme/içerik bilgisi",
        "Kullanım talimatları",
        "Garanti ve iade koşulları",
    ],
}

RETURN_RISK_PROMPT = """
Sen Türkiye e-ticaret pazarında uzmanlaşmış bir iade analiz yapay zekasısın.
Sana bir ürün görseli ve açıklaması verilecek. Görevin: alıcının bu ürünü
iade etmesine neden olabilecek TÜM riskleri tespit etmek.

Kategori: {category}
Bu kategoride satıcının kontrol etmesi gereken kritik noktalar:
{checklist}

GÖRSELI ve AÇIKLAMAYI analiz et. Aşağıdaki JSON formatında yanıt ver.
JSON dışında HİÇBİR şey yazma.

{{
  "risks": [
    {{
      "id": "risk_1",
      "title": "Kısa risk başlığı (max 8 kelime)",
      "level": "YÜKSEK",
      "category_tr": "Görsel Kalite | Bilgi Eksikliği | Beklenti Yönetimi | Teknik Eksik",
      "description": "Bu riskin neden iade yarattığını 1-2 cümle ile açıkla.",
      "fix": "Satıcının yapması gereken somut düzeltme (1-2 cümle).",
      "return_rate_impact": 8
    }}
  ],
  "overall_risk": "YÜKSEK | ORTA | DÜŞÜK",
  "summary": "Genel değerlendirme, 1-2 cümle."
}}

KURALLAR:
- "level" yalnızca: YÜKSEK, ORTA, DÜŞÜK
- "return_rate_impact": bu riski düzeltince iade oranının düşeceği tahmini yüzde puan (1-15 arası)
- En fazla 5 risk listele, en önemlilerini öne çıkar
- Tespit edilmiyorsa risk ekleme, uydurma
- Türkçe yaz
"""


@dataclass
class ReturnRisk:
    id: str
    title: str
    level: str               # YÜKSEK | ORTA | DÜŞÜK
    category_tr: str
    description: str
    fix: str
    return_rate_impact: int  # iade oranı düşüş tahmini (yüzde puan)


@dataclass
class FinancialImpact:
    estimated_current_return_rate: float    # %
    estimated_after_fix_rate: float         # %
    monthly_savings_per_100: float          # TL (100 satış senaryosu)
    annual_savings_per_100: float           # TL


@dataclass
class ReturnRiskResult:
    risks: list[ReturnRisk]
    overall_risk: str
    summary: str
    financial_impact: FinancialImpact
    data_source: str


class ReturnRiskAgent:
    """
    Gemini Vision ile görsel + metin analizi yapan iade risk ajanı.
    Kategori farkındalığı ve finansal etki hesabı içerir.
    """

    async def analyze(
        self,
        image_data: bytes,
        description: str,
        category: str,
        suggested_price: float,
    ) -> ReturnRiskResult:
        checklist_items = CATEGORY_CHECKLIST.get(category, CATEGORY_CHECKLIST["genel"])
        checklist_str   = "\n".join(f"- {item}" for item in checklist_items)

        prompt = RETURN_RISK_PROMPT.format(
            category  = category,
            checklist = checklist_str,
        )

        raw_json = await self._call_gemini(image_data, description, prompt)

        if raw_json:
            return self._parse_result(raw_json, category, suggested_price)

        # Fallback: hata durumunda güvenli yanıt
        logger.warning("[return_risk] Gemini başarısız, fallback kullanılıyor")
        return self._fallback(category, suggested_price)

    # ── Gemini çağrısı 

    async def _call_gemini(
        self,
        image_data: bytes,
        description: str,
        prompt: str,
    ) -> dict | None:
        try:
            import asyncio
            from app.core.config import settings
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            contents = [
                prompt,
                f"Ürün Açıklaması: {description[:500]}",
                types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
            ]

            def _call():
                return client.models.generate_content(
                    model   = "gemini-2.5-flash-lite",
                    contents= contents,
                    config  = types.GenerateContentConfig(temperature=0.1),
                )

            loop     = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(None, _call),
                timeout=25.0,
            )

            raw = re.sub(r"```json|```", "", response.text).strip()
            return json.loads(raw)

        except json.JSONDecodeError as e:
            logger.warning("[return_risk] JSON parse hatası: %s", e)
        except Exception as e:
            logger.warning("[return_risk] Gemini hatası: %s", e)
        return None

    # ── Sonuç ayrıştırma 

    def _parse_result(
        self,
        data: dict,
        category: str,
        price: float,
    ) -> ReturnRiskResult:
        risks: list[ReturnRisk] = []

        for r in data.get("risks", [])[:5]:
            risks.append(ReturnRisk(
                id                  = r.get("id", "risk"),
                title               = r.get("title", ""),
                level               = r.get("level", "ORTA"),
                category_tr         = r.get("category_tr", ""),
                description         = r.get("description", ""),
                fix                 = r.get("fix", ""),
                return_rate_impact  = int(r.get("return_rate_impact", 3)),
            ))

        financial = self._calculate_impact(risks, category, price)

        return ReturnRiskResult(
            risks           = risks,
            overall_risk    = data.get("overall_risk", "ORTA"),
            summary         = data.get("summary", ""),
            financial_impact= financial,
            data_source     = "gemini_vision",
        )

    # ── Finansal etki hesabı 

    def _calculate_impact(
        self,
        risks: list[ReturnRisk],
        category: str,
        price: float,
    ) -> FinancialImpact:
        base_rate          = CATEGORY_RETURN_RATES.get(category, 0.22)
        total_reduction    = sum(r.return_rate_impact for r in risks) / 100
        total_reduction    = min(total_reduction, base_rate * 0.6)  # max %60 iyileşme

        after_rate         = max(base_rate - total_reduction, 0.03)

        # 100 satış senaryosunda kazanç:
        # Her iade: satış fiyatının ~%40'ı kadar maliyet (iade kargo + işlem)
        cost_per_return    = price * 0.40
        saved_returns      = (base_rate - after_rate) * 100
        monthly_savings    = round(saved_returns * cost_per_return, 2)
        annual_savings     = round(monthly_savings * 12, 2)

        return FinancialImpact(
            estimated_current_return_rate = round(base_rate * 100, 1),
            estimated_after_fix_rate      = round(after_rate * 100, 1),
            monthly_savings_per_100       = monthly_savings,
            annual_savings_per_100        = annual_savings,
        )

    # ── Fallback 

    def _fallback(self, category: str, price: float) -> ReturnRiskResult:
        base_rate = CATEGORY_RETURN_RATES.get(category, 0.22)
        financial = FinancialImpact(
            estimated_current_return_rate = round(base_rate * 100, 1),
            estimated_after_fix_rate      = round((base_rate - 0.05) * 100, 1),
            monthly_savings_per_100       = round(price * 0.40 * 5, 2),
            annual_savings_per_100        = round(price * 0.40 * 5 * 12, 2),
        )
        return ReturnRiskResult(
            risks            = [],
            overall_risk     = "ORTA",
            summary          = "Ürün analizi tamamlanamadı. Manuel kontrol önerilir.",
            financial_impact = financial,
            data_source      = "fallback",
        )


return_risk_agent = ReturnRiskAgent()