import random
from datetime import datetime, timedelta
from app.core.security import get_password_hash

from sqlalchemy import delete

from app.database.database import SessionLocal
from app.models import (
    User,
    Customer,
    Mechanic,
    Vehicle,
    Service,
    Booking,
)

random.seed(42)

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Rohan",
    "Rahul", "Karan", "Vikram", "Aman", "Nikhil",
    "Raj", "Ankit", "Mohit", "Sahil", "Varun",
    "Kabir", "Yash", "Harsh", "Manish", "Deepak",
    "Priya", "Ananya", "Isha", "Neha", "Pooja",
    "Kavya", "Riya", "Sneha", "Simran", "Meera",
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar",
    "Mehta", "Joshi", "Agarwal", "Jain", "Malhotra",
    "Choudhary", "Saini", "Yadav", "Bansal", "Kapoor",
]

CITIES = [
    "Jaipur",
    "Delhi",
    "Gurugram",
    "Noida",
    "Jodhpur",
    "Ajmer",
    "Kota",
]

VEHICLE_DATA = [
    ("Maruti", "Swift", "Hatchback"),
    ("Maruti", "Baleno", "Hatchback"),
    ("Hyundai", "Creta", "SUV"),
    ("Hyundai", "i20", "Hatchback"),
    ("Hyundai", "Venue", "SUV"),
    ("Tata", "Nexon", "SUV"),
    ("Tata", "Punch", "SUV"),
    ("Tata", "Altroz", "Hatchback"),
    ("Mahindra", "XUV700", "SUV"),
    ("Mahindra", "Scorpio", "SUV"),
    ("Toyota", "Fortuner", "SUV"),
    ("Toyota", "Innova", "MPV"),
    ("Honda", "City", "Sedan"),
    ("Honda", "Amaze", "Sedan"),
    ("Kia", "Seltos", "SUV"),
]

SERVICE_DATA = [
    ("Basic Car Service", "Periodic Maintenance", "Engine oil, filter and basic inspection", 1499, 90),
    ("Premium Car Service", "Periodic Maintenance", "Complete vehicle inspection and maintenance", 2999, 150),
    ("Oil Change", "Maintenance", "Engine oil and oil filter replacement", 999, 45),
    ("Brake Service", "Brakes", "Brake inspection and maintenance", 1799, 90),
    ("Brake Pad Replacement", "Brakes", "Replacement of front or rear brake pads", 2499, 120),
    ("AC Service", "AC & Cooling", "Air conditioning inspection and servicing", 1299, 90),
    ("AC Gas Refill", "AC & Cooling", "Air conditioner gas refill", 1899, 75),
    ("Battery Replacement", "Electrical", "Car battery replacement and testing", 5499, 45),
    ("Wheel Alignment", "Tyres & Wheels", "Four-wheel alignment service", 799, 45),
    ("Wheel Balancing", "Tyres & Wheels", "Wheel balancing service", 699, 45),
    ("Tyre Replacement", "Tyres & Wheels", "Tyre inspection and replacement", 4999, 90),
    ("Engine Diagnostics", "Diagnostics", "Computerized engine diagnostics", 1199, 60),
    ("Car Detailing", "Cleaning", "Interior and exterior detailing", 2499, 180),
    ("Denting & Painting", "Body Work", "Minor dent repair and painting", 3999, 240),
    ("Full Vehicle Inspection", "Inspection", "Complete multi-point vehicle inspection", 899, 60),
]

BOOKING_STATUSES = [
    "PENDING",
    "ASSIGNED",
    "MECHANIC_ON_THE_WAY",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
]

def random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def random_phone(index):
    return f"+91{9000000000 + index}"

def create_users(db):
    existing = db.query(User).filter(User.email == "admin@instantmechanic.com").first()
    if existing:
        return
    admin = User(
        name="Admin User",
        email="admin@instantmechanic.com",
        password_hash=get_password_hash("admin123"),
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()

def create_customers(db):
    customers = []
    for i in range(1, 61):
        customer = Customer(
            name=random_name(),
            email=f"customer{i}@example.com",
            phone=random_phone(i),
            city=random.choice(CITIES),
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 700)),
        )
        customers.append(customer)
    db.add_all(customers)
    db.commit()
    return customers

def create_mechanics(db):
    mechanics = []
    mechanic_statuses = ["AVAILABLE", "ON_JOB", "BUSY", "OFFLINE"]
    for i in range(1, 26):
        mechanic = Mechanic(
            name=random_name(),
            phone=random_phone(100 + i),
            status=random.choice(mechanic_statuses),
            jobs_completed=random.randint(20, 250),
            rating=round(random.uniform(4.1, 5.0), 1),
            city=random.choice(CITIES),
            joined_at=datetime.utcnow() - timedelta(days=random.randint(30, 900)),
        )
        mechanics.append(mechanic)
    db.add_all(mechanics)
    db.commit()
    return mechanics

def create_services(db):
    services = []
    for name, category, description, price, minutes in SERVICE_DATA:
        service = Service(
            name=name,
            category=category,
            description=description,
            base_price=price,
            estimated_minutes=minutes,
            is_active=True,
        )
        services.append(service)
    db.add_all(services)
    db.commit()
    return services

def create_vehicles(db, customers):
    vehicles = []
    for i in range(1, 121):
        customer = random.choice(customers)
        make, model, vehicle_type = random.choice(VEHICLE_DATA)
        vehicle = Vehicle(
            customer_id=customer.id,
            make=make,
            model=model,
            year=random.randint(2017, 2026),
            registration_number=f"RJ{random.randint(10, 99)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(1000, 9999)}",
            vehicle_type=vehicle_type,
        )
        vehicles.append(vehicle)
    db.add_all(vehicles)
    db.commit()
    return vehicles

def create_bookings(db, customers, mechanics, vehicles, services):
    bookings = []
    now = datetime.utcnow()

    for i in range(1, 601):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        vehicle = random.choice(customer_vehicles) if customer_vehicles else random.choice(vehicles)
        service = random.choice(services)
        
        status = random.choices(BOOKING_STATUSES, weights=[15, 12, 10, 10, 40, 13], k=1)[0]
        mechanic = random.choice(mechanics) if status not in ["PENDING", "CANCELLED"] else None

        days_offset = random.randint(-90, 15)
        scheduled_at = now + timedelta(
            days=days_offset,
            hours=random.randint(8, 20),
            minutes=random.choice([0, 15, 30, 45]),
        )

        amount = round(service.base_price * random.uniform(0.85, 1.25), 2)
        completed_at = None
        if status == "COMPLETED":
            completed_at = scheduled_at + timedelta(minutes=service.estimated_minutes + random.randint(10, 60))

        booking = Booking(
            booking_number=f"IM-2026-{i:05d}",
            customer_id=customer.id,
            mechanic_id=mechanic.id if mechanic else None,
            vehicle_id=vehicle.id,
            service_id=service.id,
            status=status,
            amount=amount,  # Fixed field keyword to match typical schema setups
            scheduled_at=scheduled_at,
            completed_at=completed_at,
            created_at=scheduled_at - timedelta(hours=random.randint(1, 24)),
        )
        bookings.append(booking)

    db.add_all(bookings)
    db.commit()
    return bookings

def clear_db(db):
    print("Clearing existing data...")
    db.execute(delete(Booking))
    db.execute(delete(Vehicle))
    db.execute(delete(Service))
    db.execute(delete(Mechanic))
    db.execute(delete(Customer))
    db.execute(delete(User))
    db.commit()

def main():
    db = SessionLocal()
    try:
        clear_db(db)
        
        print("Seeding database components...")
        create_users(db)
        print("✓ Created Admin User")
        
        customers = create_customers(db)
        print(f"✓ Created {len(customers)} Customers")
        
        mechanics = create_mechanics(db)
        print(f"✓ Created {len(mechanics)} Mechanics")
        
        services = create_services(db)
        print(f"✓ Created {len(services)} Services")
        
        vehicles = create_vehicles(db, customers)
        print(f"✓ Created {len(vehicles)} Vehicles")
        
        bookings = create_bookings(db, customers, mechanics, vehicles, services)
        print(f"✓ Created {len(bookings)} Bookings")
        
        print("\nDatabase seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"\nError seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    main()
