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

// Editing State
let editingId = null;

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
        const itemStr = encodeURIComponent(JSON.stringify(item));
        const isLoan = item.type === 'loan';
        const icon = isLoan ? 'real_estate_agent' : 'credit_card';
        const typeLabel = isLoan ? 'Kredi' : 'Kredi Kartı';

        // Loan Progress
        let loanDetails = '';
        if (isLoan) {
            // Calculate elapsed months since start date to determine Paid Installments
            const startDate = new Date(item.start_date);
            const today = new Date();

            // Calculate total month difference
            let monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());

            // If the start date day is passed in current month, it counts as a full month cycle?
            // Actually usually loans are paid on specific day.
            // If today's day >= due_day (or start day), then current month is paid/due.

            if (today.getDate() >= item.due_date_day) {
                monthsDiff += 1;
            }

            // Ensure we don't go below 0 (future start date)
            const paidInstallments = Math.max(0, Math.min(monthsDiff, item.total_installments));
            const remainingInstallments = item.total_installments - paidInstallments;
            const remainingBalance = remainingInstallments * item.monthly_payment;

            // Progress Bar
            const progressPercent = (paidInstallments / item.total_installments) * 100;

            loanDetails = `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--color-border);">
                    <div class="flex justify-between text-sm text-secondary mb-1">
                        <span>Aylık Taksit: <strong>${formatCurrency(item.monthly_payment)}</strong></span>
                        <span>Durum: <strong>${paidInstallments}/${item.total_installments}</strong></span>
                    </div>
                    
                     <div style="width: 100%; height: 6px; background: var(--color-bg-body); border-radius: 3px; overflow: hidden; margin: 0.5rem 0;">
                        <div style="width: ${progressPercent}%; height: 100%; background: var(--color-error); transition: width 0.3s;"></div>
                    </div>

                    <div class="flex justify-between text-sm">
                        <span class="text-secondary">Kalan Borç:</span>
                        <span style="font-weight: bold; color: var(--color-error);">${formatCurrency(remainingBalance)}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card" onclick="openModal('${itemStr}')" style="border-left: 4px solid var(--color-error); cursor: pointer;">
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
    const deleteBtn = document.getElementById('delete-btn'); // New
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('debt-form');

    [closeBtn, cancelBtn, backdrop].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDelete);
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Auto-Calculate Total Amount
    const monthlyInput = document.getElementById('monthly_payment');
    const installmentsInput = document.getElementById('total_installments');
    const totalInput = document.getElementById('total_amount');

    function calculateTotal() {
        const monthly = parseFloat(monthlyInput.value);
        const count = parseInt(installmentsInput.value);
        if (!isNaN(monthly) && !isNaN(count)) {
            totalInput.value = (monthly * count).toFixed(2);
        }
    }

    if (monthlyInput && installmentsInput) {
        monthlyInput.addEventListener('input', calculateTotal);
        installmentsInput.addEventListener('input', calculateTotal);
    }
}

function openModal(dataStr) {
    document.getElementById('debt-modal').classList.remove('hidden');
    const deleteBtn = document.getElementById('delete-btn');

    if (dataStr) {
        // Edit Mode
        const data = JSON.parse(decodeURIComponent(dataStr));
        editingId = data.id;

        // Fill Form
        document.getElementById('name').value = data.name;
        document.getElementById('total_amount').value = data.total_amount;

        // Handle Radios & specific fields
        const radios = document.getElementsByName('type');
        radios.forEach(r => {
            if (r.value === data.type) r.checked = true;
        });

        if (data.type === 'loan') {
            toggleLoanFields(true);
            document.getElementById('monthly_payment').value = data.monthly_payment;
            document.getElementById('total_installments').value = data.total_installments;

            // Format ISO date to YYYY-MM-DD for input
            if (data.start_date) {
                document.getElementById('start_date_input').value = data.start_date.split('T')[0];
            }
        } else {
            toggleLoanFields(false);
            document.getElementById('due_date_day').value = data.due_date_day;
        }

        if (deleteBtn) deleteBtn.classList.remove('hidden');
    } else {
        // Add Mode
        editingId = null;
        document.getElementById('debt-form').reset();
        toggleLoanFields(false); // Default
        if (deleteBtn) deleteBtn.classList.add('hidden');
    }
}

function closeModal() {
    document.getElementById('debt-modal').classList.add('hidden');
    document.getElementById('debt-form').reset();
    toggleLoanFields(false);
    editingId = null;
}

async function handleDelete() {
    if (!editingId) return;

    if (confirm('Bu borcu silmek istediğinize emin misiniz?')) {
        try {
            const res = await fetch(`/api/debts/${editingId}`, { method: 'DELETE' });
            if (res.ok) {
                closeModal();
                loadDebts();
                Toast.show('Silindi', 'success');
            }
        } catch (err) {
            Toast.show('Hata', 'error');
        }
    }
}

// Global for inline HTML access
window.toggleLoanFields = function (show) {
    const loanFields = document.getElementById('loan-fields');
    const cardGroup = document.getElementById('card-due-date-group');
    const loanDateGroup = document.getElementById('loan-start-date-group');

    if (show) {
        loanFields.classList.remove('hidden');
        cardGroup.classList.add('hidden');
        loanDateGroup.classList.remove('hidden');

        document.getElementById('monthly_payment').required = true;
        document.getElementById('total_installments').required = true;
        document.getElementById('start_date_input').required = true;
        document.getElementById('due_date_day').required = false;

        // Auto Calc Mode
        const totalInput = document.getElementById('total_amount');
        totalInput.readOnly = true;
        totalInput.placeholder = "Otomatik Hesaplanacak";
        totalInput.style.backgroundColor = "var(--color-bg-body)";
    } else {
        loanFields.classList.add('hidden');
        cardGroup.classList.remove('hidden');
        loanDateGroup.classList.add('hidden');

        document.getElementById('monthly_payment').required = false;
        document.getElementById('total_installments').required = false;
        document.getElementById('start_date_input').required = false;
        document.getElementById('due_date_day').required = true;

        // Manual Mode
        const totalInput = document.getElementById('total_amount');
        totalInput.readOnly = false;
        totalInput.placeholder = "0.00";
        totalInput.style.backgroundColor = "";
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const type = formData.get('type');
    const data = {
        type: type,
        name: formData.get('name'),
        total_amount: parseFloat(formData.get('total_amount'))
    };

    if (type === 'loan') {
        data.monthly_payment = parseFloat(formData.get('monthly_payment'));
        data.total_installments = parseInt(formData.get('total_installments'));
        data.remaining_installments = data.total_installments;

        // Handle Start Date
        const startDateVal = formData.get('start_date_input');
        if (startDateVal) {
            data.start_date = new Date(startDateVal).toISOString();
            data.due_date_day = new Date(startDateVal).getDate();
        } else {
            data.start_date = new Date().toISOString();
            data.due_date_day = 1;
        }

    } else {
        // Credit Card
        data.due_date_day = parseInt(formData.get('due_date_day'));
        data.start_date = new Date().toISOString();
    }

    try {
        let res;
        if (editingId) {
            // Update
            res = await fetch(`/api/debts/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create
            res = await fetch('/api/debts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            closeModal();
            loadDebts();
            Toast.show(editingId ? 'Güncellendi!' : 'Borç Kaydedildi!', 'success');
        } else {
            Toast.show('Hata oluştu', 'error');
        }
    } catch (err) {
        Toast.show('Sunucu hatası', 'error');
        console.error(err);
    }
}
