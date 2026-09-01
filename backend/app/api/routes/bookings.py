# backend/app/api/routes/bookings.py

from datetime import datetime, timezone
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from pydantic import BaseModel
from sqlalchemy.orm import (
    Session,
    joinedload,
)

from app.database.database import get_db
from app.models import Booking, Mechanic
from app.services.websocket_manager import manager


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)


class BookingStatusUpdate(BaseModel):
    status: str


class MechanicAssignment(BaseModel):
    mechanic_id: Optional[int] = None


def serialize_booking(booking: Booking):
    return {
        "id": booking.id,
        "booking_number": booking.booking_number,

        "customer": (
            booking.customer.name
            if booking.customer
            else None
        ),

        "customer_id": booking.customer_id,

        "vehicle": (
            f"{booking.vehicle.make} "
            f"{booking.vehicle.model}"
            if booking.vehicle
            else None
        ),

        "vehicle_id": booking.vehicle_id,

        "mechanic": (
            booking.mechanic.name
            if booking.mechanic
            else None
        ),

        "mechanic_id": booking.mechanic_id,

        "service": (
            booking.service.name
            if booking.service
            else None
        ),

        "service_category": (
            booking.service.category
            if booking.service
            else None
        ),

        "status": booking.status,

        "amount": float(
            booking.amount
        ),

        "scheduled_at": (
            booking.scheduled_at.isoformat()
            if booking.scheduled_at
            else None
        ),

        "completed_at": (
            booking.completed_at.isoformat()
            if booking.completed_at
            else None
        ),

        "notes": booking.notes,

        "created_at": (
            booking.created_at.isoformat()
            if booking.created_at
            else None
        ),
    }


def get_booking_with_relations(
    booking_id: int,
    db: Session,
):
    return (
        db.query(Booking)
        .options(
            joinedload(Booking.customer),
            joinedload(Booking.mechanic),
            joinedload(Booking.vehicle),
            joinedload(Booking.service),
        )
        .filter(
            Booking.id == booking_id
        )
        .first()
    )


@router.get("")
def get_bookings(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(
        1,
        ge=1,
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Booking).options(
        joinedload(Booking.customer),
        joinedload(Booking.mechanic),
        joinedload(Booking.vehicle),
        joinedload(Booking.service),
    )

    if status:
        status_value = (
            status
            .strip()
            .upper()
            .replace("-", "_")
            .replace(" ", "_")
        )

        query = query.filter(
            Booking.status == status_value
        )

    if search:
        search_value = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            Booking.booking_number.ilike(
                search_value
            )
        )

    total = query.count()

    bookings = (
        query
        .order_by(
            Booking.scheduled_at.desc()
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )

    return {
        "data": [
            serialize_booking(booking)
            for booking in bookings
        ],

        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (
                (total + limit - 1)
                // limit
            ),
        },
    }


@router.get("/{booking_id}")
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = get_booking_with_relations(
        booking_id,
        db,
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return serialize_booking(
        booking
    )


@router.patch(
    "/{booking_id}/status"
)
async def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
):
    booking = get_booking_with_relations(
        booking_id,
        db,
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    new_status = (
        payload.status
        .strip()
        .upper()
        .replace("-", "_")
        .replace(" ", "_")
    )

    status_aliases = {
        "PENDING": "PENDING",
        "CONFIRMED": "CONFIRMED",
        "ASSIGNED": "ASSIGNED",
        "IN_PROGRESS": "IN_PROGRESS",
        "INPROGRESS": "IN_PROGRESS",
        "COMPLETED": "COMPLETED",
        "CANCELLED": "CANCELLED",
        "CANCELED": "CANCELLED",
    }

    new_status = status_aliases.get(
        new_status
    )

    allowed_statuses = {
        "PENDING",
        "CONFIRMED",
        "ASSIGNED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
    }

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid booking status",
                "allowed_statuses": sorted(
                    allowed_statuses
                ),
            },
        )

    old_status = booking.status

    booking.status = new_status

    if new_status == "COMPLETED":
        booking.completed_at = (
            datetime.now(timezone.utc)
        )

    elif old_status == "COMPLETED":
        booking.completed_at = None

    db.commit()
    db.refresh(booking)

    booking = get_booking_with_relations(
        booking_id,
        db,
    )

    serialized = serialize_booking(
        booking
    )

    message = {
        "type": "booking_update",
        "action": "status_changed",
        "message": "Booking status updated",
        "booking": serialized,
    }

    await manager.broadcast(
        message
    )

    return {
        "success": True,
        "message": "Booking status updated",
        "data": serialized,
    }


@router.patch(
    "/{booking_id}/mechanic"
)
async def assign_mechanic(
    booking_id: int,
    payload: MechanicAssignment,
    db: Session = Depends(get_db),
):
    booking = get_booking_with_relations(
        booking_id,
        db,
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    mechanic = None

    if payload.mechanic_id is not None:

        mechanic = (
            db.query(Mechanic)
            .filter(
                Mechanic.id
                == payload.mechanic_id
            )
            .first()
        )

        if not mechanic:
            raise HTTPException(
                status_code=404,
                detail="Mechanic not found",
            )

        booking.mechanic_id = mechanic.id

        if booking.status == "PENDING":
            booking.status = "ASSIGNED"

    else:
        booking.mechanic_id = None

    db.commit()
    db.refresh(booking)

    booking = get_booking_with_relations(
        booking_id,
        db,
    )

    serialized = serialize_booking(
        booking
    )

    message = {
        "type": "booking_update",
        "action": "mechanic_assigned",
        "message": "Booking mechanic updated",
        "booking": serialized,
    }

    await manager.broadcast(
        message
    )

    return {
        "success": True,
        "message": "Mechanic assignment updated",
        "data": serialized,
    }


@router.post(
    "/{booking_id}/broadcast"
)
async def broadcast_booking_update(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = get_booking_with_relations(
        booking_id,
        db,
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    serialized = serialize_booking(
        booking
    )

    message = {
        "type": "booking_update",
        "action": "manual_broadcast",
        "message": "Booking updated",
        "booking": serialized,
    }

    await manager.broadcast(
        message
    )

    return {
        "success": True,
        "message": (
            "Booking update broadcast "
            "successfully"
        ),
        "booking_id": booking.id,
    }