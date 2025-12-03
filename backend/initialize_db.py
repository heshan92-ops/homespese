from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Family, User
from hashing import get_password_hash

def initialize_database():
    """Initialize database with Family and Admin user"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")
    
    db = SessionLocal()
    try:
        # Check if family exists
        family = db.query(Family).filter(Family.name == "Famiglia Rossi").first()
        if not family:
            print("Creating default family...")
            family = Family(name="Famiglia Rossi")
            db.add(family)
            db.commit()
            db.refresh(family)
            print(f"Created family: {family.name} with ID: {family.id}")
        else:
            print(f"Family already exists: {family.name} with ID: {family.id}")
        
        # Check if admin user exists
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print("Admin user found. Updating...")
            user.hashed_password = get_password_hash("Admin123!")
            user.first_name = "Mario"
            user.last_name = "Rossi"
            user.family_id = family.id
            db.commit()
            print(f"Admin password reset to 'Admin123!', name set to 'Mario Rossi', assigned to family ID: {family.id}")
        else:
            print("Creating new admin user...")
            user = User(
                username="admin",
                email="admin@example.com",
                first_name="Mario",
                last_name="Rossi",
                hashed_password=get_password_hash("Admin123!"),
                is_superuser=True,
                is_active=True,
                family_id=family.id
            )
            db.add(user)
            db.commit()
            print(f"Admin user created with password 'Admin123!', name 'Mario Rossi', assigned to family ID: {family.id}")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    initialize_database()
