from uuid import UUID
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime

class Feedback(SQLModel, table=True):
    
    __tablename__ = "feedback" # type: ignore
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, description="Unique identifier for the feedback")
    name: str = Field(description="Name of the user providing feedback")
    comment: str = Field(description="Feedback comment provided by the user")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the feedback was created")
    

    