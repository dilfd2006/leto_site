from datetime import datetime
from uuid import UUID
from sqlmodel import Field, SQLModel


class FeedbackCreateRequest(SQLModel):
    name: str = Field(description="Name of the user providing feedback")
    comment: str = Field(description="Feedback comment provided by the user")
    
class FeedbackCreateResponse(SQLModel):
    id: UUID = Field(description="Unique identifier for the feedback")
    name: str = Field(description="Name of the user providing feedback")
    comment: str = Field(description="Feedback comment provided by the user")
    created_at: datetime = Field(description="Timestamp when the feedback was created")
    

class FeedbackReadResponse(SQLModel):
    id: UUID = Field(description="Unique identifier for the feedback")
    name: str = Field(description="Name of the user providing feedback")
    comment: str = Field(description="Feedback comment provided by the user")
    created_at: datetime = Field(description="Timestamp when the feedback was created")

