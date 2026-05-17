from sqlalchemy import Column, Integer, String, Text, JSON, Float
from app.core.database import Base

class ProductContent(Base):
    __tablename__ = "product_contents"

    id                = Column(Integer, primary_key=True, index=True)
    seo_title         = Column(String, nullable=False)
    base_description  = Column(Text, nullable=False)
    tone_sincere      = Column(Text)
    tone_professional = Column(Text)
    tone_youthful     = Column(Text)
    tags              = Column(JSON)

    # Finansal alanlar
    suggested_price   = Column(Float)
    estimated_profit  = Column(Float)
    pricing_logic     = Column(Text)

    # Kâr hesap motoru
    cost_price        = Column(Float, nullable=True)
    commission_amount = Column(Float, nullable=True)
    cargo_cost        = Column(Float, nullable=True)
    net_profit        = Column(Float, nullable=True)
    profit_margin     = Column(Float, nullable=True)
    platform          = Column(String, nullable=True, default="trendyol")