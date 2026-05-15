from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Growix API"
    GEMINI_API_KEY: str

    # .env dosyasındaki değişkenleri otomatik olarak okur
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()