import sqlite3
from datetime import datetime

def migrate():
    conn = sqlite3.connect('spesecasa.db')
    cursor = conn.cursor()
    
    print("Starting migration to Multi-tenancy...")

    # 1. Create families table
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS families (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR UNIQUE,
                created_at DATETIME
            )
        """)
        print("Created 'families' table.")
    except Exception as e:
        print(f"Error creating families table: {e}")

    # 2. Create Default Family
    try:
        cursor.execute("SELECT id FROM families WHERE name = 'Famiglia Rossi'")
        existing = cursor.fetchone()
        if not existing:
            cursor.execute("INSERT INTO families (name, created_at) VALUES (?, ?)", ('Famiglia Rossi', datetime.utcnow()))
            family_id = cursor.lastrowid
            print(f"Created default family 'Famiglia Rossi' with ID {family_id}")
        else:
            family_id = existing[0]
            print(f"Default family 'Famiglia Rossi' already exists with ID {family_id}")
    except Exception as e:
        print(f"Error creating default family: {e}")
        return

    # 3. Add family_id column to tables and populate it
    tables = ['users', 'movements', 'budgets', 'categories', 'recurring_expenses']
    
    for table in tables:
        try:
            # Check if column exists
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [info[1] for info in cursor.fetchall()]
            
            if 'family_id' not in columns:
                print(f"Adding family_id to {table}...")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN family_id INTEGER REFERENCES families(id)")
                
                # Populate with default family_id
                print(f"Populating {table} with family_id={family_id}...")
                cursor.execute(f"UPDATE {table} SET family_id = ?", (family_id,))
                print(f"Updated {table}.")
            else:
                print(f"family_id already exists in {table}.")
                
        except Exception as e:
            print(f"Error updating {table}: {e}")

    conn.commit()
    conn.close()
    print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()
