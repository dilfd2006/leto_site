from pathlib import Path
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

PROJECT_ROOT = Path(__file__).parent.parent

class DatabaseSettings(BaseSettings):
    POSTGRES_DB: str = Field(default="findar")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="postgres")
    POSTGRES_HOST: str = Field(default="localhost")
    POSTGRES_PORT: int = Field(default=5432)
    POSTGRES_URL: Optional[str] = Field(default=None)
    
    @field_validator("POSTGRES_URL", mode="before")
    def assemble_async_db_connection(cls, v, values):
        if isinstance(v, str):
            return v
        info = values.data
        return (
            
            f"postgresql://{info['POSTGRES_USER']}:"
            f"{info['POSTGRES_PASSWORD']}@"
            f"{info['POSTGRES_HOST']}:"
            f"{info['POSTGRES_PORT']}/"
            f"{info['POSTGRES_DB']}"
        )

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

class Settings(BaseSettings):
    database: DatabaseSettings = DatabaseSettings()

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

settings = Settings()