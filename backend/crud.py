from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import models, schemas
from datetime import datetime
from hashing import get_password_hash

# Users
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate, is_superuser: bool = False):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        is_superuser=is_superuser,
        family_id=user.family_id # NEW
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100, family_id: int = None): # NEW family_id
    query = db.query(models.User)
    if family_id:
        query = query.filter(models.User.family_id == family_id)
    return query.offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    if user_update.username is not None:
        db_user.username = user_update.username
    if user_update.email is not None:
        db_user.email = user_update.email
    if user_update.first_name is not None:
        db_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        db_user.last_name = user_update.last_name
    if user_update.password is not None:
        db_user.hashed_password = get_password_hash(user_update.password)
    if user_update.is_active is not None:
        db_user.is_active = user_update.is_active
    if user_update.is_superuser is not None:
        db_user.is_superuser = user_update.is_superuser
    if user_update.family_id is not None: # NEW
        db_user.family_id = user_update.family_id
        
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# Families (NEW)
def create_family(db: Session, family: schemas.FamilyCreate):
    db_family = models.Family(name=family.name)
    db.add(db_family)
    db.commit()
    db.refresh(db_family)
    return db_family

def get_families(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Family).offset(skip).limit(limit).all()

def get_family(db: Session, family_id: int):
    return db.query(models.Family).filter(models.Family.id == family_id).first()

# Movements
def get_movements(db: Session, family_id: int, skip: int = 0, limit: int = 100, 
                  month: int = None, year: int = None, 
                  start_date: date = None, end_date: date = None,
                  category: str = None, type: str = None,
                  include_planned: bool = True): # NEW family_id
    query = db.query(models.Movement).filter(models.Movement.family_id == family_id) # Filter by family
    
    # Date filters
    if start_date:
        query = query.filter(models.Movement.date >= start_date)
    if end_date:
        query = query.filter(models.Movement.date <= end_date)
        
    # Month/Year filter (legacy but useful)
    if month is not None and year is not None:
        query = query.filter(
            extract('year', models.Movement.date) == year,
            extract('month', models.Movement.date) == month
        )
        
    # Category filter
    if category:
        query = query.filter(models.Movement.category == category)
        
    # Type filter
    if type:
        query = query.filter(models.Movement.type == type)
        
    if not include_planned:
        query = query.filter(models.Movement.is_planned == False)
        
    return query.order_by(models.Movement.date.desc(), models.Movement.id.desc()).offset(skip).limit(limit).all()

def get_available_years(db: Session, family_id: int): # NEW family_id
    """Get list of years that have movements data, plus current year"""
    from datetime import date
    years_with_data = db.query(extract('year', models.Movement.date).label('year')).filter(models.Movement.family_id == family_id).distinct().all() # Filter by family
    years = {int(year[0]) for year in years_with_data}
    years.add(date.today().year)  # Always include current year
    return sorted(list(years))

def create_movement(db: Session, movement: schemas.MovementCreate, user_id: int, family_id: int): # NEW family_id
    from datetime import datetime
    movement_dict = movement.dict()
    movement_dict['user_id'] = user_id
    movement_dict['family_id'] = family_id
    movement_dict['created_by_user_id'] = user_id
    movement_dict['last_modified_by_user_id'] = user_id
    movement_dict['last_modified_at'] = datetime.utcnow()
    
    db_movement = models.Movement(**movement_dict)
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

def update_movement(db: Session, movement_id: int, movement: schemas.MovementCreate, family_id: int, user_id: int = None): # NEW user_id
    from datetime import datetime
    db_movement = db.query(models.Movement).filter(models.Movement.id == movement_id, models.Movement.family_id == family_id).first() # Filter by family
    if db_movement:
        db_movement.type = movement.type
        db_movement.amount = movement.amount
        db_movement.category = movement.category
        db_movement.date = movement.date
        db_movement.description = movement.description
        db_movement.is_planned = movement.is_planned
        db_movement.from_recurring_id = movement.from_recurring_id
        db_movement.is_confirmed = movement.is_confirmed
        
        # Update audit fields
        if user_id:
            db_movement.last_modified_by_user_id = user_id
            db_movement.last_modified_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_movement)
    return db_movement

def delete_movement(db: Session, movement_id: int, family_id: int): # NEW family_id
    db_movement = db.query(models.Movement).filter(models.Movement.id == movement_id, models.Movement.family_id == family_id).first() # Filter by family
    if db_movement:
        db.delete(db_movement)
        db.commit()
    return db_movement

# Budgets
def get_budgets(db: Session, family_id: int): # NEW family_id
    return db.query(models.Budget).filter(models.Budget.family_id == family_id).all() # Filter by family

def create_or_update_budget(db: Session, budget: schemas.BudgetCreate, family_id: int): # NEW family_id
    import json
    db_budget = db.query(models.Budget).filter(models.Budget.category == budget.category, models.Budget.family_id == family_id).first() # Filter by family
    if db_budget:
        db_budget.amount = budget.amount
        db_budget.applicable_months = json.dumps(budget.applicable_months) if budget.applicable_months else None
    else:
        budget_dict = budget.dict()
        budget_dict['applicable_months'] = json.dumps(budget.applicable_months) if budget.applicable_months else None
        budget_dict['family_id'] = family_id # Set family_id
        db_budget = models.Budget(**budget_dict)
        db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

# Dashboard Aggregates
def get_monthly_aggregates(db: Session, year: int, month: int, family_id: int): # NEW family_id
    income = db.query(func.sum(models.Movement.amount)).filter(
        models.Movement.family_id == family_id, # Filter by family
        models.Movement.type == "INCOME",
        extract('year', models.Movement.date) == year,
        extract('month', models.Movement.date) == month
    ).scalar() or 0.0

    expense = db.query(func.sum(models.Movement.amount)).filter(
        models.Movement.family_id == family_id, # Filter by family
        models.Movement.type == "EXPENSE",
        extract('year', models.Movement.date) == year,
        extract('month', models.Movement.date) == month
    ).scalar() or 0.0

    # Calculate TOTAL balance (All time up to today)
    from datetime import date as dt_date
    today = dt_date.today()
    
    total_income = db.query(func.sum(models.Movement.amount)).filter(
        models.Movement.family_id == family_id,
        models.Movement.type == "INCOME",
        models.Movement.date <= today  # NEW: Only movements up to today
    ).scalar() or 0.0

    total_expense = db.query(func.sum(models.Movement.amount)).filter(
        models.Movement.family_id == family_id,
        models.Movement.type == "EXPENSE",
        models.Movement.date <= today  # NEW: Only movements up to today
    ).scalar() or 0.0

    return {"income": income, "expense": expense, "balance": total_income - total_expense}

def get_expenses_by_category(db: Session, year: int, month: int, family_id: int): # NEW family_id
    return db.query(models.Movement.category, func.sum(models.Movement.amount)).filter(
        models.Movement.family_id == family_id, # Filter by family
        models.Movement.type == "EXPENSE",
        extract('year', models.Movement.date) == year,
        extract('month', models.Movement.date) == month
    ).group_by(models.Movement.category).all()

def get_budget_status(db: Session, year: int, month: int, family_id: int): # NEW family_id
    import json
    budgets = db.query(models.Budget).filter(models.Budget.family_id == family_id).all() # Filter by family
    
    # Get actual expenses (is_planned = False)
    actual_expenses = db.query(models.Movement.category, func.sum(models.Movement.amount)).filter(
        models.Movement.family_id == family_id, # Filter by family
        models.Movement.type == "EXPENSE",
        models.Movement.is_planned == False,
        extract('year', models.Movement.date) == year,
        extract('month', models.Movement.date) == month
    ).group_by(models.Movement.category).all()
    
    # Get planned expenses (is_planned = True)
    planned_expenses = db.query(models.Movement.category, func.sum(models.Movement.amount)).filter(
        models.Movement.family_id == family_id, # Filter by family
        models.Movement.type == "EXPENSE",
        models.Movement.is_planned == True,
        extract('year', models.Movement.date) == year,
        extract('month', models.Movement.date) == month
    ).group_by(models.Movement.category).all()
    
    # Create dicts for quick lookup
    actual_dict = {category: float(amount) for category, amount in actual_expenses}
    planned_dict = {category: float(amount) for category, amount in planned_expenses}
    
    budget_status = []
    for budget in budgets:
        # Check if budget applies to this month
        if budget.applicable_months:
            applicable = json.loads(budget.applicable_months)
            if month not in applicable:
                continue  # Skip this budget for this month
        
        actual_spent = actual_dict.get(budget.category, 0.0)
        planned_spent = planned_dict.get(budget.category, 0.0)
        total_spent = actual_spent + planned_spent
        limit = float(budget.amount)
        remaining = limit - total_spent
        percentage = (total_spent / limit * 100) if limit > 0 else 0
        actual_percentage = (actual_spent / limit * 100) if limit > 0 else 0
        
        budget_status.append({
            "category": budget.category,
            "limit": limit,
            "spent": actual_spent,
            "planned": planned_spent,
            "total_spent": total_spent,
            "remaining": remaining,
            "percentage": round(percentage, 1),
            "actual_percentage": round(actual_percentage, 1)
        })
    
    return budget_status

def get_budget(db: Session, budget_id: int, family_id: int): # NEW family_id
    return db.query(models.Budget).filter(models.Budget.id == budget_id, models.Budget.family_id == family_id).first() # Filter by family

def delete_budget(db: Session, budget_id: int, family_id: int): # NEW family_id
    db_budget = db.query(models.Budget).filter(models.Budget.id == budget_id, models.Budget.family_id == family_id).first() # Filter by family
    if db_budget:
        db.delete(db_budget)
        db.commit()
    return db_budget

def bulk_update_movement_category(db: Session, old_category: str, new_category: str, family_id: int): # NEW family_id
    movements = db.query(models.Movement).filter(models.Movement.category == old_category, models.Movement.family_id == family_id).all() # Filter by family
    for movement in movements:
        movement.category = new_category
    db.commit()
    return len(movements)

# Categories
def get_categories(db: Session, family_id: int): # NEW family_id
    return db.query(models.Category).filter(models.Category.family_id == family_id).all() # Filter by family

def create_category(db: Session, category: schemas.CategoryCreate, family_id: int): # NEW family_id
    db_category = models.Category(**category.dict(), family_id=family_id) # Set family_id
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: schemas.CategoryCreate, family_id: int): # NEW family_id
    db_category = db.query(models.Category).filter(models.Category.id == category_id, models.Category.family_id == family_id).first() # Filter by family
    if db_category:
        db_category.name = category.name
        db_category.icon = category.icon
        db_category.color = category.color
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int, family_id: int): # NEW family_id
    db_category = db.query(models.Category).filter(models.Category.id == category_id, models.Category.family_id == family_id).first() # Filter by family
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

# RecurringExpenses
def get_recurring_expenses(db: Session, family_id: int, user_id: int = None): # NEW family_id
    """Get all active recurring expenses for family"""
    query = db.query(models.RecurringExpense).filter(models.RecurringExpense.is_active == True, models.RecurringExpense.family_id == family_id) # Filter by family
    if user_id:
        query = query.filter(models.RecurringExpense.user_id == user_id)
    return query.all()

def create_recurring_expense(db: Session, recurring: schemas.RecurringExpenseCreate, user_id: int, family_id: int): # NEW family_id
    """Create recurring expense and generate movements"""
    import json
    recurring_dict = recurring.dict()
    recurring_dict['applicable_months'] = json.dumps(recurring.applicable_months) if recurring.applicable_months else None
    recurring_dict['user_id'] = user_id
    recurring_dict['family_id'] = family_id # Set family_id
    
    db_recurring = models.RecurringExpense(**recurring_dict)
    db.add(db_recurring)
    db.commit()
    db.refresh(db_recurring)
    
    # Generate movements for applicable months
    generate_recurring_movements(db, db_recurring)
    
    return db_recurring

def generate_recurring_movements(db: Session, recurring: models.RecurringExpense):
    """Generate planned movements from recurring expense based on date range"""
    import json
    from datetime import date
    from dateutil.relativedelta import relativedelta
    
    today = date.today()
    start = recurring.start_date or today
    # Use end_date from recurring if set, otherwise 1 year ahead
    end = recurring.end_date or (start + relativedelta(years=1))
    
    # Get day of month (default to 1 if not set)
    day_of_month = recurring.day_of_month or 1
    
    # Generate movements month by month
    current = start
    while current <= end:
        # Create date for this month with specified day
        try:
            # Handle months with fewer days (e.g., Feb 30 → Feb 28/29)
            movement_day = min(day_of_month, 28 if current.month == 2 else 31)
            movement_date = date(current.year, current.month, movement_day)
        except ValueError:
            # Fallback to last valid day of month
            movement_date = date(current.year, current.month, 1) + relativedelta(months=1, days=-1)
        
        # Check if movement already exists for this month
        existing = db.query(models.Movement).filter(
            models.Movement.from_recurring_id == recurring.id,
            extract('year', models.Movement.date) == current.year,
            extract('month', models.Movement.date) == current.month
        ).first()
        
        if not existing:
            # Create movement for this month
            movement = models.Movement(
                type="EXPENSE",
                date=movement_date,
                amount=recurring.amount,
                category=recurring.category,
                description=f"[Ricorrente] {recurring.name}" + (f" - {recurring.description}" if recurring.description else ""),
                is_planned=True,
                is_confirmed=False,  # Not confirmed yet
                from_recurring_id=recurring.id,
                user_id=recurring.user_id,
                family_id=recurring.family_id # Set family_id
            )
            db.add(movement)
        
        current = current + relativedelta(months=1)
    
    db.commit()

def confirm_recurring_movement(db: Session, movement_id: int, family_id: int): # NEW family_id
    """Confirm a recurring movement (mark as paid)"""
    movement = db.query(models.Movement).filter(models.Movement.id == movement_id, models.Movement.family_id == family_id).first() # Filter by family
    if movement and movement.from_recurring_id:
        movement.is_confirmed = True
        movement.is_planned = False  # No longer "planned", it's actual
        db.commit()
        db.refresh(movement)
    return movement

def delete_recurring_expense(db: Session, recurring_id: int, family_id: int): # NEW family_id
    """Soft delete recurring expense and remove unconfirmed movements"""
    recurring = db.query(models.RecurringExpense).filter(models.RecurringExpense.id == recurring_id, models.RecurringExpense.family_id == family_id).first() # Filter by family
    if recurring:
        recurring.is_active = False
        
        # Delete unconfirmed movements
        db.query(models.Movement).filter(
            models.Movement.from_recurring_id == recurring_id,
            models.Movement.is_confirmed == False
        ).delete()
        
        db.commit()
    return recurring

def update_recurring_expense(db: Session, recurring_id: int, recurring: schemas.RecurringExpenseCreate, family_id: int): # NEW family_id
    """Update recurring expense and regenerate unconfirmed movements"""
    import json
    db_recurring = db.query(models.RecurringExpense).filter(models.RecurringExpense.id == recurring_id, models.RecurringExpense.family_id == family_id).first() # Filter by family
    if db_recurring:
        # Update fields
        db_recurring.name = recurring.name
        db_recurring.amount = recurring.amount
        db_recurring.category = recurring.category
        db_recurring.description = recurring.description
        db_recurring.recurrence_type = recurring.recurrence_type
        db_recurring.applicable_months = json.dumps(recurring.applicable_months) if recurring.applicable_months else None
        db_recurring.day_of_month = recurring.day_of_month
        db_recurring.start_date = recurring.start_date
        db_recurring.end_date = recurring.end_date
        
        # Delete old unconfirmed movements
        db.query(models.Movement).filter(
            models.Movement.from_recurring_id == recurring_id,
            models.Movement.is_confirmed == False
        ).delete()
        
        db.commit()
        db.refresh(db_recurring)
        
        # Regenerate movements
        generate_recurring_movements(db, db_recurring)
        
    return db_recurring

# Savings Goals
def get_savings_goals(db: Session, family_id: int):
    return db.query(models.SavingsGoal).filter(models.SavingsGoal.family_id == family_id).all()

def create_savings_goal(db: Session, goal: schemas.SavingsGoalCreate, family_id: int):
    db_goal = models.SavingsGoal(**goal.dict(), family_id=family_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def update_savings_goal(db: Session, goal_id: int, goal_update: schemas.SavingsGoalUpdate, family_id: int):
    db_goal = db.query(models.SavingsGoal).filter(models.SavingsGoal.id == goal_id, models.SavingsGoal.family_id == family_id).first()
    if not db_goal:
        return None
    
    update_data = goal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
        
    db.commit()
    db.refresh(db_goal)
    return db_goal

def delete_savings_goal(db: Session, goal_id: int, family_id: int):
    db_goal = db.query(models.SavingsGoal).filter(models.SavingsGoal.id == goal_id, models.SavingsGoal.family_id == family_id).first()
    if db_goal:
        db.delete(db_goal)
        db.commit()
    return db_goal
