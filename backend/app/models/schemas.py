from pydantic import BaseModel, Field
from typing import List

class ProductListingResponse(BaseModel):
    """
    Yapay zeka tarafından üretilen e-ticaret ürün listeleme verisi.
    Gemini API'sinin '$defs' kısıtlamasına takılmamak için tek katmanlı (flat) tasarlanmıştır.
    """
    seo_title: str = Field(description="Maksimum 60 karakter, SEO uyumlu ve platform algoritmasına uygun başlık.")
    base_description: str = Field(description="Ürünün temel özelliklerini içeren, HTML maddeler (<ul><li>) formatında teknik açıklama.")
    tone_sincere: str = Field(description="Samimi ve duygusal bir dille yazılmış açıklama.")
    tone_professional: str = Field(description="Sadece teknik özelliklere ve kaliteye odaklanan açıklama.")
    tone_youthful: str = Field(description="Genç kitleye hitap eden, dinamik bir dille yazılmış açıklama.")
    tags: List[str] = Field(description="Arama hacmi yüksek 5-7 adet kategori ve ürün etiketi.")