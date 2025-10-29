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

def get_all_feedback(session: Session):
    feedbacks = session.query(Feedback).all()
    return feedbacks
