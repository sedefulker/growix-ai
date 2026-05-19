from pydantic import BaseModel, Field
from typing import List, Optional

# İçerik Üretim Ajanı Verileri
class ProductListingResponse(BaseModel):
    """
    Yapay zeka tarafından üretilen e-ticaret ürün listeleme ve finansal analiz verisi.
    Gemini API'sinin '$defs' kısıtlamasına takılmamak için tek katmanlı (flat) tasarlanmıştır.
    """
    # İçerik Verileri
    seo_title: str = Field(description="Maksimum 60 karakter, SEO uyumlu ve platform algoritmasına uygun başlık.")
    base_description: str = Field(description="Ürünün temel özelliklerini içeren, HTML maddeler (<ul><li>) formatında teknik açıklama.")
    tone_sincere: str = Field(description="Samimi ve duygusal bir dille yazılmış açıklama.")
    tone_professional: str = Field(description="Sadece teknik özelliklere ve kaliteye odaklanan açıklama.")
    tone_youthful: str = Field(description="Genç kitleye hitap eden, dinamik bir dille yazılmış açıklama.")
    tags: List[str] = Field(description="Arama hacmi yüksek 5-7 adet kategori ve ürün etiketi.")

    # Finansal Analiz Verileri 
    suggested_price: float = Field(description="Pazar analizi ve benzer ürünlere göre önerilen satış fiyatı (TL).")
    estimated_profit: float = Field(description="20 adet satış senaryosunda, komisyon ve giderler sonrası elde edilecek tahmini net kâr (TL).")
    pricing_logic: str = Field(description="Fiyatın neden bu seviyede belirlendiğine dair kısa, profesyonel bir açıklama.")


# Trend Analiz Ajanı Verileri
class TrendInsightSchema(BaseModel):
    signal: str = Field(..., description="Trend durumu sinyali: 'hot', 'rising', 'stable', 'falling'")
    emoji: str = Field(..., description="Arayüzde gösterilecek durum emojisi")
    text: str = Field(..., description="Yapay zeka tarafından üretilen pazar içgörü metni")
    competition_label: str = Field(..., description="Ekrana basılacak ham rekabet etiketi")
    weekly_label: str = Field(..., description="Ekrana basılacak tahmini erişim/arama etiketi")


class TrendAnalysisResponse(BaseModel):
    keyword: str = Field(..., description="Temizlenmiş ve sadeleştirilmiş anahtar kelime")
    category: str = Field(..., description="Algılanan ürün pazar kategorisi")
    trend_change: float = Field(..., description="Son 14 gündeki yüzdesel ilgi değişimi")
    weekly_searches: int = Field(..., description="Tahmini haftalık arama/erişim hacmi")
    competitor_count: int = Field(..., description="Pazardaki aktif rakip satıcı sayısı tahmini")
    competition_level: str = Field(..., description="Rekabet yoğunluk seviyesi (Düşük, Orta, Yüksek)")
    insight: TrendInsightSchema = Field(..., description="Detaylı pazar analiz içgörüleri nesnesi")
    related_keywords: List[str] = Field(..., description="Önerilen gerçekçi SEO arama eklentileri listesi")
    data_source: str = Field(..., description="Verinin çekildiği kaynak: 'wikipedia_pageviews' veya 'smart_mock'")
    from_cache: Optional[bool] = Field(False, description="Verinin in-memory cache'ten gelip gelmediği")