# backend/app/api/routes/__init__.py

from app.api.routes import (
    dashboard,
    bookings,
    mechanics,
    customers,
    auth,
    websocket,
)

__all__ = [
    "dashboard",
    "bookings",
    "mechanics",
    "customers",
    "auth",
    "websocket",
]