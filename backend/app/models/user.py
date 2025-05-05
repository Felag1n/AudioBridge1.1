from sqlalchemy import Column, Integer, String, Boolean, Enum
import enum
from app.database.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PERFORMER = "performer"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER) 