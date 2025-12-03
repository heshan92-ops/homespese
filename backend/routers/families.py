from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import get_db
from auth import get_current_active_user

router = APIRouter(
    prefix="/api/families",
    tags=["families"],
)

@router.get("/", response_model=List[schemas.Family])
def read_families(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all families (superuser only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized - superuser access required")
    
    families = crud.get_families(db, skip=skip, limit=limit)
    return families

@router.post("/", response_model=schemas.Family)
def create_family(
    family: schemas.FamilyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create new family (superuser only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized - superuser access required")
    
    return crud.create_family(db=db, family=family)

@router.get("/{family_id}", response_model=schemas.Family)
def read_family(
    family_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get specific family details (superuser only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized - superuser access required")
    
    db_family = crud.get_family(db, family_id=family_id)
    if db_family is None:
        raise HTTPException(status_code=404, detail="Family not found")
    return db_family
