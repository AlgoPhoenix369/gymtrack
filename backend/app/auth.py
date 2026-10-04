import secrets

from fastapi import Header, HTTPException, status

from app.config import ADMIN_API_KEY


# Reject the request unless the X-API-Key header matches ADMIN_API_KEY.
def require_admin(x_api_key: str | None = Header(default=None)) -> None:
    if not ADMIN_API_KEY or not x_api_key or not secrets.compare_digest(x_api_key, ADMIN_API_KEY):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API key")