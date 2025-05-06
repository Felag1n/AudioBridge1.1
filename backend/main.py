from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import shutil
import uuid
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
import time

# Load environment variables
load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./audiobridge.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spam protection
class SpamProtection:
    def __init__(self):
        self.requests = {}
        self.cooldown = 60  # seconds
        self.max_requests = 5  # max requests per cooldown period

    def check_request(self, ip: str) -> bool:
        current_time = time.time()
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Remove old requests
        self.requests[ip] = [t for t in self.requests[ip] if current_time - t < self.cooldown]
        
        if len(self.requests[ip]) >= self.max_requests:
            return False
        
        self.requests[ip].append(current_time)
        return True

spam_protection = SpamProtection()

# Database models
class User(Base):
    __tablename__ = "users"
    
    username = Column(String, primary_key=True)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    disabled = Column(Boolean, default=False)
    hashed_password = Column(String, nullable=False)

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    owner_username = Column(String, ForeignKey("users.username"), nullable=False)
    file_path = Column(String, nullable=False)
    cover_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Like(Base):
    __tablename__ = "likes"
    
    id = Column(String, primary_key=True)
    track_id = Column(String, ForeignKey("tracks.id"), nullable=False)
    username = Column(String, ForeignKey("users.username"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TrackBase(BaseModel):
    name: str

class TrackCreate(TrackBase):
    pass

class TrackResponse(TrackBase):
    id: str
    owner_username: str
    created_at: datetime
    cover_path: Optional[str] = None
    likes_count: int = 0
    is_liked: bool = False

    class Config:
        from_attributes = True

# File storage setup
UPLOAD_DIR = "uploads"
MUSIC_DIR = os.path.join(UPLOAD_DIR, "music")
PREVIEW_DIR = os.path.join(UPLOAD_DIR, "preview")

# Create necessary directories
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MUSIC_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# File validation
def validate_audio_file(file: UploadFile) -> bool:
    return file.filename.lower().endswith('.mp3')

def validate_image_file(file: UploadFile) -> bool:
    return file.filename.lower().endswith(('.jpg', '.jpeg', '.png'))

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "refresh": True})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=UserBase)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        disabled=user.disabled,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/refresh-token", response_model=Token)
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("refresh"):
            raise credentials_exception
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(data={"sub": username})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@app.get("/users/me", response_model=UserBase)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Track endpoints
@app.post("/tracks/upload", response_model=TrackResponse)
async def upload_track(
    request: Request,
    file: UploadFile = File(...),
    cover: Optional[UploadFile] = File(None),
    name: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Spam protection
    if not spam_protection.check_request(request.client.host):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )

    # Validate audio file
    if not validate_audio_file(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio file format. Only MP3 files are allowed."
        )

    # Validate cover image if provided
    cover_path = None
    if cover:
        if not validate_image_file(cover):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cover image format. Only JPEG and PNG are allowed."
            )
        
        cover_id = str(uuid.uuid4())
        cover_path = os.path.join(PREVIEW_DIR, f"{cover_id}.{cover.filename.split('.')[-1]}")
        
        with open(cover_path, "wb") as buffer:
            shutil.copyfileobj(cover.file, buffer)

    # Save audio file
    track_id = str(uuid.uuid4())
    file_path = os.path.join(MUSIC_DIR, f"{track_id}.mp3")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    db_track = Track(
        id=track_id,
        name=name,
        owner_username=current_user.username,
        file_path=file_path,
        cover_path=cover_path
    )
    
    db.add(db_track)
    db.commit()
    db.refresh(db_track)
    
    return TrackResponse(
        id=db_track.id,
        name=db_track.name,
        owner_username=db_track.owner_username,
        created_at=db_track.created_at,
        cover_path=db_track.cover_path
    )

@app.delete("/tracks/{track_id}")
async def delete_track(
    track_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_track = db.query(Track).filter(Track.id == track_id).first()
    if not db_track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Track not found"
        )
    
    if current_user.username != db_track.owner_username and current_user.username != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this track"
        )
    
    # Delete file
    if os.path.exists(db_track.file_path):
        os.remove(db_track.file_path)
    
    db.delete(db_track)
    db.commit()
    
    return {"message": "Track deleted successfully"}

@app.post("/tracks/{track_id}/like")
async def like_track(
    track_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if track exists
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Track not found"
        )
    
    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.track_id == track_id,
        Like.username == current_user.username
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Track already liked"
        )
    
    # Create new like
    like = Like(
        id=str(uuid.uuid4()),
        track_id=track_id,
        username=current_user.username
    )
    
    db.add(like)
    db.commit()
    
    return {"message": "Track liked successfully"}

@app.delete("/tracks/{track_id}/like")
async def unlike_track(
    track_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if like exists
    like = db.query(Like).filter(
        Like.track_id == track_id,
        Like.username == current_user.username
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    db.delete(like)
    db.commit()
    
    return {"message": "Like removed successfully"}

@app.get("/tracks/liked", response_model=List[TrackResponse])
async def get_liked_tracks(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    liked_tracks = db.query(Track).join(Like).filter(
        Like.username == username
    ).all()
    
    if not liked_tracks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No liked tracks found"
        )
    
    return [TrackResponse(
        id=track.id,
        name=track.name,
        owner_username=track.owner_username,
        created_at=track.created_at,
        cover_path=track.cover_path,
        likes_count=db.query(Like).filter(Like.track_id == track.id).count(),
        is_liked=True
    ) for track in liked_tracks]

@app.get("/tracks", response_model=List[TrackResponse])
async def list_tracks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tracks = db.query(Track).all()
    if not tracks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tracks available"
        )
    
    return [TrackResponse(
        id=track.id,
        name=track.name,
        owner_username=track.owner_username,
        created_at=track.created_at,
        cover_path=track.cover_path,
        likes_count=db.query(Like).filter(Like.track_id == track.id).count(),
        is_liked=db.query(Like).filter(
            Like.track_id == track.id,
            Like.username == current_user.username
        ).first() is not None
    ) for track in tracks]

@app.get("/tracks/{track_id}", response_model=TrackResponse)
async def get_track(
    track_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Track not found"
        )
    
    return TrackResponse(
        id=track.id,
        name=track.name,
        owner_username=track.owner_username,
        created_at=track.created_at,
        cover_path=track.cover_path,
        likes_count=db.query(Like).filter(Like.track_id == track.id).count(),
        is_liked=db.query(Like).filter(
            Like.track_id == track.id,
            Like.username == current_user.username
        ).first() is not None
    ) 