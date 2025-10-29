"""
Storage dependencies for FastAPI dependency injection.

This module provides centralized access to async database sessions and Redis clients
for the fraud detection system components.
"""

from typing import Annotated

from fastapi import Depends

from src.storage.sql.engine import get_session

def get_db_session():
    for session in get_session():
        yield session

DbSession = Annotated[any, Depends(get_db_session)]


