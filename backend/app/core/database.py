from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Supabase Connection Pooler ile istemci tarafındaki havuzlama çakışmasın diye poolclass=NullPool ekledik
engine = create_engine(
    settings.DATABASE_URL, 
    poolclass=NullPool
)

# Veritabanı oturumlarını yönetecek fabrika sınıfı
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tüm veritabanı modellerinin miras alacağı temel sınıf
Base = declarative_base()

# FastAPI Endpoint'leri için bağımlılık (Dependency) fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()