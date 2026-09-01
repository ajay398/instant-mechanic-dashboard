from sqlalchemy import String, Float, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(
        String(80),
        index=True,
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    base_price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    estimated_minutes: Mapped[int] = mapped_column(
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    bookings = relationship(
        "Booking",
        back_populates="service",
    )