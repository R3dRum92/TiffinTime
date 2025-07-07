from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE: str

    JWT_SECRET: str

    API_KEY: str

    APP_MODE: str

    @property
    def docs_url(self):
        return None if self.APP_MODE == "production" else "/docs"

    @property
    def redoc_url(self):
        return None if self.APP_MODE == "production" else "/redoc"

    @property
    def openapi_url(self):
        return None if self.APP_MODE == "production" else "/openapi.json"


settings = Settings()
