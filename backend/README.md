# FastAPI Authentication System

This is a FastAPI-based authentication system that provides user registration, login, and token refresh functionality.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory with the following content:
```
SECRET_KEY=your-secure-secret-key-here
```

3. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Register a new user
- **POST** `/register`
- Body:
```json
{
    "username": "string",
    "email": "string",
    "full_name": "string",
    "password": "string"
}
```

### Login
- **POST** `/token`
- Body (form-data):
  - username: string
  - password: string
- Returns:
```json
{
    "access_token": "string",
    "refresh_token": "string",
    "token_type": "bearer"
}
```

### Refresh Access Token
- **POST** `/refresh-token`
- Body:
```json
{
    "refresh_token": "string"
}
```
- Returns new access and refresh tokens

### Get Current User
- **GET** `/users/me`
- Header: `Authorization: Bearer <access_token>`

## Security Features

- JWT-based authentication
- Access token expiration: 30 minutes
- Refresh token expiration: 7 days
- Password hashing using bcrypt
- Secure token refresh mechanism 