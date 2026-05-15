from sqlalchemy import Column, Integer, String, Text, JSON
from app.core.database import Base

class ProductContent(Base):
    __tablename__ = "product_contents"

    id = Column(Integer, primary_key=True, index=True)
    seo_title = Column(String, nullable=False)
    base_description = Column(Text, nullable=False)
    tone_sincere = Column(Text)
    tone_professional = Column(Text)
    tone_youthful = Column(Text)
    tags = Column(JSON) # Etiket listesini JSON olarak saklar