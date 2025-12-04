"""
Script per diagnosticare e fixare i movimenti invisibili dopo il deploy.
Verifica e ripara family_id mancanti.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

# Setup database connection
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.getenv("DB_PATH", os.path.join(DATA_DIR, "spesecasa.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def diagnose_and_fix():
    db = SessionLocal()
    
    print("=" * 60)
    print("DIAGNOSI MOVIMENTI INVISIBILI")
    print("=" * 60)
    
    # 1. Conta tutti i movimenti
    result = db.execute(text("SELECT COUNT(*) FROM movements"))
    total_movements = result.fetchone()[0]
    print(f"\n📊 Totale movimenti nel database: {total_movements}")
    
    # 2. Conta movimenti senza family_id
    result = db.execute(text("SELECT COUNT(*) FROM movements WHERE family_id IS NULL"))
    null_family = result.fetchone()[0]
    print(f"⚠️  Movimenti senza family_id: {null_family}")
    
    # 3. Conta movimenti per ogni family_id
    result = db.execute(text("SELECT family_id, COUNT(*) FROM movements GROUP BY family_id"))
    print(f"\n📋 Movimenti per family:")
    for row in result:
        family_id = row[0] if row[0] is not None else "NULL"
        count = row[1]
        print(f"   Family {family_id}: {count} movimenti")
    
    # 4. Verifica utenti e le loro family
    result = db.execute(text("SELECT id, username, family_id FROM users"))
    print(f"\n👥 Utenti nel sistema:")
    users = result.fetchall()
    for user in users:
        user_id, username, family_id = user
        print(f"   User {user_id} ({username}): family_id = {family_id}")
    
    # 5. FIX: Assegna family_id ai movimenti che non ce l'hanno
    if null_family > 0:
        print(f"\n🔧 FIXING: Assegno family_id ai {null_family} movimenti...")
        
        # Strategia: usa il family_id del primo utente (admin di solito)
        if users:
            default_family_id = users[0][2]  # family_id del primo utente
            if default_family_id is None:
                print("❌ ERRORE: Anche l'utente admin non ha family_id!")
                print("   Devo prima creare una famiglia e assegnarla agli utenti.")
                
                # Crea famiglia di default
                db.execute(text("INSERT INTO families (name, created_at) VALUES ('Famiglia Principale', datetime('now'))"))
                db.commit()
                result = db.execute(text("SELECT id FROM families ORDER BY id DESC LIMIT 1"))
                default_family_id = result.fetchone()[0]
                print(f"✅ Creata famiglia di default (ID: {default_family_id})")
                
                # Assegna famiglia a tutti gli utenti
                db.execute(text(f"UPDATE users SET family_id = {default_family_id}"))
                db.commit()
                print(f"✅ Assegnata famiglia a tutti gli utenti")
            
            # Assegna family_id ai movimenti
            result = db.execute(text(f"""
                UPDATE movements 
                SET family_id = {default_family_id}
                WHERE family_id IS NULL
            """))
            db.commit()
            print(f"✅ Assegnato family_id={default_family_id} a {result.rowcount} movimenti")
            
            # Verifica finale
            result = db.execute(text("SELECT COUNT(*) FROM movements WHERE family_id IS NULL"))
            remaining = result.fetchone()[0]
            print(f"\n📊 Movimenti senza family_id rimanenti: {remaining}")
    
    # 6. Verifica colonne audit
    result = db.execute(text("PRAGMA table_info(movements)"))
    columns = [row[1] for row in result.fetchall()]
    print(f"\n🔍 Colonne nella tabella movements:")
    audit_cols = ['created_by_user_id', 'last_modified_by_user_id', 'last_modified_at']
    for col in audit_cols:
        status = "✅" if col in columns else "❌"
        print(f"   {status} {col}")
    
    db.close()
    print("\n" + "=" * 60)
    print("✅ DIAGNOSI E FIX COMPLETATI")
    print("=" * 60)
    print("\nRiavvia l'applicazione e verifica che i movimenti siano visibili.")

if __name__ == "__main__":
    diagnose_and_fix()
