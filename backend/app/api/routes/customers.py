from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import Customer, Booking


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"],
)


@router.get("")
def get_customers(
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    # ---------------------------------------------------------
    # Calculate booking statistics for all customers in one
    # aggregated database query.
    #
    # This replaces the previous N+1 query pattern where
    # two additional queries were executed for every customer.
    # ---------------------------------------------------------

    booking_stats = (
        db.query(
            Booking.customer_id.label("customer_id"),

            func.count(
                Booking.id
            ).label("booking_count"),

            func.coalesce(
                func.sum(
                    Booking.amount
                ).filter(
                    Booking.status == "COMPLETED"
                ),
                0,
            ).label("total_spent"),
        )
        .group_by(
            Booking.customer_id
        )
        .subquery()
    )

    # ---------------------------------------------------------
    # Main customer query
    # ---------------------------------------------------------

    query = (
        db.query(
            Customer.id,
            Customer.name,
            Customer.email,
            Customer.phone,
            Customer.city,
            Customer.created_at,

            func.coalesce(
                booking_stats.c.booking_count,
                0,
            ).label("booking_count"),

            func.coalesce(
                booking_stats.c.total_spent,
                0,
            ).label("total_spent"),
        )
        .outerjoin(
            booking_stats,
            booking_stats.c.customer_id
            == Customer.id,
        )
    )

    # ---------------------------------------------------------
    # Optional customer search
    # ---------------------------------------------------------

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            (Customer.name.ilike(search_value))
            | (Customer.email.ilike(search_value))
            | (Customer.phone.ilike(search_value))
        )

    # ---------------------------------------------------------
    # Execute query
    # ---------------------------------------------------------

    customers = (
        query
        .order_by(
            Customer.created_at.desc()
        )
        .all()
    )

    # ---------------------------------------------------------
    # Build response
    # ---------------------------------------------------------

    result = []

    for customer in customers:
        result.append(
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "city": customer.city,

                "booking_count": int(
                    customer.booking_count or 0
                ),

                "total_spent": round(
                    float(
                        customer.total_spent or 0
                    ),
                    2,
                ),

                "created_at": (
                    customer.created_at.isoformat()
                ),
            }
        )

    return {
        "data": result,
        "total": len(result),
    }