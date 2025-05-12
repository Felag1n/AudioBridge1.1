# 🎵 AudioBridge

## 📝 Описание
AudioBridge - это современное веб-приложение для работы с аудио файлами. Проект построен с использованием современных технологий и предоставляет удобный интерфейс для обработки аудио.

## 🚀 Технологии
### Frontend
- Next.js
- React
- Tailwind CSS
- Radix UI
- Zustand (управление состоянием)

### Backend
- Python
- SQLite (audiobridge.db)

## 🛠️ Установка и запуск

### Frontend
```bash
# Переходим в директорию frontend
cd frontend

# Устанавливаем зависимости
npm install

# Запускаем проект в режиме разработки
npm run dev
```

### Backend
```bash
# Переходим в директорию backend
cd backend

# Создаем виртуальное окружение Python
python -m venv venv

# Активируем виртуальное окружение
# Для Windows:
venv\Scripts\activate
# Для Linux/Mac:
source venv/bin/activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Запускаем сервер
python main.py
```

## 📁 Структура проекта
```
AudioBridge/
├── frontend/          # Next.js приложение
│   ├── src/          # Исходный код
│   ├── public/       # Статические файлы
│   └── ...
├── backend/          # Python бэкенд
│   ├── app/         # Основной код приложения
│   ├── uploads/     # Директория для загруженных файлов
│   └── ...
└── ...
```

## 🔧 Требования
- Node.js (версия 18 или выше)
- Python 3.8+
- npm или yarn


