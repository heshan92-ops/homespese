from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models, crud, schemas

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create Superuser
        user = crud.get_user_by_username(db, "admin")
        if not user:
            print("Creating superuser 'admin'...")
            crud.create_user(
                db, 
                schemas.UserCreate(username="admin", password="adminpassword"), 
                is_superuser=True
            )
        else:
            print("Superuser 'admin' already exists.")
            
        # Create Default Categories
        default_categories = [
            "Alimentari", "Casa", "Trasporti", "Svago", "Salute", "Altro", "Stipendio", "Regalo"
        ]
        
        for cat_name in default_categories:
            db_cat = db.query(models.Category).filter(models.Category.name == cat_name).first()
            if not db_cat:
                print(f"Creating category '{cat_name}'...")
                crud.create_category(db, schemas.CategoryCreate(name=cat_name))
            else:
                print(f"Category '{cat_name}' already exists.")

    finally:
        db.close()

if __name__ == "__main__":
    init_db()
