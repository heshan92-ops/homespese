from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
import crud, models
from database import get_db
from auth import get_current_active_user

router = APIRouter(
    prefix="/api/search",
    tags=["search"],
)

@router.get("/")
def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Global search across movements, categories, and recurring expenses.
    Returns results grouped by type.
    """
    family_id = current_user.family_id
    query = f"%{q.lower()}%"
    
    # Search movements (by category, description, amount)
    movements = db.query(models.Movement).filter(
        models.Movement.family_id == family_id,
        (
            models.Movement.category.ilike(query) |
            models.Movement.description.ilike(query) |
            models.Movement.amount.cast(db.String).ilike(query)
        )
    ).order_by(models.Movement.date.desc()).limit(20).all()
    
    # Search categories
    categories = db.query(models.Category).filter(
        models.Category.family_id == family_id,
        models.Category.name.ilike(query)
    ).limit(10).all()
    
    # Search recurring expenses
    recurring = db.query(models.RecurringExpense).filter(
        models.RecurringExpense.family_id == family_id,
        models.RecurringExpense.is_active == True,
        (
            models.RecurringExpense.name.ilike(query) |
            models.RecurringExpense.category.ilike(query) |
            models.RecurringExpense.description.ilike(query)
        )
    ).limit(10).all()
    
    return {
        "query": q,
        "results": {
            "movements": [
                {
                    "id": m.id,
                    "type": m.type,
                    "date": str(m.date),
                    "amount": m.amount,
                    "category": m.category,
                    "description": m.description
                } for m in movements
            ],
            "categories": [
                {
                    "id": c.id,
                    "name": c.name,
                    "icon": c.icon,
                    "color": c.color
                } for c in categories
            ],
            "recurring_expenses": [
                {
                    "id": r.id,
                    "name": r.name,
                    "amount": r.amount,
                    "category": r.category,
                    "description": r.description
                } for r in recurring
            ]
        },
        "total_results": len(movements) + len(categories) + len(recurring)
    }
