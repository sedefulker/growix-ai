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
        self, image_data: bytes, brief_description: str
    ) -> ProductListingResponse:
        """
        Ürün görseli ve kısa açıklama üzerinden SEO uyumlu listeleme verisi üretir.
        
        Args:
            image_data (bytes): İşlenecek görselin byte dizisi.
            brief_description (str): Satıcı tarafından girilen ürün notu.
            
        Returns:
            ProductListingResponse: Pydantic ile doğrulanmış JSON veri modeli.
        """
        contents = [
            CONTENT_AGENT_SYSTEM_PROMPT,
            f"Satıcı Notu: {brief_description}",
            types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
        ]

        # Modelin çıktısını doğrudan Pydantic şemamıza zorluyoruz
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ProductListingResponse,
        )

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config
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