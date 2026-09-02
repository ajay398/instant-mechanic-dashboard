from getpass import getpass

from app.database.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash


def main():
    db = SessionLocal()

    try:
        current_email = input("Current admin email: ").strip()

        user = (
            db.query(User)
            .filter(User.email == current_email)
            .first()
        )

        if not user:
            print("❌ Admin/user not found.")
            return

        new_name = input("New admin name: ").strip()
        new_email = input("New admin email: ").strip()

        new_password = getpass("New password: ")
        confirm_password = getpass("Confirm new password: ")

        if not new_name:
            print("❌ Name cannot be empty.")
            return

        if not new_email:
            print("❌ Email cannot be empty.")
            return

        if not new_password:
            print("❌ Password cannot be empty.")
            return

        if new_password != confirm_password:
            print("❌ Passwords do not match.")
            return

        existing_email = (
            db.query(User)
            .filter(
                User.email == new_email,
                User.id != user.id
            )
            .first()
        )

        if existing_email:
            print("❌ That email is already being used.")
            return

        user.name = new_name
        user.email = new_email
        user.password_hash = get_password_hash(new_password)
        user.role = "admin"
        user.is_active = True

        db.commit()

        print()
        print("✅ Admin account updated successfully!")
        print(f"Name: {user.name}")
        print(f"Email: {user.email}")
        print("Password: updated")
        print()
        print("You can now log in using the new credentials.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    main()