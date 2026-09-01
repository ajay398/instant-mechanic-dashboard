from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import Mechanic, Booking


router = APIRouter(
    prefix="/api/mechanics",
    tags=["Mechanics"],
)


@router.get("")
def get_mechanics(
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Mechanic)

    if status:
        query = query.filter(
            Mechanic.status == status.upper()
        )

    mechanics = query.order_by(
        Mechanic.name
    ).all()

    result = []

    for mechanic in mechanics:
        last_booking = db.query(
            Booking
        ).filter(
            Booking.mechanic_id == mechanic.id
        ).order_by(
            Booking.scheduled_at.desc()
        ).first()

        result.append(
            {
                "id": mechanic.id,
                "name": mechanic.name,
                "phone": mechanic.phone,
                "status": mechanic.status,
                "jobs_completed": mechanic.jobs_completed,
                "rating": mechanic.rating,
                "city": mechanic.city,
                "joined_at": mechanic.joined_at.isoformat(),
                "current_booking": (
                    last_booking.booking_number
                    if last_booking
                    else None
                ),
            }
        )

    return {
        "data": result,
        "total": len(result),
    }