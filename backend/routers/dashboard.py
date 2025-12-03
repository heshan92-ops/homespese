from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import crud, models
from database import get_db
from auth import get_current_active_user
from datetime import date

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
)

@router.get("/summary")
def get_summary(
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, description="Year (YYYY)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get income/expense summary for a specific month or current month if not specified."""
    today = date.today()
    month_num = month if month is not None else today.month
    year_num = year if year is not None else today.year
    
    result = crud.get_monthly_aggregates(db, year_num, month_num, family_id=current_user.family_id)
    result["period"] = {"month": month_num, "year": year_num}
    return result

@router.get("/chart-data")
def get_chart_data(
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, description="Year (YYYY)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get expenses by category for chart visualization."""
    today = date.today()
    month_num = month if month is not None else today.month
    year_num = year if year is not None else today.year
    
    expenses_by_category = crud.get_expenses_by_category(db, year_num, month_num, family_id=current_user.family_id)
    return {
        "expenses_by_category": [{"category": c, "amount": a} for c, a in expenses_by_category],
        "period": {"month": month_num, "year": year_num}
    }

@router.get("/budget-status")
def get_budget_status(
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, description="Year (YYYY)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get budget status (spent vs limit) for a specific month."""
    today = date.today()
    month_num = month if month is not None else today.month
    year_num = year if year is not None else today.year
    
    result = crud.get_budget_status(db, year_num, month_num, family_id=current_user.family_id)
    return {"budgets": result, "period": {"month": month_num, "year": year_num}}

@router.get("/available-years")
def get_available_years(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get list of years that have movement data."""
    years = crud.get_available_years(db, family_id=current_user.family_id)
    return {"years": years if years else [date.today().year]}
