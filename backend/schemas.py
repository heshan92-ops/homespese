from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class MovementType(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Family
class FamilyBase(BaseModel):
    name: str

class FamilyCreate(FamilyBase):
    pass

class Family(FamilyBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# User
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    family_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    family_id: Optional[int] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Category
class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    family_id: Optional[int] = None

    class Config:
        orm_mode = True

# RecurringExpense
class RecurringExpenseBase(BaseModel):
    name: str
    amount: float
    category: str
    description: Optional[str] = None
    recurrence_type: str = "monthly"
    applicable_months: Optional[List[int]] = None
    day_of_month: int = 1
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class RecurringExpenseCreate(RecurringExpenseBase):
    pass

class RecurringExpense(RecurringExpenseBase):
    id: int
    is_active: bool
    created_at: datetime
    user_id: Optional[int] = None
    family_id: Optional[int] = None

    class Config:
        orm_mode = True

# Movement
class MovementBase(BaseModel):
    type: MovementType
    date: date
    amount: float
    category: str
    description: Optional[str] = None
    is_planned: bool = False
    is_confirmed: bool = True
    from_recurring_id: Optional[int] = None

class MovementCreate(MovementBase):
    pass

class MovementUpdate(BaseModel):
    type: Optional[str] = None
    date: Optional[date] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_planned: Optional[bool] = None
    is_confirmed: Optional[bool] = None


class Movement(MovementBase):
    id: int
    created_at: datetime
    user_id: Optional[int] = None
    from_recurring_id: Optional[int] = None
    family_id: Optional[int] = None
    
    # Audit fields
    created_by_user_id: Optional[int] = None
    last_modified_by_user_id: Optional[int] = None
    last_modified_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Budget
class BudgetBase(BaseModel):
    category: str
    amount: float
    applicable_months: Optional[List[int]] = None

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    family_id: Optional[int] = None

    class Config:
        orm_mode = True

# Savings Goal
class SavingsGoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[date] = None
    color: Optional[str] = "#10b981"
    icon: Optional[str] = None

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[date] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class SavingsGoal(SavingsGoalBase):
    id: int
    family_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Budget(BudgetBase):
    id: int
    family_id: Optional[int] = None

    class Config:
        orm_mode = True

# SMTP Configuration
class SMTPConfigCreate(BaseModel):
    smtp_server: str
    smtp_port: int = 587
    smtp_username: str
    smtp_password: str
    from_email: EmailStr
    use_tls: bool = True

class SMTPConfigResponse(BaseModel):
    id: int
    smtp_server: str
    smtp_port: int
    smtp_username: str
    from_email: str
    use_tls: bool
    updated_at: datetime

    class Config:
        orm_mode = True

# Password
class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class PasswordReset(BaseModel):
    token: str
    new_password: str

class ForgotPassword(BaseModel):
    email: EmailStr
