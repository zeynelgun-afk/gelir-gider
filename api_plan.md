# Plan: Enhance Transaction API

## Goal
Allow frontend to request "only expenses" or "only income" or "filter by category".

## Changes in `main.py`

Update `get_transactions` endpoint signature:
```python
@app.get("/api/transactions", response_model=List[schemas.Transaction])
def get_transactions(
    type: Optional[str] = None, 
    category: Optional[str] = None, 
    limit: int = 100, 
    skip: int = 0, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    
    if type:
        query = query.filter(models.Transaction.type == type)
    
    if category:
        query = query.filter(models.Transaction.category == category)
        
    return query.order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()
```

## Verification
- Test `GET /api/transactions?type=expense`
- Test `GET /api/transactions?type=income`
