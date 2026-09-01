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
    query = db.query(Customer)

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            (Customer.name.ilike(search_value))
            | (Customer.email.ilike(search_value))
            | (Customer.phone.ilike(search_value))
        )

    customers = query.order_by(
        Customer.created_at.desc()
    ).all()

    result = []

    for customer in customers:
        booking_count = db.query(
            func.count(Booking.id)
        ).filter(
            Booking.customer_id == customer.id
        ).scalar() or 0

        total_spent = db.query(
            func.coalesce(func.sum(Booking.amount), 0)
        ).filter(
            Booking.customer_id == customer.id,
            Booking.status == "COMPLETED",
        ).scalar() or 0

        result.append(
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "city": customer.city,
                "booking_count": booking_count,
                "total_spent": round(
                    float(total_spent),
                    2,
                ),
                "created_at": customer.created_at.isoformat(),
            }
        )

    return {
        "data": result,
        "total": len(result),
    }