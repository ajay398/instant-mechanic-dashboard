from datetime import datetime, date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import Booking, Customer, Mechanic, Service


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    today = date.today()

    total_bookings = db.query(
        func.count(Booking.id)
    ).scalar() or 0

    today_bookings = db.query(
        func.count(Booking.id)
    ).filter(
        func.date(Booking.scheduled_at) == today
    ).scalar() or 0

    completed_bookings = db.query(
        func.count(Booking.id)
    ).filter(
        Booking.status == "COMPLETED"
    ).scalar() or 0

    pending_bookings = db.query(
        func.count(Booking.id)
    ).filter(
        Booking.status == "PENDING"
    ).scalar() or 0

    cancelled_bookings = db.query(
        func.count(Booking.id)
    ).filter(
        Booking.status == "CANCELLED"
    ).scalar() or 0

    total_revenue = db.query(
        func.coalesce(func.sum(Booking.amount), 0)
    ).filter(
        Booking.status == "COMPLETED"
    ).scalar() or 0

    active_mechanics = db.query(
        func.count(Mechanic.id)
    ).filter(
        Mechanic.status.in_(["AVAILABLE", "ON_JOB", "BUSY"])
    ).scalar() or 0

    new_customers = db.query(
        func.count(Customer.id)
    ).filter(
        func.date(Customer.created_at) >= today
    ).scalar() or 0

    status_breakdown = db.query(
        Booking.status,
        func.count(Booking.id)
    ).group_by(
        Booking.status
    ).all()

    category_breakdown = db.query(
        Service.category,
        func.count(Booking.id)
    ).join(
        Booking,
        Booking.service_id == Service.id
    ).group_by(
        Service.category
    ).all()

    return {
        "overview": {
            "total_bookings": total_bookings,
            "today_bookings": today_bookings,
            "completed_bookings": completed_bookings,
            "pending_bookings": pending_bookings,
            "cancelled_bookings": cancelled_bookings,
            "total_revenue": round(float(total_revenue), 2),
            "active_mechanics": active_mechanics,
            "new_customers": new_customers,
        },
        "booking_status": [
            {
                "status": status,
                "count": count,
            }
            for status, count in status_breakdown
        ],
        "service_categories": [
            {
                "category": category,
                "count": count,
            }
            for category, count in category_breakdown
        ],
    }


@router.get("/revenue")
def get_revenue_analytics(
    db: Session = Depends(get_db),
):
    results = db.query(
        func.date(Booking.scheduled_at).label("date"),
        func.sum(Booking.amount).label("revenue"),
    ).filter(
        Booking.status == "COMPLETED"
    ).group_by(
        func.date(Booking.scheduled_at)
    ).order_by(
        func.date(Booking.scheduled_at)
    ).all()

    return [
        {
            "date": str(item.date),
            "revenue": round(float(item.revenue or 0), 2),
        }
        for item in results
    ]


@router.get("/bookings-over-time")
def get_bookings_over_time(
    db: Session = Depends(get_db),
):
    results = db.query(
        func.date(Booking.scheduled_at).label("date"),
        func.count(Booking.id).label("bookings"),
    ).group_by(
        func.date(Booking.scheduled_at)
    ).order_by(
        func.date(Booking.scheduled_at)
    ).all()

    return [
        {
            "date": str(item.date),
            "bookings": item.bookings,
        }
        for item in results
    ]