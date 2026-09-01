from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import Booking, Service


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


@router.get("")
def get_analytics(
    start_date: date | None = Query(
        default=None,
        description="Start date for analytics",
    ),
    end_date: date | None = Query(
        default=None,
        description="End date for analytics",
    ),
    db: Session = Depends(get_db),
):
    # =========================================================
    # DATE RANGE
    # =========================================================

    # If no start date is provided, use the last 30 days.
    if start_date is None:
        start_datetime = datetime.utcnow() - timedelta(days=30)
    else:
        start_datetime = datetime.combine(
            start_date,
            datetime.min.time(),
        )

    # If no end date is provided, use the current time.
    # Otherwise include the complete end date.
    if end_date is None:
        end_datetime = datetime.utcnow()
    else:
        end_datetime = datetime.combine(
            end_date + timedelta(days=1),
            datetime.min.time(),
        )

    # Validate date range
    if start_datetime >= end_datetime:
        return {
            "message": "Invalid date range",
            "detail": "start_date must be before end_date",
        }

    # =========================================================
    # BOOKINGS OVER TIME
    # =========================================================

    bookings_over_time = (
        db.query(
            func.date(Booking.scheduled_at).label("date"),
            func.count(Booking.id).label("bookings"),
        )
        .filter(
            Booking.scheduled_at >= start_datetime,
            Booking.scheduled_at < end_datetime,
        )
        .group_by(
            func.date(Booking.scheduled_at)
        )
        .order_by(
            func.date(Booking.scheduled_at)
        )
        .all()
    )

    # =========================================================
    # REVENUE OVER TIME
    # =========================================================

    revenue_over_time = (
        db.query(
            func.date(Booking.scheduled_at).label("date"),
            func.coalesce(
                func.sum(Booking.amount),
                0,
            ).label("revenue"),
        )
        .filter(
            Booking.scheduled_at >= start_datetime,
            Booking.scheduled_at < end_datetime,
        )
        .group_by(
            func.date(Booking.scheduled_at)
        )
        .order_by(
            func.date(Booking.scheduled_at)
        )
        .all()
    )

    # =========================================================
    # BOOKING STATUS
    # =========================================================

    booking_status = (
        db.query(
            Booking.status.label("status"),
            func.count(Booking.id).label("count"),
        )
        .filter(
            Booking.scheduled_at >= start_datetime,
            Booking.scheduled_at < end_datetime,
        )
        .group_by(
            Booking.status
        )
        .order_by(
            Booking.status
        )
        .all()
    )

    # =========================================================
    # SERVICE BREAKDOWN
    # =========================================================

    service_breakdown = (
        db.query(
            Service.name.label("service"),
            func.count(Booking.id).label("count"),
        )
        .join(
            Booking,
            Booking.service_id == Service.id,
        )
        .filter(
            Booking.scheduled_at >= start_datetime,
            Booking.scheduled_at < end_datetime,
        )
        .group_by(
            Service.name
        )
        .order_by(
            func.count(Booking.id).desc()
        )
        .all()
    )

    # =========================================================
    # RESPONSE
    # =========================================================

    return {
        "bookings_over_time": [
            {
                "date": str(row.date),
                "bookings": row.bookings,
            }
            for row in bookings_over_time
        ],

        "revenue_over_time": [
            {
                "date": str(row.date),
                "revenue": float(row.revenue),
            }
            for row in revenue_over_time
        ],

        "booking_status": [
            {
                "status": str(row.status),
                "count": row.count,
            }
            for row in booking_status
        ],

        "service_breakdown": [
            {
                "service": row.service,
                "count": row.count,
            }
            for row in service_breakdown
        ],
    }