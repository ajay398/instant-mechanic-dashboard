from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import relationship

from app.database.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    booking_number = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False,
        index=True,
    )

    mechanic_id = Column(
        Integer,
        ForeignKey("mechanics.id"),
        nullable=True,
        index=True,
    )

    service_id = Column(
        Integer,
        ForeignKey("services.id"),
        nullable=False,
        index=True,
    )

    status = Column(
        String(40),
        nullable=False,
        default="PENDING",
        index=True,
    )

    amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    scheduled_at = Column(
        DateTime,
        nullable=False,
        index=True,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    customer = relationship(
        "Customer",
        back_populates="bookings",
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="bookings",
    )

    mechanic = relationship(
        "Mechanic",
        back_populates="bookings",
    )

    service = relationship(
        "Service",
        back_populates="bookings",
    )