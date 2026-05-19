import json
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.models.schemas import ProductListingResponse

# ── HACKATHON İÇİN ÖZEL "AGENTIC" SYSTEM PROMPT ──
CONTENT_AGENT_SYSTEM_PROMPT = """
Sen, Growix Karar Destek Sistemi'nin Baş E-Ticaret Analisti ve Finansal Stratejistisin.
Görevin, yüklenen ürün görselini ve kullanıcının kısa açıklamasını çok yönlü (multimodal) analiz ederek, 
Türkiye e-ticaret ekosistemine (Trendyol, Hepsiburada, N11) uygun, doğrudan dönüşüm oranını (CR) artıracak 
içerikler ve kârlı finansal projeksiyonlar üretmektir.

[KOGNİTİF GÖREVLERİN (AGENTIC BEHAVIORS)]:
1. GÖRSEL İSTİHBARAT: Görseldeki ürünün materyalini, hedef kitlesini, algılanan kalite seviyesini analiz et.
2. FİNANSAL OPTİMİZASYON: Ürün maliyeti, kargo ve platform komisyonu verilerini baz alarak satıcıyı zarardan koruyan "Optimum Satış Fiyatını" belirle.
3. PAZARLAMA PSİKOLOJİSİ: 3 farklı kitle için (Samimi, Kurumsal, Dinamik) nöropazarlama teknikleri kullanarak açıklamalar yaz.
4. SEO MÜHENDİSLİĞİ: Arama hacmi en yüksek long-tail (uzun kuyruklu) anahtar kelimeleri tespit et.

[ZORUNLU FİNANSAL HESAPLAMA KURALLARI]:
- Önerilen Fiyat (suggested_price) KESİNLİKLE "Minimum Kârlı Fiyat"ın altında olamaz.
- 20 adet satış senaryosunda elde edilecek net kârı (estimated_profit) kuruşu kuruşuna hesapla.

YANIT FORMATI: 
Yanıtını KESİNLİKLE aşağıdaki Pydantic şemasına birebir uyan, parse edilebilir düz bir JSON olarak döndür. 
JSON bloğu dışında (```json ... ``` dahil) hiçbir markdown veya açıklama metni YAZMA.

{
  "seo_title": "[Maksimum 60 karakter, CTR artırıcı, platform algoritmasına uygun başlık]",
  "base_description": "[Ürünün temel özelliklerini içeren, HTML <ul><li> formatında teknik açıklama]",
  "tone_sincere": "[Duygusal bağ kuran, samimi ve güven veren pazarlama metni]",
  "tone_professional": "[B2B veya kalite arayanlara yönelik, teknik özellikleri öne çıkaran metin]",
  "tone_youthful": "[Z kuşağına hitap eden, enerjik ve FOMO (kaçırma korkusu) yaratan metin]",
  "tags": ["long-tail", "seo", "etiket1", "etiket2", "etiket3"],
  "suggested_price": 0.00,
  "estimated_profit": 0.00,
  "pricing_logic": "[Fiyatın neden bu seviyede belirlendiğini, kâr marjını ve pazar konumlandırmasını anlatan profesyonel yönetici özeti]"
}
"""

class GeminiService:
    """
    Google Gemini 2.5 Flash API entegrasyonunu yöneten, 
    Agentic Framework standartlarına uygun yapılandırılmış servis katmanı.
    """

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.5-flash" # Daha akıllı analiz için flash'a yükseltildi

    async def generate_product_listing(
        self,
        image_data: bytes,
        brief_description: str,
        cost_price: float = 0.0,
        platform: str = "trendyol",
    ) -> ProductListingResponse:
        
        # Pazar yeri dinamikleri
        commission_rates = {"trendyol": 15, "hepsiburada": 14, "n11": 12}
        cargo_costs      = {"trendyol": 39, "hepsiburada": 35, "n11": 30}

        commission_rate = commission_rates.get(platform.lower(), 15)
        cargo_cost      = cargo_costs.get(platform.lower(), 39)

        # Ajanı yönlendirmek için deterministik taban hesabı (Agentic Guardrail)
        min_profitable_price = round(
            (cost_price + cargo_cost) / (1 - commission_rate / 100 - 0.25), 0
        )

        dynamic_context = f"""
[MEVCUT SENARYO BİLGİLERİ]
Satıcı Notu: {brief_description}
Hedef Platform: {platform.upper()}
Ürün Ham Maliyeti: {cost_price} TL
Platform Komisyonu: %{commission_rate}
Sabit Kargo Gideri: {cargo_cost} TL
Zarar Etmemek İçin Gerekli Minimum Fiyat (Guardrail): {min_profitable_price} TL

GÖREV: Yukarıdaki kısıtları kullanarak listeleme içeriklerini ve nihai JSON'u oluştur. 
suggested_price değerini minimum fiyatın üzerinde, pazar rekabetine uygun bir seviyede belirle.
"""

        contents = [
            CONTENT_AGENT_SYSTEM_PROMPT,
            dynamic_context,
            types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
        ]

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ProductListingResponse,
            temperature=0.4, # Halüsinasyonu azaltıp yaratıcılığı dengelemek için optimize edildi
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config,
            )

            response_data = json.loads(response.text)
            return ProductListingResponse(**response_data)

        except json.JSONDecodeError as e:
            raise ValueError(f"Agent yanıtı parse edilemedi (Geçersiz JSON): {e}")
        except ValidationError as e:
            raise ValueError(f"Agent yapısal şema ihlali yaptı (Validation Error): {e}")
        except Exception as e:
            raise RuntimeError(f"Kognitif işlem sırasında API iletişim hatası: {e}")

gemini_client = GeminiService()