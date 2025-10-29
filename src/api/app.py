import fastapi
from fastapi.middleware.cors import CORSMiddleware
from src.modules.feedback.routes import router as feedback_router

app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback_router, prefix="/api", tags=["feedback"])
