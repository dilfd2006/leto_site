from src.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = None

def get_database_url():
    try:
        if settings.database.POSTGRES_URL:
            return settings.database.POSTGRES_URL
    except AttributeError:
        raise ValueError("Database configuration is missing.") 
    
    return ""

def get_engine():
    global engine
    if engine is None:
        database_url = get_database_url()
        engine = create_engine(database_url)
    return engine

def get_session_maker():
    engine = get_engine()
    session_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return session_maker

def get_session():
    session_maker = get_session_maker()
    db = session_maker()
    with db as session:
        try:
            yield session
        finally:
            session.close()