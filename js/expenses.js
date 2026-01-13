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

    // Simple Loader
    listContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">
            <span class="material-symbols-outlined spin" style="font-size: 2rem;">sync</span>
            <p>Yükleniyor...</p>
        </div>`;

    let url = '/api/transactions?type=expense&limit=100';
    // If category is "Tekrarlanan", we will filter client-side or use special backend param if supported.
    // For now, simpler: fetch all, then filter client side if "Tekrarlanan" is selected, 
    // unless standard category.
    if (currentCategory && currentCategory !== 'Tekrarlanan') {
        url += `&category=${currentCategory}`;
    }

    try {
        const [transRes, debtsRes] = await Promise.all([
            fetch(url),
            fetch('/api/debts')
        ]);

        const transactions = await transRes.json();
        const debts = await debtsRes.json();

        // Convert debts to transaction-like objects for this month
        const debtTransactions = debts.map(d => {
            const isLoan = d.type === 'loan';
            // Only show active loans
            if (isLoan && d.remaining_installments <= 0) return null;

            return {
                id: `debt-${d.id}`,
                title: isLoan ? `${d.name} (Taksit)` : `${d.name} (Ekstre)`,
                amount: isLoan ? d.monthly_payment : d.total_amount, // Simplified
                category: 'Borç/Kredi',
                date: new Date().toISOString(), // Show as current
                icon: isLoan ? 'real_estate_agent' : 'credit_card',
                is_virtual: true
            };
        }).filter(d => d !== null);

        // Merge
        const allItems = [...transactions, ...debtTransactions];

        // Sort by date desc (though virtuals are 'now')
        allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Filter for "Tekrarlanan" if selected
        let finalItems = allItems;
        if (currentCategory === 'Tekrarlanan') {
            finalItems = allItems.filter(item => item.is_recurring || item.is_virtual);
        }

        renderExpenseList(finalItems);
        updateTotal(finalItems);

    } catch (error) {
        console.error('Hata:', error);
        listContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--color-error);">
                <span class="material-symbols-outlined" style="font-size: 2rem;">error</span>
                <p>Veriler yüklenemedi.</p>
            </div>`;
    }
}

// Editing State
let editingId = null;

function renderExpenseList(data) {
    const listContainer = document.getElementById('expense-list');

    if (data.length === 0) {
        // ... (Empty State Code - keep existing)
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
        // Escape quotes for JSON string
        const itemStr = encodeURIComponent(JSON.stringify(item));

        return `
            <div class="list-item" onclick="openModal('${itemStr}')" style="cursor: pointer;">
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

// ... (updateTotal keeps same)

/* Modal Logic */
function initModal() {
    const modal = document.getElementById('expense-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn'); // New
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('expense-form');

    [closeBtn, cancelBtn, backdrop].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDelete);
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function openModal(dataStr) {
    document.getElementById('expense-modal').classList.remove('hidden');
    const deleteBtn = document.getElementById('delete-btn');

    if (dataStr) {
        // Edit Mode
        const data = JSON.parse(decodeURIComponent(dataStr));
        editingId = data.id;

        // Fill Form
        document.getElementById('title').value = data.title;
        document.getElementById('amount').value = data.amount;
        document.getElementById('category').value = data.category;
        document.getElementById('is_recurring').checked = data.is_recurring;

        // Show Delete
        if (deleteBtn) deleteBtn.classList.remove('hidden');
    } else {
        // Add Mode
        editingId = null;
        document.getElementById('expense-form').reset();
        if (deleteBtn) deleteBtn.classList.add('hidden');
    }
}

async function handleDelete() {
    if (!editingId) return;

    if (confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
        try {
            const res = await fetch(`/api/transactions/${editingId}`, { method: 'DELETE' });
            if (res.ok) {
                closeModal();
                loadExpenses();
                Toast.show('Silindi', 'success');
            }
        } catch (err) {
            Toast.show('Hata', 'error');
        }
    }
}

function closeModal() {
    document.getElementById('expense-modal').classList.add('hidden');
    document.getElementById('expense-form').reset();
    editingId = null;
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
        let res;
        if (editingId) {
            // Edit
            res = await fetch(`/api/transactions/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create
            res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            closeModal();
            loadExpenses();
            Toast.show(editingId ? 'Güncellendi!' : 'Başarıyla eklendi!', 'success');
        }
    } catch (err) {
        Toast.show('Bir hata oluştu.', 'error');
    }
}
