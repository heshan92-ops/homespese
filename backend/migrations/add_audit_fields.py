"""
Migration script to add audit tracking fields to movements table.
This adds: created_by_user_id, last_modified_by_user_id, last_modified_at
"""

from sqlalchemy import create_engine, text
import os

# Get database URL from environment or use default SQLite path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)
    
DB_PATH = os.getenv("DB_PATH", os.path.join(DATA_DIR, "spesecasa.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

def run_migration():
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    with engine.connect() as conn:
        print(f"Starting migration on {DATABASE_URL}...")
        
        # Step 1: Add new columns
        # SQLite supports ADD COLUMN but with limitations. We add them one by one.
        print("Step 1: Adding columns...")
        try:
            # Check if columns exist first to avoid errors
            # In SQLite we can check pragma table_info
            result = conn.execute(text("PRAGMA table_info(movements)"))
            columns = [row[1] for row in result.fetchall()]
            
            if 'created_by_user_id' not in columns:
                conn.execute(text("ALTER TABLE movements ADD COLUMN created_by_user_id INTEGER REFERENCES users(id)"))
                print("✓ Added created_by_user_id")
            
            if 'last_modified_by_user_id' not in columns:
                conn.execute(text("ALTER TABLE movements ADD COLUMN last_modified_by_user_id INTEGER REFERENCES users(id)"))
                print("✓ Added last_modified_by_user_id")
                
            if 'last_modified_at' not in columns:
                conn.execute(text("ALTER TABLE movements ADD COLUMN last_modified_at DATETIME"))
                print("✓ Added last_modified_at")
                
            conn.commit()
            print("✓ Columns check/add completed")
        except Exception as e:
            print(f"Error adding columns: {e}")
            conn.rollback()
        
        # Step 2: Backfill data for existing movements
        print("Step 2: Backfilling data for existing movements...")
        try:
            # Set created_by to user_id for existing records
            result = conn.execute(text("""
                UPDATE movements 
                SET created_by_user_id = user_id 
                WHERE created_by_user_id IS NULL AND user_id IS NOT NULL;
            """))
            print(f"✓ Updated created_by for {result.rowcount} movements")
            
            # Set last_modified_by to user_id for existing records
            result = conn.execute(text("""
                UPDATE movements 
                SET last_modified_by_user_id = user_id 
                WHERE last_modified_by_user_id IS NULL AND user_id IS NOT NULL;
            """))
            print(f"✓ Updated last_modified_by for {result.rowcount} movements")
            
            # Set last_modified_at to created_at for existing records
            result = conn.execute(text("""
                UPDATE movements 
                SET last_modified_at = created_at 
                WHERE last_modified_at IS NULL;
            """))
            print(f"✓ Updated last_modified_at for {result.rowcount} movements")
            
            conn.commit()
            print("✓ Data backfill completed successfully")
        except Exception as e:
            print(f"Error during backfill: {e}")
            conn.rollback()
            raise
        
        print("\n✅ Migration completed successfully!")
        print("Audit tracking is now enabled for all movements.")

if __name__ == "__main__":
    run_migration()
