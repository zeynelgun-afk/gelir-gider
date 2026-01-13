document.addEventListener('DOMContentLoaded', () => {
    initDebtPage();
    initModal();
});

async function initDebtPage() {
    await loadDebts();
}

async function loadDebts() {
    const listContainer = document.getElementById('debt-list');
    listContainer.innerHTML = Loader.getHTML();

    try {
        const response = await fetch('/api/debts');
        const data = await response.json();
        renderDebtList(data);
    } catch (error) {
        console.error('Hata:', error);
        listContainer.innerHTML = Loader.getErrorHTML();
    }
}

function renderDebtList(data) {
    const listContainer = document.getElementById('debt-list');

    if (data.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--color-text-secondary);">
                <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">credit_card</span>
                <p>Henüz borç kaydı yok.</p>
                <button class="btn btn-primary" onclick="openModal()" style="margin-top: 1rem; background-color: var(--color-error);">Borç Ekle</button>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = data.map(item => {
        const isLoan = item.type === 'loan';
        const icon = isLoan ? 'real_estate_agent' : 'credit_card';
        const typeLabel = isLoan ? 'Kredi' : 'Kredi Kartı';

        // Loan Progress
        let loanDetails = '';
        if (isLoan) {
            // Calculate remaining roughly or strictly from DB? 
            // For MVP, we'll assume total_installments and calculate end date or similar.
            // Let's just show details provided.
            const totalPaid = (item.total_installments - (item.remaining_installments || item.total_installments)) * item.monthly_payment;
            // Actually MVP model doesn't track "remaining" dynamically yet, 
            // but let's just show the static info for now.

            loanDetails = `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--color-border);">
                    <div class="flex justify-between text-sm text-secondary mb-1">
                        <span>Aylık Taksit: <strong>${formatCurrency(item.monthly_payment)}</strong></span>
                        <span>Vade: <strong>${item.total_installments} Ay</strong></span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card" style="border-left: 4px solid var(--color-error);">
                <div class="flex justify-between items-start">
                    <div class="flex gap-4">
                        <div class="icon-box" style="background-color: var(--color-error-bg); color: var(--color-error);">
                            <span class="material-symbols-outlined">${icon}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">${item.name}</h3>
                            <span class="tag text-sm">${typeLabel}</span>
                             <p class="text-secondary text-sm mt-1">Son Ödeme: Her ayın ${item.due_date_day}. günü</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-secondary text-sm">Toplam Borç</p>
                        <p class="font-bold text-xl" style="color: var(--color-error);">${formatCurrency(item.total_amount)}</p>
                    </div>
                </div>
                ${loanDetails}
            </div>
        `;
    }).join('');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

/* Modal Logic */
function initModal() {
    const modal = document.getElementById('debt-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('debt-form');

    [closeBtn, cancelBtn, backdrop].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function openModal() {
    document.getElementById('debt-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('debt-modal').classList.add('hidden');
    document.getElementById('debt-form').reset();
    toggleLoanFields(false); // Reset to card view
}

// Global for inline HTML access
window.toggleLoanFields = function (show) {
    const fields = document.getElementById('loan-fields');
    if (show) {
        fields.classList.remove('hidden');
        document.getElementById('monthly_payment').required = true;
        document.getElementById('total_installments').required = true;
    } else {
        fields.classList.add('hidden');
        document.getElementById('monthly_payment').required = false;
        document.getElementById('total_installments').required = false;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const type = formData.get('type');
    const data = {
        type: type,
        name: formData.get('name'),
        total_amount: parseFloat(formData.get('total_amount')),
        due_date_day: parseInt(formData.get('due_date_day')),
        start_date: new Date().toISOString()
    };

    if (type === 'loan') {
        data.monthly_payment = parseFloat(formData.get('monthly_payment'));
        data.total_installments = parseInt(formData.get('total_installments'));
        data.remaining_installments = data.total_installments; // Initial full count
    }

    try {
        const res = await fetch('/api/debts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModal();
            loadDebts();
            Toast.show('Borç Kaydedildi!', 'success');
        } else {
            Toast.show('Hata oluştu', 'error');
        }
    } catch (err) {
        Toast.show('Sunucu hatası', 'error');
        console.error(err);
    }
}
