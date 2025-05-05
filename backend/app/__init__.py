from app.database.database import Base, engine
from app.models.user import User

# Создаем все таблицы при запуске приложения
Base.metadata.create_all(bind=engine) 