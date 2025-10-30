from fastapi import APIRouter as Router
from src.modules.feedback.schemes import *
from src.storage.dependencies import DbSession
from src.modules.feedback.repository import *

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from src.config import settings

router = Router(prefix="/feedback", tags=["feedback"])


@router.get("/",
            response_model=FeedbackReadResponse,
            status_code=200)
async def read_feedback(db: DbSession, feedback_id: str): # type: ignore
    feedback = get_feedback(db, feedback_id="some-id")
    return FeedbackCreateResponse.model_validate(feedback)

@router.get("/all",
            response_model=list[FeedbackReadResponse],
            status_code=200, 
            description="Get all active/inactive feedbacks")
async def read_all_feedback(db: DbSession, # type: ignore
                            active: bool = True, ): 
    if active:
        feedbacks = get_all_active_feedback(db)
    else:
        feedbacks = get_all_inactive_feedback(db)
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
    
    # Here I send feedback to admin bot via telegram 
    bot = Bot(token=settings.TOKEN)
    
    await bot.send_message(
        chat_id=settings.ADMIN_ID,  # replace with actual admin chat ID
        text=f"Получен новый отзыв:\nИмя: {feedback.name}\nКомментарий: {feedback.comment}",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Подтвердить", 
                                  callback_data=f"confirm_feedback:{feedback_created.id}")],
            [InlineKeyboardButton(text="Отклонить", 
                                  callback_data=f"reject_feedback:{feedback_created.id}")]
             ])
    )
    
    await bot.session.close()
    
    return FeedbackCreateResponse.model_validate(feedback_created)

@router.post("/approve/{feedback_id}",
             status_code=200,
             description="Approve feedback by ID")
async def approve_feedback_endpoint(feedback_id: str,
                                    db: DbSession): # type: ignore
    feedback = get_feedback(db, feedback_id)
    if not feedback:
        return {"error": "Feedback not found"}
    
    approved_feedback = approve_feedback(db, feedback)
    return FeedbackReadResponse.model_validate(approved_feedback)

@router.post("/reject/{feedback_id}",
             status_code=200,
             description="Approve feedback by ID")
async def reject_feedback_endpoint(feedback_id: str,
                                    db: DbSession): # type: ignore
    feedback = get_feedback(db, feedback_id)
    if not feedback:
        return {"error": "Feedback not found"}
    
    rejected_feedback = reject_feedback(db, feedback)
    return FeedbackReadResponse.model_validate(rejected_feedback)
