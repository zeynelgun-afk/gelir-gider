document.addEventListener('DOMContentLoaded', () => {
    initBudgetPage();
    initModal();
});

async function initBudgetPage() {
    await loadBudgets();
}

async function loadBudgets() {
    const listContainer = document.getElementById('budget-list');
    listContainer.innerHTML = '<div style="padding: 2rem; text-align: center;">Yükleniyor...</div>';

    try {
        const response = await fetch('/api/budgets/status');
        const data = await response.json();

        renderBudgetList(data);
    } catch (error) {
        console.error('Hata:', error);
        listContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: red;">Veriler yüklenemedi.</div>';
    }
}

function renderBudgetList(data) {
    const listContainer = document.getElementById('budget-list');

    if (data.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--color-text-secondary);">
                <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 1rem;">account_balance_wallet</span>
                <p>Henüz bütçe belirlenmemiş.</p>
                <button class="btn btn-primary" onclick="openModal()" style="margin-top: 1rem;">Bütçe Oluştur</button>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = data.map(item => {
        const percentage = Math.min(item.percentage, 100);
        let colorClass = 'var(--color-primary)'; // Default
        let bgColorClass = 'var(--color-primary-bg)';

        if (item.percentage >= 100) {
            colorClass = 'var(--color-error)';
        } else if (item.percentage >= 80) {
            colorClass = 'var(--color-warning)';
        } else {
            colorClass = 'var(--color-success)';
        }

        return `
            <div class="budget-card">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold" style="font-size: 1.125rem;">${item.category}</h3>
                    <span style="font-weight: 600; color: ${colorClass};">%${item.percentage}</span>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background-color: ${colorClass};"></div>
                </div>
                
                <div class="progress-text">
                    <span>Harcanan: <strong>₺${item.spent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong></span>
                    <span>Limit: <strong>₺${item.limit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong></span>
                </div>
            </div>
        `;
    }).join('');
}

/* Modal Logic */
function initModal() {
    const modal = document.getElementById('budget-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('budget-form');

    [closeBtn, cancelBtn, backdrop].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function openModal() {
    document.getElementById('budget-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('budget-modal').classList.add('hidden');
    document.getElementById('budget-form').reset();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        category: formData.get('category'),
        amount: parseFloat(formData.get('amount'))
    };

    try {
        const res = await fetch('/api/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModal();
            loadBudgets(); // Reload list
            Toast.show('Bütçe Kaydedildi!', 'success');
        }
    } catch (err) {
        Toast.show('Bir hata oluştu.', 'error');
    }
}
