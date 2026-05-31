from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:////data/tipovacka.db"
    jwt_secret: str = "change-me-in-production"
    jwt_access_minutes: int = 60
    jwt_refresh_days: int = 30
    cors_origins: str = "http://localhost:4200,http://localhost"
    seed_password: str = "tipovacka"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
