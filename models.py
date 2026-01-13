from sqlalchemy import Boolean, Column, Float, Integer, String, DateTime
from database import Base
import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Float)
    type = Column(String)  # 'income', 'expense'
    category = Column(String) # 'Mutfak', 'Kira', 'Fatura', etc.
    date = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Bill specific fields
    is_recurring = Column(Boolean, default=False)
    status = Column(String, default="completed") # 'completed', 'unpaid', 'autopay'
    due_date_str = Column(String, nullable=True) # Simple string for MVP e.g. "26 Ekim"
    icon = Column(String, default="payments") # Material Symbol name

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True, index=True)
    amount = Column(Float)

class Debt(Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) # 'credit_card', 'loan'
    name = Column(String)
    
    # Common
    total_amount = Column(Float) # Card: Current Debt, Loan: Total Loan Amount
    due_date_day = Column(Integer) # Day of month (1-31)
    
    # Loan Specific
    monthly_payment = Column(Float, nullable=True)
    total_installments = Column(Integer, nullable=True) # e.g. 24
    remaining_installments = Column(Integer, nullable=True)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
