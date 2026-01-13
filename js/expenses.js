document.addEventListener('DOMContentLoaded', () => {
    initExpensesPage();
    initModal(); // Reuse modal logic
});

let currentCategory = '';

async function initExpensesPage() {
    setupFilters();
    await loadExpenses();
}

function setupFilters() {
    const filters = document.querySelectorAll('.filter-chip');
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all
            filters.forEach(f => f.classList.remove('active'));
            // Add to clicked
            filter.classList.add('active');

            // Update state and reload
            currentCategory = filter.dataset.category;
            loadExpenses();
        });
    });
}

async function loadExpenses() {
    const listContainer = document.getElementById('expense-list');
    listContainer.innerHTML = '<div style="padding: 2rem; text-align: center;">Yükleniyor...</div>';

    let url = '/api/transactions?type=expense&limit=100';
    if (currentCategory) {
        url += `&category=${currentCategory}`;
    }

    try {
        const response = await fetch(url);
        const transactions = await response.json();

        renderExpenseList(transactions);
        updateTotal(transactions);

    } catch (error) {
        console.error('Hata:', error);
        listContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: red;">Veriler yüklenemedi.</div>';
    }
}

function renderExpenseList(data) {
    const listContainer = document.getElementById('expense-list');

    if (data.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--color-text-secondary);">
                <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">receipt_long</span>
                <p>Bu kategoride henüz harcama yok.</p>
                <button class="btn btn-primary" onclick="openModal()" style="margin-top: 1rem;">Harcama Ekle</button>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = data.map(item => {
        const date = new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

        return `
            <div class="list-item">
                <div class="item-icon" style="background-color: var(--color-error-bg); color: var(--color-error);">
                    <span class="material-symbols-outlined">${item.icon || 'receipt'}</span>
                </div>
                <div style="flex: 1;">
                    <p class="font-bold text-lg">${item.title}</p>
                    <p class="text-secondary" style="font-size: 0.9rem;">${item.category} • ${date}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-xl" style="color: var(--color-error);">-₺${item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>
        `;
    }).join('');
}

function updateTotal(data) {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById('total-expense-display').textContent =
        total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
}

/* Modal Logic (Replicated from app.js to keep standalone or we could extract to common js) */
// ideally we should have a shared.js, but for simplicity we'll inline minimal needed
function initModal() {
    const modal = document.getElementById('expense-modal');
    // const openBtn is handled inline in HTML onclick="openModal()" for simplicity in secondary pages
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('expense-form');

    [closeBtn, cancelBtn, backdrop].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function openModal() {
    document.getElementById('expense-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('expense-modal').classList.add('hidden');
    document.getElementById('expense-form').reset();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        title: formData.get('title'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        is_recurring: formData.get('is_recurring') === 'on',
        type: 'expense',
        date: new Date().toISOString()
    };

    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModal();
            loadExpenses(); // Reload list
            Toast.show('Başarıyla eklendi!', 'success');
        }
    } catch (err) {
        Toast.show('Bir hata oluştu.', 'error');
    }
}
