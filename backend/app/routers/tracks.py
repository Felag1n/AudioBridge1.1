from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.responses import FileResponse
import os
import shutil
from datetime import datetime
import uuid
from ..database import get_db
from ..models import Track, User
from ..auth import get_current_user
from ..schemas import TrackCreate, TrackResponse

router = APIRouter()

# Минимальное время прослушивания в секундах
MIN_PLAY_DURATION = 25

# Словарь для хранения времени начала прослушивания
# Формат: {(track_id, user_id): start_time}
track_play_starts = {}

@router.get("/uploads/music/{track_id}.mp3")
async def get_track_file(
    track_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Записываем время начала прослушивания для конкретного пользователя
    track_play_starts[(track_id, current_user.id)] = datetime.now()
    
    return FileResponse(f"uploads/music/{track_id}.mp3")

@router.post("/tracks/{track_id}/play-complete")
async def complete_track_play(
    track_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Получаем время начала прослушивания для конкретного пользователя
    start_time = track_play_starts.get((track_id, current_user.id))
    if start_time:
        # Вычисляем длительность прослушивания
        play_duration = (datetime.now() - start_time).total_seconds()
        
        # Если прослушивание длилось больше минимального времени, увеличиваем счетчик
        if play_duration >= MIN_PLAY_DURATION:
            track.plays += 1
            db.commit()
            print(f"Track {track_id} played for {play_duration} seconds, plays count increased to {track.plays}")
        
        # Удаляем запись о начале прослушивания
        del track_play_starts[(track_id, current_user.id)]
    
    return {"status": "success", "plays": track.plays}

@router.get("/tracks")
async def get_tracks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tracks = db.query(Track).all()
    return tracks

@router.post("/tracks/upload")
async def upload_track(
    file: UploadFile = File(...),
    name: str = Form(...),
    cover: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Генерируем уникальный ID для трека
    track_id = str(uuid.uuid4())
    
    # Сохраняем аудио файл
    file_extension = os.path.splitext(file.filename)[1]
    file_path = f"uploads/music/{track_id}{file_extension}"
    os.makedirs("uploads/music", exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Сохраняем обложку, если она есть
    cover_path = None
    if cover:
        cover_extension = os.path.splitext(cover.filename)[1]
        cover_path = f"uploads/covers/{track_id}{cover_extension}"
        os.makedirs("uploads/covers", exist_ok=True)
        
        with open(cover_path, "wb") as buffer:
            shutil.copyfileobj(cover.file, buffer)
    
    # Создаем запись в базе данных
    track = Track(
        id=track_id,
        name=name,
        owner_username=current_user.username,
        file_path=f"/uploads/music/{track_id}{file_extension}",
        cover_path=f"/uploads/covers/{track_id}{cover_extension}" if cover else None,
        created_at=datetime.now(),
        plays=0
    )
    
    db.add(track)
    db.commit()
    db.refresh(track)
    
    return track 