from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database.database import get_db
from app.models import Vehicle


router = APIRouter(
    prefix="/api/vehicles",
    tags=["Vehicles"],
)


def serialize_vehicle(vehicle: Vehicle):
    return {
        "id": vehicle.id,
        "customer_id": vehicle.customer_id,
        "customer": (
            vehicle.customer.name
            if vehicle.customer
            else None
        ),
        "make": vehicle.make,
        "model": vehicle.model,
        "year": vehicle.year,
        "registration_number": vehicle.registration_number,
        "vehicle_type": vehicle.vehicle_type,
        "created_at": (
            vehicle.created_at.isoformat()
            if hasattr(vehicle, "created_at")
            and vehicle.created_at
            else None
        ),
    }


def get_vehicle_with_customer(
    vehicle_id: int,
    db: Session,
):
    return (
        db.query(Vehicle)
        .options(
            joinedload(Vehicle.customer),
        )
        .filter(
            Vehicle.id == vehicle_id
        )
        .first()
    )


@router.get("")
def get_vehicles(
    search: Optional[str] = Query(None),
    page: int = Query(
        1,
        ge=1,
    ),
    limit: int = Query(
        50,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Vehicle)
        .options(
            joinedload(Vehicle.customer),
        )
    )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            (
                Vehicle.registration_number.ilike(
                    search_value
                )
                | Vehicle.make.ilike(
                    search_value
                )
                | Vehicle.model.ilike(
                    search_value
                )
                | Vehicle.vehicle_type.ilike(
                    search_value
                )
            )
        )

    total = query.count()

    vehicles = (
        query
        .order_by(
            Vehicle.id.desc()
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )

    return {
        "data": [
            serialize_vehicle(vehicle)
            for vehicle in vehicles
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (
                (total + limit - 1) // limit
            ),
        },
    }


@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
):
    vehicle = get_vehicle_with_customer(
        vehicle_id,
        db,
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found",
        )

    return serialize_vehicle(vehicle)