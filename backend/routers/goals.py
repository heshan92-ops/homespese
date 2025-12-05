from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import get_db
from auth import get_current_active_user

router = APIRouter(
    prefix="/api/goals",
    tags=["goals"],
)

@router.get("/", response_model=List[schemas.SavingsGoal])
def read_goals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return crud.get_savings_goals(db, family_id=current_user.family_id)

@router.post("/", response_model=schemas.SavingsGoal)
def create_goal(
    goal: schemas.SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return crud.create_savings_goal(db, goal=goal, family_id=current_user.family_id)

@router.put("/{goal_id}", response_model=schemas.SavingsGoal)
def update_goal(
    goal_id: int,
    goal: schemas.SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_goal = crud.update_savings_goal(db, goal_id=goal_id, goal_update=goal, family_id=current_user.family_id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    crud.delete_savings_goal(db, goal_id=goal_id, family_id=current_user.family_id)
    return {"ok": True}
