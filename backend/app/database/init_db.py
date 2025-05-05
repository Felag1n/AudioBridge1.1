from app.database.database import Base, engine
from app.models.user import User

def init_db():
    # Создаем все таблицы
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db() 