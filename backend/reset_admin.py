from sqlalchemy.orm import Session
from database import SessionLocal
import models
from hashing import get_password_hash

def reset_admin_password():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == "admin").first()
        if user:
            print("Admin user found. Resetting password and updating name...")
            user.hashed_password = get_password_hash("admin")
            user.first_name = "Mario"
            user.last_name = "Rossi"
            db.commit()
            print("Admin password reset to 'admin' and name set to 'Mario Rossi'")
        else:
            print("Admin user not found. Creating new admin user...")
            user = models.User(
                username="admin",
                email="admin@example.com",
                first_name="Mario",
                last_name="Rossi",
                hashed_password=get_password_hash("admin"),
                is_superuser=True,
                is_active=True
            )
            db.add(user)
            db.commit()
            print("Admin user created with password 'admin' and name 'Mario Rossi'")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
