document.addEventListener('DOMContentLoaded', () => {
    initIncomePage();
    initModal();
});

async function initIncomePage() {
    const listContainer = document.getElementById('income-list');

    if (typeof Loader !== 'undefined') {
        listContainer.innerHTML = Loader.getHTML();
    } else {
        listContainer.innerHTML = '<div style="padding: 2rem; text-align: center;">Yükleniyor...</div>';
    }

    try {
        const response = await fetch('/api/transactions?type=income&limit=100');
        const data = await response.json();

        // Render List
        if (data.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 3rem; text-align: center; color: var(--color-text-secondary);">
                    <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">account_balance_wallet</span>
                    <p>Henüz gelir kaydı yok.</p>
                    <button class="btn btn-primary" onclick="openModal()" style="margin-top: 1rem; background-color: var(--color-success);">Gelir Ekle</button>
                </div>
            `;
        } else {
            listContainer.innerHTML = data.map(item => {
                const date = new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
                const itemStr = encodeURIComponent(JSON.stringify(item));

                return `
                    <div class="list-item" onclick="openModal('${itemStr}')" style="cursor: pointer;">
                        <div class="item-icon" style="background-color: var(--color-success-bg); color: var(--color-success);">
                            <span class="material-symbols-outlined">account_balance_wallet</span>
                        </div>
                        <div style="flex: 1;">
                            <p class="font-bold text-lg">${item.title}</p>
                            <p class="text-secondary" style="font-size: 0.9rem;">${date}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-xl" style="color: var(--color-success);">+₺${item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update Total
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        document.getElementById('total-income-display').textContent =
            total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

    } catch (e) {
        console.error(e);
    }
}

// Edit State
let editingId = null;

function initModal() {
    const modal = document.getElementById('income-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn'); // New
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('income-form');

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
    document.getElementById('income-modal').classList.remove('hidden');
    const deleteBtn = document.getElementById('delete-btn');

    if (dataStr) {
        // Edit Mode
        const data = JSON.parse(decodeURIComponent(dataStr));
        editingId = data.id;

        document.getElementById('title').value = data.title;
        document.getElementById('amount').value = data.amount;
        document.getElementById('category').value = data.category;

        if (deleteBtn) deleteBtn.classList.remove('hidden');
    } else {
        // Add Mode
        editingId = null;
        document.getElementById('income-form').reset();
        if (deleteBtn) deleteBtn.classList.add('hidden');
    }
}

function closeModal() {
    document.getElementById('income-modal').classList.add('hidden');
    document.getElementById('income-form').reset();
    editingId = null;
}

async function handleDelete() {
    if (!editingId) return;

    if (confirm('Bu geliri silmek istediğinize emin misiniz?')) {
        try {
            const res = await fetch(`/api/transactions/${editingId}`, { method: 'DELETE' });
            if (res.ok) {
                closeModal();
                initIncomePage();
                Toast.show('Silindi', 'success');
            }
        } catch (err) {
            Toast.show('Hata', 'error');
        }
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        title: formData.get('title'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        type: 'income',
        date: new Date().toISOString()
    };

    try {
        let res;
        if (editingId) {
            // Update
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
            initIncomePage();
            Toast.show(editingId ? 'Güncellendi!' : 'Gelir Eklendi!', 'success');
        }
    } catch (err) {
        Toast.show('Hata oluştu.', 'error');
    }
}
