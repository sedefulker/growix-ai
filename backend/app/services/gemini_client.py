import json
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.models.schemas import ProductListingResponse
from app.prompts.system_prompts import CONTENT_AGENT_SYSTEM_PROMPT


class GeminiService:
    """
    Google Gemini API entegrasyonunu yöneten servis katmanı.
    Çoklu-modal (görsel ve metin) istekleri işler, yapılandırılmış JSON
    üretir ve Pydantic validasyonlarını gerçekleştirir.
    """

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.5-flash-lite"

    async def generate_product_listing(
        self,
        image_data: bytes,
        brief_description: str,
        cost_price: float = 0.0,
        platform: str = "trendyol",
    ) -> ProductListingResponse:
        """
        Ürün görseli ve kısa açıklama üzerinden SEO uyumlu listeleme verisi üretir.

        Args:
            image_data (bytes): İşlenecek görselin byte dizisi.
            brief_description (str): Satıcı tarafından girilen ürün notu.
            cost_price (float): Ürünün satıcıya maliyeti (TL).
            platform (str): Hedef pazar yeri (trendyol, hepsiburada, n11).

        Returns:
            ProductListingResponse: Pydantic ile doğrulanmış JSON veri modeli.
        """
        commission_rates = {"trendyol": 15, "hepsiburada": 14, "n11": 12}
        cargo_costs      = {"trendyol": 39, "hepsiburada": 35, "n11": 30}

        commission_rate = commission_rates.get(platform.lower(), 15)
        cargo_cost      = cargo_costs.get(platform.lower(), 39)

        # Minimum kârlı satış fiyatı: maliyet + kargo + komisyon + %25 kâr
        min_profitable_price = round(
            (cost_price + cargo_cost) / (1 - commission_rate / 100 - 0.25), 0
        )

        enriched_description = f"""
{brief_description}

── FİYATLANDIRMA KISITLARI (ZORUNLU) ──
Platform       : {platform.upper()}
Ürün maliyeti  : {cost_price} TL
Platform komisyonu: %{commission_rate}
Kargo maliyeti : {cargo_cost} TL
Minimum kârlı fiyat: {min_profitable_price} TL

Önerdiğin satış fiyatı (suggested_price) KESİNLİKLE {min_profitable_price} TL'nin
ALTINDA OLMAMALIDIR. Bu sınırın altında satıcı zarar eder.
Pazar araştırması yaptıktan sonra rekabetçi ama kârlı bir fiyat belirle.
"""

        contents = [
            CONTENT_AGENT_SYSTEM_PROMPT,
            f"Satıcı Notu: {enriched_description}",
            types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
        ]

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ProductListingResponse,
        )

        try:
            # ── GÜNCELLEME: .aio üzerinden asenkron çağrı yapıp await ekledik ──
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config,
            )

            response_data = json.loads(response.text)
            return ProductListingResponse(**response_data)

        except json.JSONDecodeError as e:
            raise ValueError(f"Geçersiz JSON formatı alındı: {e}")
        except ValidationError as e:
            raise ValueError(f"Şema doğrulama hatası: {e}")
        except Exception as e:
            raise RuntimeError(f"API iletişim hatası: {e}")


gemini_client = GeminiService()