import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import HTTPException
from jose import ExpiredSignatureError, JWTError, jwt

load_dotenv()

SECRET_KEY: Optional[str] = os.environ.get("JWT_SECRET")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
API_KEY: str = os.environ.get("API_KEY")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    _ed = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    iat = datetime.now(timezone.utc)
    exp = iat + _ed
    to_encode.update({"iat": iat, "exp": exp})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
