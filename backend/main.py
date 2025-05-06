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
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey, Boolean, Integer, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
import time
from fastapi.staticfiles import StaticFiles

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

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# File storage setup
UPLOAD_DIR = "uploads"
AVATAR_DIR = os.path.join(UPLOAD_DIR, "avatars")
MUSIC_DIR = os.path.join(UPLOAD_DIR, "music")
COVER_DIR = os.path.join(UPLOAD_DIR, "covers")

# Create necessary directories
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(MUSIC_DIR, exist_ok=True)
os.makedirs(COVER_DIR, exist_ok=True)

# Database models
class User(Base):
    __tablename__ = "users"
    
    username = Column(String, primary_key=True)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    disabled = Column(Boolean, default=False)
    hashed_password = Column(String, nullable=False)
    avatar_path = Column(String, nullable=True)
    nickname = Column(String, nullable=True)

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    owner_username = Column(String, ForeignKey("users.username"), nullable=False)
    file_path = Column(String, nullable=False)
    cover_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    plays = Column(Integer, default=0)
    duration = Column(String, nullable=True)

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
    nickname: Optional[str] = None
    avatar_path: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    nickname: Optional[str] = None

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
    file_path: str
    plays: int
    duration: Optional[str] = None
    likes_count: int = 0
    is_liked: bool = False

    class Config:
        from_attributes = True

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

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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

# Auth endpoints
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
        disabled=False,
        hashed_password=hashed_password,
        nickname=user.nickname
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

# Profile endpoints
@app.get("/users/me", response_model=UserBase)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=UserBase)
async def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not validate_image_file(file):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{current_user.username}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(AVATAR_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user avatar path
    current_user.avatar_path = f"/uploads/avatars/{filename}"
    db.commit()
    
    return {"avatar_path": current_user.avatar_path}

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
    if not validate_audio_file(file):
        raise HTTPException(status_code=400, detail="Invalid file type. Only MP3 files are allowed.")
    
    # Generate unique filenames
    track_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    track_filename = f"{track_id}{file_extension}"
    track_path = os.path.join(MUSIC_DIR, track_filename)
    
    # Save track file
    with open(track_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Handle cover if provided
    cover_path = None
    if cover:
        if not validate_image_file(cover):
            raise HTTPException(status_code=400, detail="Invalid cover file type. Only images are allowed.")
        cover_extension = os.path.splitext(cover.filename)[1]
        cover_filename = f"{track_id}{cover_extension}"
        cover_path = os.path.join(COVER_DIR, cover_filename)
        with open(cover_path, "wb") as buffer:
            shutil.copyfileobj(cover.file, buffer)
        cover_path = f"/uploads/covers/{cover_filename}"
    
    # Create track record
    track = Track(
        id=track_id,
        name=name,
        owner_username=current_user.username,
        file_path=f"/uploads/music/{track_filename}",
        cover_path=cover_path,
        duration="0:00"  # You might want to add actual duration calculation
    )
    
    db.add(track)
    db.commit()
    db.refresh(track)
    
    return track

@app.delete("/tracks/{track_id}")
async def delete_track(
    track_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    if track.owner_username != current_user.username:
        raise HTTPException(status_code=403, detail="Not authorized to delete this track")
    
    # Delete files
    if track.file_path:
        try:
            os.remove(os.path.join(UPLOAD_DIR, track.file_path.lstrip("/uploads/")))
        except:
            pass
    if track.cover_path:
        try:
            os.remove(os.path.join(UPLOAD_DIR, track.cover_path.lstrip("/uploads/")))
        except:
            pass
    
    # Delete track record
    db.delete(track)
    db.commit()
    
    return {"message": "Track deleted successfully"}

@app.get("/tracks", response_model=List[TrackResponse])
async def list_tracks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tracks = db.query(Track).filter(Track.owner_username == current_user.username).all()
    
    # Add likes count and is_liked status
    for track in tracks:
        track.likes_count = db.query(Like).filter(Like.track_id == track.id).count()
        track.is_liked = db.query(Like).filter(
            Like.track_id == track.id,
            Like.username == current_user.username
        ).first() is not None
    
    return tracks

@app.post("/tracks/{track_id}/like")
async def like_track(
    track_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.track_id == track_id,
        Like.username == current_user.username
    ).first()
    
    if existing_like:
        raise HTTPException(status_code=400, detail="Track already liked")
    
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
    like = db.query(Like).filter(
        Like.track_id == track_id,
        Like.username == current_user.username
    ).first()
    
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    
    db.delete(like)
    db.commit()
    
    return {"message": "Track unliked successfully"}

@app.get("/tracks/liked", response_model=List[TrackResponse])
async def get_liked_tracks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    liked_tracks = db.query(Track).join(Like).filter(
        Like.username == current_user.username
    ).all()
    
    # Add likes count and is_liked status
    for track in liked_tracks:
        track.likes_count = db.query(Like).filter(Like.track_id == track.id).count()
        track.is_liked = True
    
    return liked_tracks

# Statistics endpoints
@app.get("/users/me/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get total tracks
    total_tracks = db.query(Track).filter(Track.owner_username == current_user.username).count()
    
    # Get total plays
    total_plays = db.query(Track).filter(
        Track.owner_username == current_user.username
    ).with_entities(func.sum(Track.plays)).scalar() or 0
    
    # Get total likes
    total_likes = db.query(Like).join(Track).filter(
        Track.owner_username == current_user.username
    ).count()
    
    return {
        "total_tracks": total_tracks,
        "total_plays": total_plays,
        "total_likes": total_likes
    }

# Track playback endpoint
@app.post("/tracks/{track_id}/play")
async def increment_play_count(
    track_id: str,
    db: Session = Depends(get_db)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track.plays += 1
    db.commit()
    
    return {"message": "Play count incremented successfully"} 