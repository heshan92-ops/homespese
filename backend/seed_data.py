"""
Seed script per popolare il database con dati fittizi
Esegui con: docker-compose exec backend python seed_data.py
"""
import sys
from datetime import date, timedelta
import random
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from hashing import get_password_hash

def clear_data(db: Session):
    """Opzionale: pulisce dati esistenti (tranne utenti)"""
    db.query(models.Movement).delete()
    db.query(models.Budget).delete()
    db.query(models.Category).delete()
    db.commit()
    print("✓ Dati esistenti eliminati (utenti preservati)")

def create_categories(db: Session):
    """Crea categorie standard"""
    categories_data = [
        {"name": "Alimentari", "icon": "🛒", "color": "#10b981"},
        {"name": "Trasporti", "icon": "🚗", "color": "#3b82f6"},
        {"name": "Bollette", "icon": "⚡", "color": "#ef4444"},
        {"name": "Svago", "icon": "🎮", "color": "#8b5cf6"},
        {"name": "Salute", "icon": "💊", "color": "#ec4899"},
        {"name": "Casa", "icon": "🏠", "color": "#f59e0b"},
        {"name": "Abbigliamento", "icon": "👕", "color": "#6366f1"},
        {"name": "Stipendio", "icon": "💰", "color": "#10b981"},
        {"name": "Freelance", "icon": "💼", "color": "#06b6d4"},
    ]
    
    for cat_data in categories_data:
        existing = db.query(models.Category).filter(models.Category.name == cat_data["name"]).first()
        if not existing:
            category = models.Category(**cat_data)
            db.add(category)
    
    db.commit()
    print(f"✓ {len(categories_data)} categorie create")

def create_budgets(db: Session):
    """Crea budget mensili per alcune categorie"""
    budgets_data = [
        {"category": "Alimentari", "amount": 500.00},
        {"category": "Trasporti", "amount": 200.00},
        {"category": "Svago", "amount": 150.00},
        {"category": "Bollette", "amount": 250.00},
        {"category": "Casa", "amount": 800.00},
    ]
    
    for budget_data in budgets_data:
        existing = db.query(models.Budget).filter(models.Budget.category == budget_data["category"]).first()
        if not existing:
            budget = models.Budget(**budget_data)
            db.add(budget)
    
    db.commit()
    print(f"✓ {len(budgets_data)} budget creati")

def create_movements(db: Session):
    """Crea movimenti distribuiti su 5 mesi (Agosto-Dicembre 2024)"""
    
    # Template per movimenti mensili realistici
    monthly_expenses = {
        "Alimentari": [(50, 150), (30, 80), (40, 120), (60, 100)],  # Spesa settimanale
        "Trasporti": [(40, 60), (30, 50)],  # Benzina, mezzi
        "Bollette": [(80, 120), (50, 80), (40, 70)],  # Luce, gas, internet
        "Svago": [(20, 50), (30, 80), (15, 40)],  # Cinema, ristorante, hobby
        "Salute": [(25, 60)],  # Farmacia
        "Casa": [(600, 800)],  # Affitto/mutuo
        "Abbigliamento": [(30, 100)],  # Vestiti occasionali
    }
    
    monthly_income = {
        "Stipendio": [(1800, 2200)],  # Stipendio mensile
        "Freelance": [(200, 500), (300, 600)],  # Progetti extra (saltuari)
    }
    
    movements_created = 0
    
    # Genera movimenti per 5 mesi: Agosto-Dicembre 2024
    for month in range(8, 13):  # 8=Agosto, 12=Dicembre
        year = 2024
        days_in_month = 31 if month in [8, 10, 12] else 30
        
        # ENTRATE
        for category, ranges in monthly_income.items():
            for amount_range in ranges:
                # Non tutte le entrate ogni mese (es. freelance saltuario)
                if category == "Freelance" and random.random() > 0.6:
                    continue
                
                amount = round(random.uniform(*amount_range), 2)
                day = random.randint(1, min(28, days_in_month))  # Evita giorni invalidi
                movement_date = date(year, month, day)
                
                movement = models.Movement(
                    type="INCOME",
                    amount=amount,
                    category=category,
                    date=movement_date,
                    description=f"{category} - {movement_date.strftime('%B %Y')}"
                )
                db.add(movement)
                movements_created += 1
        
        # SPESE
        for category, ranges in monthly_expenses.items():
            for amount_range in ranges:
                # Alcune spese non ogni mese (es. abbigliamento)
                if category in ["Abbigliamento", "Salute"] and random.random() > 0.5:
                    continue
                
                amount = round(random.uniform(*amount_range), 2)
                day = random.randint(1, min(28, days_in_month))
                movement_date = date(year, month, day)
                
                descriptions = {
                    "Alimentari": ["Spesa supermercato", "Mercato frutta", "Discount", "Alimentari vari"],
                    "Trasporti": ["Benzina", "Biglietto treno", "Parcheggio", "Taxi"],
                    "Bollette": ["Bolletta luce", "Bolletta gas", "Internet fibra", "Acqua"],
                    "Svago": ["Cinema", "Ristorante", "Bar", "Hobby", "Netflix"],
                    "Salute": ["Farmacia", "Visita medica", "Integratori"],
                    "Casa": ["Affitto", "Condominio", "Riparazione"],
                    "Abbigliamento": ["Vestiti", "Scarpe", "Accessori"],
                }
                
                desc = random.choice(descriptions.get(category, [category]))
                
                movement = models.Movement(
                    type="EXPENSE",
                    amount=amount,
                    category=category,
                    date=movement_date,
                    description=desc
                )
                db.add(movement)
                movements_created += 1
    
    db.commit()
    print(f"✓ {movements_created} movimenti creati (Agosto-Dicembre 2024)")

def main():
    print("🌱 Inizializzazione seed dati...")
    db = SessionLocal()
    
    try:
        # Chiedi conferma se vuoi pulire dati esistenti
        if len(sys.argv) > 1 and sys.argv[1] == "--clear":
            clear_data(db)
        
        create_categories(db)
        create_budgets(db)
        create_movements(db)
        
        print("\n✅ Seed completato con successo!")
        print("\nRiepilogo:")
        print(f"  - Categorie: {db.query(models.Category).count()}")
        print(f"  - Budget: {db.query(models.Budget).count()}")
        print(f"  - Movimenti: {db.query(models.Movement).count()}")
        
        # Mostra statistiche per mese
        print("\nMovimenti per mese:")
        for month in range(8, 13):
            count = db.query(models.Movement).filter(
                models.Movement.date >= date(2024, month, 1),
                models.Movement.date < date(2024, month + 1 if month < 12 else 2025, 1 if month < 12 else 1, 1)
            ).count()
            month_names = ["", "", "", "", "", "", "", "", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
            print(f"  - {month_names[month]} 2024: {count}")
        
    except Exception as e:
        print(f"❌ Errore: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
