from sqlalchemy import create_engine, inspect
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://spesecasa_user:spesecasa_password@db:5432/spesecasa_db")

def check_schema():
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('movements')]
        print(f"Columns in 'movements' table: {columns}")
        
        required_columns = ['created_by_user_id', 'last_modified_by_user_id', 'last_modified_at']
        missing = [col for col in required_columns if col not in columns]
        
        if missing:
            print(f"MISSING COLUMNS: {missing}")
        else:
            print("All audit columns are present.")
            
    except Exception as e:
        print(f"Error checking schema: {e}")

if __name__ == "__main__":
    check_schema()
