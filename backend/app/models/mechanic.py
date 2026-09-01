from datetime import datetime

from sqlalchemy import String, Integer, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Mechanic(Base):
    __tablename__ = "mechanics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(
        String(40),
        default="AVAILABLE",
        nullable=False,
    )
    jobs_completed: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    rating: Mapped[float] = mapped_column(
        Float,
        default=4.5,
        nullable=False,
    )
    city: Mapped[str] = mapped_column(String(80), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    bookings = relationship(
        "Booking",
        back_populates="mechanic",
    )