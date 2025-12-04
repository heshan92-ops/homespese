from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, models, schemas
from database import get_db
from auth import get_current_active_user

router = APIRouter(
    prefix="/api/movements",
    tags=["movements"],
)

@router.get("/", response_model=List[schemas.Movement])
def read_movements(
    skip: int = 0, 
    limit: int = 100, 
    month: Optional[int] = None, 
    year: Optional[int] = None,
    include_planned: bool = True,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get movements, optionally filtered by month, year, and planned status."""
    movements = crud.get_movements(db, family_id=current_user.family_id, skip=skip, limit=limit, month=month, year=year, include_planned=include_planned)
    return movements

@router.get("/years", response_model=List[int])
def get_available_years(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return crud.get_available_years(db, family_id=current_user.family_id)

@router.post("/", response_model=schemas.Movement)
def create_movement(movement: schemas.MovementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return crud.create_movement(db=db, movement=movement, user_id=current_user.id, family_id=current_user.family_id)

@router.put("/{movement_id}", response_model=schemas.Movement)
def update_movement(movement_id: int, movement: schemas.MovementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_movement = crud.update_movement(db, movement_id=movement_id, movement=movement, family_id=current_user.family_id, user_id=current_user.id)
    if db_movement is None:
        raise HTTPException(status_code=404, detail="Movement not found")
    return db_movement

@router.delete("/{movement_id}", response_model=schemas.Movement)
def delete_movement(movement_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_movement = crud.delete_movement(db, movement_id=movement_id, family_id=current_user.family_id)
    if db_movement is None:
        raise HTTPException(status_code=404, detail="Movement not found")
    return db_movement
