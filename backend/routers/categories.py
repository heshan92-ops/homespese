from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, models, auth
from database import get_db

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"],
)

@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    categories = crud.get_categories(db, family_id=current_user.family_id)
    return categories

@router.post("/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    return crud.create_category(db=db, category=category, family_id=current_user.family_id)

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_category = crud.update_category(db, category_id=category_id, category=category, family_id=current_user.family_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/{category_id}", response_model=schemas.Category)
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_category = crud.delete_category(db, category_id=category_id, family_id=current_user.family_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category
