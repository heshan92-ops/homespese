import sqlite3

def add_columns():
    conn = sqlite3.connect('spesecasa.db')
    cursor = conn.cursor()
    
    try:
        print("Adding first_name column...")
        cursor.execute("ALTER TABLE users ADD COLUMN first_name VARCHAR")
        print("first_name column added.")
    except sqlite3.OperationalError as e:
        print(f"Error adding first_name (might already exist): {e}")

    try:
        print("Adding last_name column...")
        cursor.execute("ALTER TABLE users ADD COLUMN last_name VARCHAR")
        print("last_name column added.")
    except sqlite3.OperationalError as e:
        print(f"Error adding last_name (might already exist): {e}")

    conn.commit()
    conn.close()
    print("Database schema update completed.")

if __name__ == "__main__":
    add_columns()
