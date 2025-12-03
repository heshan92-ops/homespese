from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import get_db
from auth import get_current_active_user

router = APIRouter(
    prefix="/api/recurring",
    tags=["recurring"],
)

@router.get("/", response_model=List[schemas.RecurringExpense])
def read_recurring_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return crud.get_recurring_expenses(db, family_id=current_user.family_id, user_id=current_user.id)

@router.post("/", response_model=schemas.RecurringExpense)
def create_recurring_expense(
    recurring: schemas.RecurringExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create recurring expense and auto-generate movements"""
    return crud.create_recurring_expense(db=db, recurring=recurring, user_id=current_user.id, family_id=current_user.family_id)

@router.put("/{recurring_id}", response_model=schemas.RecurringExpense)
def update_recurring_expense(
    recurring_id: int,
    recurring: schemas.RecurringExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update recurring expense and regenerate unconfirmed movements"""
    db_recurring = crud.update_recurring_expense(db, recurring_id=recurring_id, recurring=recurring, family_id=current_user.family_id)
    if db_recurring is None:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    return db_recurring

@router.delete("/{recurring_id}", response_model=schemas.RecurringExpense)
def delete_recurring_expense(
    recurring_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Soft delete recurring expense and remove unconfirmed movements"""
    db_recurring = crud.delete_recurring_expense(db, recurring_id=recurring_id, family_id=current_user.family_id)
    if db_recurring is None:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    return db_recurring

@router.post("/{movement_id}/confirm", response_model=schemas.Movement)
def confirm_recurring_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Confirm a recurring movement (mark as paid)"""
    movement = crud.confirm_recurring_movement(db, movement_id=movement_id, family_id=current_user.family_id)
    if not movement:
        raise HTTPException(status_code=404, detail="Movement not found or not a recurring movement")
    return movement
