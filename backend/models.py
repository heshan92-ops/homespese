from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base
from datetime import datetime

class MovementType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="family")
    movements = relationship("Movement", back_populates="family")
    budgets = relationship("Budget", back_populates="family")
    categories = relationship("Category", back_populates="family")
    recurring_expenses = relationship("RecurringExpense", back_populates="family")
    savings_goals = relationship("SavingsGoal", back_populates="family")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)

    family = relationship("Family", back_populates="users")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)

    family = relationship("Family", back_populates="categories")
    movements = relationship("Movement", back_populates="category_rel")

class Movement(Base):
    __tablename__ = "movements"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    date = Column(Date, index=True)
    amount = Column(Float)
    category = Column(String, index=True) # Legacy string column
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    description = Column(String, nullable=True)
    is_planned = Column(Boolean, default=False, index=True)
    from_recurring_id = Column(Integer, ForeignKey("recurring_expenses.id"), nullable=True)
    is_confirmed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    
    # Audit fields
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_modified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_modified_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    family = relationship("Family", back_populates="movements")
    category_rel = relationship("Category", back_populates="movements")
    recurring_source = relationship("RecurringExpense", back_populates="generated_movements")
    created_by = relationship("User", foreign_keys=[created_by_user_id])
    last_modified_by = relationship("User", foreign_keys=[last_modified_by_user_id])

class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, index=True)
    description = Column(String, nullable=True)
    recurrence_type = Column(String, default="monthly")
    applicable_months = Column(Text, nullable=True)
    day_of_month = Column(Integer, default=1)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    family = relationship("Family", back_populates="recurring_expenses")
    generated_movements = relationship("Movement", back_populates="recurring_source")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    amount = Column(Float)
    month = Column(Integer)
    year = Column(Integer)
    applicable_months = Column(Text, nullable=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)

    family = relationship("Family", back_populates="budgets")

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    deadline = Column(Date, nullable=True)
    color = Column(String, default="#10b981")
    icon = Column(String, nullable=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family = relationship("Family", back_populates="savings_goals")

class SMTPConfig(Base):
    __tablename__ = "smtp_config"
    
    id = Column(Integer, primary_key=True, index=True)
    smtp_server = Column(String, nullable=False)
    smtp_port = Column(Integer, nullable=False, default=587)
    smtp_username = Column(String, nullable=False)
    smtp_password = Column(Text, nullable=False)
    from_email = Column(String, nullable=False)
    use_tls = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
