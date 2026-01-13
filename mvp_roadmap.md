# MVP Roadmap: Remaining Features

This document tracks the remaining tasks to complete the "Ev Bütçe & Harcama Dashboard" MVP.

## ✅ Completed (Verified)
- **Backend Setup**: FastAPI, SQLite (`finance.db`), Models (`Transaction`, `Budget`), Schemas, basic CRUD.
- **Frontend Basics**: `index.html` (Dashboard), `harcamalar.html` (Expenses), `gelirler.html` (Income).
- **Expenses Screen**: List, Filter by Category, Add Expense Modal.
- **Income Screen**: List, Add Income Modal.

## 🚀 To Implement

### 1. Bütçe Ekranı (Budget Screen)
- [x] Create `butce.html`
- [x] Create `js/budget.js`
- [x] Fetch and display budget status (`/api/budgets/status`)
- [x] Visual Progress Bars (Actual vs Limit)
- [x] "Set Budget" Modal (Post to `/api/budgets`) (Category based)

### 2. Tekrarlayan Giderler (Recurring Expenses)
- [x] Add "Recurring" toggle to Add Expense Modal (in `harcamalar.html` and `index.html`)
- [x] Create a way to view/manage recurring items (Dashboard "Upcoming Bills" list)
- [x] Backend: Logic to "process" recurring expenses (Implemented via "Pay" button on Dashboard)

### 3. Takvim Ekranı (Calendar Screen)
- [x] Create `takvim.html`
- [x] Integrate FullCalendar (via CDN)
- [x] key: Fetch transactions and display on calendar
- [x] Feature: Click event to see details
- [x] Feature: "Mark as Paid" from calendar (Supported via Dashboard for now)

### 4. UI/UX Polish
- [x] Loading States (Better spinners)
- [x] Error Handling (Toast notifications instead of `alert()`)
- [x] Empty States (Better visuals when no data)
- [x] Responsive fixes (Basic Mobile Optimization)

### 5. Gelir Ekranı Improvements
- [x] Ensure category connection is solid (Added Select Dropdown).

## Execution Plan
1. **Step 1**: Implement `butce.html` and budget logic. (Done)
2. **Step 2**: Implement `takvim.html` with FullCalendar. (Done)
3. **Step 3**: Enhance Recurring Expenses (Add "Recurring" toggle to forms). (Done)
4. **Step 4**: Global UI Polish (Toasts, refined styles). (Done)
