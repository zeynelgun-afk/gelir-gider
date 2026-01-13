from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from database import engine

# Create Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Seed Data (If DB is empty)
def seed_data(db: Session):
    if db.query(models.Transaction).first():
        return
    
    # Existing Data from Design
    seed_transactions = [
        # Income
        models.Transaction(title="Maaş", amount=12500.00, type="income", category="Maaş", icon="account_balance_wallet"),
        
        # Expenses (Pie Chart Data)
        models.Transaction(title="Market Alışverişi", amount=3300.00, type="expense", category="Mutfak", icon="shopping_cart"),
        models.Transaction(title="İlaç Alımı", amount=2062.50, type="expense", category="Sağlık", icon="medication"),
        models.Transaction(title="Aylık Akbil", amount=1650.00, type="expense", category="Ulaşım", icon="directions_bus"),
        models.Transaction(title="Diğer Harcamalar", amount=1237.50, type="expense", category="Diğer", icon="receipt"),
        
        # Bills (Upcoming)
        models.Transaction(title="Elektrik Faturası", amount=450.00, type="expense", category="Fatura", is_recurring=True, status="unpaid", due_date_str="26 Ekim", icon="bolt"),
        models.Transaction(title="Su Faturası", amount=120.00, type="expense", category="Fatura", is_recurring=True, status="unpaid", due_date_str="28 Ekim", icon="water_drop"),
        models.Transaction(title="İnternet", amount=290.00, type="expense", category="Fatura", is_recurring=True, status="autopay", due_date_str="30 Ekim", icon="router"),
    ]
    
    for t in seed_transactions:
        db.add(t)
    db.commit()

@app.on_event("startup")
def on_startup():
    db = database.SessionLocal()
    seed_data(db)
    db.close()

# API Endpoints

@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Calculate Totals
    income = db.query(models.Transaction).filter(models.Transaction.type == "income").all()
    expense = db.query(models.Transaction).filter(models.Transaction.type == "expense").all()
    
    total_income = sum(t.amount for t in income)
    total_expense = sum(t.amount for t in expense)
    
    # Chart Data (Group by Category)
    chart_data = {}
    categories = ["Mutfak", "Sağlık", "Ulaşım", "Diğer"]
    for cat in categories:
        cat_total = sum(t.amount for t in expense if t.category == cat)
        if total_expense > 0:
            chart_data[cat] = int((cat_total / total_expense) * 100)
        else:
            chart_data[cat] = 0

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "total_balance": total_income - total_expense,
        "chart_data": chart_data
    }

@app.get("/api/bills", response_model=List[schemas.Transaction])
def get_bills(db: Session = Depends(get_db)):
    return db.query(models.Transaction).filter(models.Transaction.is_recurring == True).all()

from typing import Optional

@app.get("/api/transactions", response_model=List[schemas.Transaction])
def get_transactions(
    type: Optional[str] = None, 
    category: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    
    if type:
        query = query.filter(models.Transaction.type == type)
    if category:
        query = query.filter(models.Transaction.category == category)
        
    return query.order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()

@app.post("/api/transactions", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_txn = models.Transaction(**transaction.dict())
    db.add(db_txn)
    db.commit()
    db.refresh(db_txn)
    db.refresh(db_txn)
    return db_txn

@app.put("/api/transactions/{transaction_id}/status", response_model=schemas.Transaction)
def update_transaction_status(transaction_id: int, status_update: schemas.TransactionStatusUpdate, db: Session = Depends(get_db)):
    db_txn = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not db_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db_txn.status = status_update.status
    db.commit()
    db.refresh(db_txn)
    return db_txn

# Budget Endpoints

@app.get("/api/budgets/status", response_model=List[schemas.BudgetStatus])
def get_budget_status(db: Session = Depends(get_db)):
    # 1. Get all budgets
    budgets = db.query(models.Budget).all()
    
    # 2. Calculate spending per category for "this month" (Simplified: All time for MVP or filter by date)
    # For MVP, we will sum ALL time expenses to match the simplified flow, 
    # but ideally we should filter by current month.
    
    # Let's filter by current month roughly
    import datetime
    now = datetime.datetime.now()
    start_of_month = datetime.datetime(now.year, now.month, 1)
    
    status_list = []
    
    for budget in budgets:
        # Sum expenses for this category since start of month
        spent = db.query(models.Transaction).filter(
            models.Transaction.type == 'expense',
            models.Transaction.category == budget.category,
            models.Transaction.date >= start_of_month
        ).all()
        
        total_spent = sum(t.amount for t in spent)
        percent = int((total_spent / budget.amount) * 100) if budget.amount > 0 else 100
        
        status_list.append({
            "category": budget.category,
            "limit": budget.amount,
            "spent": total_spent,
            "percentage": percent
        })
        
    return status_list

@app.post("/api/budgets", response_model=schemas.Budget)
def create_or_update_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db)):
    # Check if exists
    db_budget = db.query(models.Budget).filter(models.Budget.category == budget.category).first()
    
    if db_budget:
        db_budget.amount = budget.amount
    else:
        db_budget = models.Budget(category=budget.category, amount=budget.amount)
        db.add(db_budget)
    
    db.commit()
    db.refresh(db_budget)
    return db_budget

# Debt Endpoints
@app.get("/api/debts", response_model=List[schemas.Debt])
def get_debts(db: Session = Depends(get_db)):
    return db.query(models.Debt).all()

@app.post("/api/debts", response_model=schemas.Debt)
def create_debt(debt: schemas.DebtCreate, db: Session = Depends(get_db)):
    db_debt = models.Debt(**debt.dict())
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return db_debt

@app.delete("/api/debts/{debt_id}")
def delete_debt(debt_id: int, db: Session = Depends(get_db)):
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id).first()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    db.delete(db_debt)
    db.commit()
    return {"message": "Deleted"}

@app.put("/api/debts/{debt_id}", response_model=schemas.Debt)
def update_debt(debt_id: int, debt: schemas.DebtCreate, db: Session = Depends(get_db)):
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id).first()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    for key, value in debt.dict().items():
        setattr(db_debt, key, value)
    
    db.commit()
    db.refresh(db_debt)
    return db_debt

# Transaction Edit/Delete
@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_txn = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not db_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(db_txn)
    db.commit()
    return {"message": "Deleted"}

@app.put("/api/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, txn: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_txn = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not db_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for key, value in txn.dict().items():
        setattr(db_txn, key, value)

    db.commit()
    db.refresh(db_txn)
    return db_txn
        db.add(db_budget)
    
    db.commit()
    db.refresh(db_budget)
    return db_budget

# Debt Endpoints
@app.get("/api/debts", response_model=List[schemas.Debt])
def get_debts(db: Session = Depends(get_db)):
    return db.query(models.Debt).all()

@app.post("/api/debts", response_model=schemas.Debt)
def create_debt(debt: schemas.DebtCreate, db: Session = Depends(get_db)):
    db_debt = models.Debt(**debt.dict())
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return db_debt

# Serve Static Files (Frontend)
app.mount("/", StaticFiles(directory=".", html=True), name="static")
