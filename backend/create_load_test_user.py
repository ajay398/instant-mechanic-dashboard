from getpass import getpass

from app.database.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash


EMAIL = "loadtest@instantmechanic.local"


def main():
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == EMAIL)
            .first()
        )

        if existing_user:
            print("Load-test user already exists.")
            print(f"Email: {EMAIL}")
            return

        password = getpass("Enter load-test password: ")
        confirm_password = getpass("Confirm load-test password: ")

        if password != confirm_password:
            print("❌ Passwords do not match.")
            return

        if not password:
            print("❌ Password cannot be empty.")
            return

        user = User(
            name="Load Test User",
            email=EMAIL,
            password_hash=get_password_hash(password),
            role="admin",
            is_active=True,
        )

        db.add(user)
        db.commit()

        print()
        print("✅ Load-test user created successfully!")
        print(f"Email: {EMAIL}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    main()