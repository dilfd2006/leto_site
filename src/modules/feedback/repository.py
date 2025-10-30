from src.storage.models import Feedback
# from src.storage.sql.engine import get_session
from sqlalchemy.orm import Session
from src.modules.feedback.schemes import FeedbackCreateRequest
from uuid import UUID


def create_feeback(
        session: Session,
        feedback: Feedback):
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback


def get_feedback(session: Session,
                 feedback_id: str):
    feedback = session.get(Feedback, UUID(feedback_id))
    return feedback

def get_all_active_feedback(session: Session):
    """Retrieve all active feedback entries from the database"""
    feedbacks = session.query(Feedback).filter(Feedback.active == True).all() # type: ignore
    return feedbacks

def get_all_inactive_feedback(session: Session):
    """Retrieve all inactive feedback entries from the database"""
    feedbacks = session.query(Feedback).filter(Feedback.active == False).all() # type: ignore
    return feedbacks


def approve_feedback(
        session: Session,
        feedback: Feedback):
    feedback.active = True
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback

def reject_feedback(
        session: Session,
        feedback: Feedback):
    feedback.active = False
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback