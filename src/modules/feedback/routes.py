from fastapi import APIRouter as Router
from src.modules.feedback.schemes import *
from src.storage.dependencies import DbSession
from src.modules.feedback.repository import *

router = Router(prefix="/feedback", tags=["feedback"])


@router.get("/",
            response_model=FeedbackReadResponse,
            status_code=200)
async def read_feedback(db: DbSession, feedback_id: str): # type: ignore
    feedback = get_feedback(db, feedback_id="some-id")
    return FeedbackCreateResponse.model_validate(feedback)

@router.get("/all",
            response_model=list[FeedbackReadResponse],
            status_code=200)
async def read_all_feedback(db: DbSession): # type: ignore
    feedbacks = get_all_feedback(db)
    return [FeedbackReadResponse.model_validate(feedback) for feedback in feedbacks]

@router.post("/",
             response_model=FeedbackCreateResponse,
             status_code=201)
async def submit_feedback(feedback: FeedbackCreateRequest,
                          db: DbSession): # type: ignore
    feedback_created = create_feeback(
        db,
        Feedback.model_validate(feedback)
    )
    return FeedbackCreateResponse.model_validate(feedback_created)
