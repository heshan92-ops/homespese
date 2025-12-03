from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import get_db
from auth import get_current_active_user

router = APIRouter(
    prefix="/api/budgets",
    tags=["budgets"],
)

@router.get("/", response_model=List[schemas.Budget])
def read_budgets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    budgets = crud.get_budgets(db, family_id=current_user.family_id)
    return budgets

@router.post("/", response_model=schemas.Budget)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return crud.create_or_update_budget(db=db, budget=budget, family_id=current_user.family_id)

@router.get("/{budget_id}", response_model=schemas.Budget)
def read_budget(budget_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_budget = crud.get_budget(db, budget_id=budget_id, family_id=current_user.family_id)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return db_budget

@router.delete("/{budget_id}", response_model=schemas.Budget)
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_budget = crud.delete_budget(db, budget_id=budget_id, family_id=current_user.family_id)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return db_budget
