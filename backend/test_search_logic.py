from sqlalchemy import create_engine, Column, Integer, String, Float, Date, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import date
import os

# Setup temporary in-memory DB for testing logic
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Movement(Base):
    __tablename__ = "movements"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    date = Column(Date)
    amount = Column(Float)
    category = Column(String)
    description = Column(String, nullable=True)
    family_id = Column(Integer, default=1)

Base.metadata.create_all(bind=engine)

def test_search():
    db = SessionLocal()
    
    # Create test data
    m1 = Movement(type="EXPENSE", date=date.today(), amount=50.0, category="Spesa", description="Acquisto Esselunga", family_id=1)
    m2 = Movement(type="EXPENSE", date=date.today(), amount=20.0, category="Trasporti", description="Benzina auto", family_id=1)
    m3 = Movement(type="INCOME", date=date.today(), amount=1000.0, category="Stipendio", description="Stipendio Dicembre", family_id=1)
    
    db.add_all([m1, m2, m3])
    db.commit()
    
    print("Test Data Created:")
    print(f"1. {m1.category} - {m1.description} - {m1.amount}")
    print(f"2. {m2.category} - {m2.description} - {m2.amount}")
    print(f"3. {m3.category} - {m3.description} - {m3.amount}")
    print("-" * 30)
    
    # Test cases
    queries = ["esselunga", "benzina", "dicembre", "spesa", "50", "auto"]
    
    for q in queries:
        query_str = f"%{q.lower()}%"
        results = db.query(Movement).filter(
            Movement.family_id == 1,
            (
                Movement.category.ilike(query_str) |
                Movement.description.ilike(query_str) |
                Movement.amount.cast(String).ilike(query_str)
            )
        ).all()
        
        print(f"Searching for '{q}': Found {len(results)} results")
        for r in results:
            print(f"  - Match: {r.category} | {r.description} | {r.amount}")
            
    db.close()

if __name__ == "__main__":
    test_search()
