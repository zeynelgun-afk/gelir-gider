from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    title: str
    amount: float
    type: str
    category: str
    is_recurring: bool = False
    status: str = "completed"
    due_date_str: Optional[str] = None
    icon: str = "payments"

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    date: datetime

    class Config:
        orm_mode = True

class DashboardStats(BaseModel):
    total_income: float
    total_expense: float
    total_balance: float
    chart_data: dict

class BudgetBase(BaseModel):
    category: str
    amount: float

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    class Config:
        orm_mode = True

class BudgetStatus(BaseModel):
    category: str
    limit: float
    spent: float
    percentage: int

class TransactionStatusUpdate(BaseModel):
    status: str

# Debt Schemas
class DebtBase(BaseModel):
    type: str # 'credit_card', 'loan'
    name: str
    total_amount: float
    due_date_day: int
    monthly_payment: Optional[float] = None
    total_installments: Optional[int] = None
    remaining_installments: Optional[int] = None

class DebtCreate(DebtBase):
    pass

class Debt(DebtBase):
    id: int
    start_date: datetime

    class Config:
        orm_mode = True

