/* Application Logic connected to FastAPI Backend */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    renderWelcomeMessage();
    initModal(); // Initialize Modal Events

    try {
        const [statsData, billsData] = await Promise.all([
            fetch('/api/dashboard').then(res => res.json()),
            fetch('/api/bills').then(res => res.json())
        ]);

        renderStats(statsData);
        renderBills(billsData);
        renderChart(statsData);

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        alert("Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.");
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

function renderWelcomeMessage() {
    // Static for now, could be dynamic user data later
    const dateStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('welcome-title').textContent = `Hoş Geldiniz, Ahmet Bey`;
    document.getElementById('current-date').textContent = `Bugün ${dateStr}. Finansal durumunuz güncel.`;
}

function renderStats(data) {
    const statsContainer = document.getElementById('stats-grid');

    // Construct Stats Array based on API data
    const stats = [
        { label: 'Gelir', value: data.total_income, trend: 5, icon: 'trending_up', type: 'income', trendPositive: true },
        { label: 'Gider', value: data.total_expense, trend: -2, icon: 'trending_down', type: 'expense', trendPositive: false },
        { label: 'Ödemeler', value: 1400.00, trend: 12, icon: 'payments', type: 'warning', trendPositive: true }, // Static for now as per design
        { label: 'Kalan', value: data.total_balance, trend: 8, icon: 'savings', type: 'balance', trendPositive: true }
    ];

    statsContainer.innerHTML = stats.map(stat => {
        let trendColor = stat.trendPositive ? 'color: var(--color-success)' : 'color: var(--color-error)';

        let cardClass = 'stat-card';
        if (stat.type === 'income') cardClass += ' income';
        if (stat.type === 'expense') cardClass += ' expense';
        if (stat.type === 'balance') cardClass += ' balance';

        // Calculate % trend sign
        const sign = stat.trend > 0 ? '+' : '';

        return `
            <div class="${cardClass} card">
                 <div class="stat-header">
                    <div class="icon-box">
                        <span class="material-symbols-outlined">${stat.icon}</span>
                    </div>
                    <span class="trend font-bold" style="${trendColor}">
                        ${sign}${stat.trend}%
                    </span>
                </div>
                <div>
                     <p class="stat-label">${stat.label}</p>
                     <p class="stat-value">${formatCurrency(stat.value)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderBills(bills) {
    const billsContainer = document.getElementById('bills-list');

    if (bills.length === 0) {
        billsContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">
                <span class="material-symbols-outlined" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;">event_available</span>
                <p>Yaklaşan ödeme yok.</p>
            </div>
        `;
        return;
    }

    billsContainer.innerHTML = bills.map(bill => {
        let actionHtml = '';
        if (bill.status === 'unpaid') {
            actionHtml = `
                <button onclick="payBill(${bill.id})" class="btn" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; background-color: var(--color-primary); color: white;">
                    Öde
                </button>
            `;
        } else if (bill.status === 'completed') {
            actionHtml = `<span style="color: var(--color-success); font-weight: bold; font-size: 0.875rem;">Ödendi</span>`;
        } else {
            actionHtml = `<span style="color: var(--color-success); font-weight: bold; font-size: 0.875rem;">Otomatik</span>`;
        }

        return `
            <div class="list-item">
                <div class="item-icon" style="background-color: var(--color-bg-body);">
                    <span class="material-symbols-outlined">${bill.icon}</span>
                </div>
                <div style="flex: 1;">
                    <p class="font-bold text-lg">${bill.title}</p>
                    <p class="text-secondary" style="font-size: 0.9rem;">Son Gün: ${bill.due_date_str}</p>
                </div>
                <div class="text-right flex flex-col items-end gap-1">
                    <p class="font-bold text-xl">${formatCurrency(bill.amount)}</p>
                    ${actionHtml}
                </div>
            </div>
        `;
    }).join('');
}

async function payBill(id) {
    // Simple confirmation could use a better modal, but confirm() is robust
    if (!confirm('Bu faturayı ödendi olarak işaretlemek istiyor musunuz?')) return;

    try {
        const res = await fetch(`/api/transactions/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });

        if (res.ok) {
            Toast.show('Fatura ödendi!', 'success');
            initDashboard(); // Refresh full dashboard to update balance etc if linked
        } else {
            Toast.show('İşlem başarısız.', 'error');
        }
    } catch (e) {
        console.error(e);
        Toast.show('Sunucu hatası.', 'error');
    }
}

function renderChart(data) {
    document.getElementById('chart-total').textContent = formatCurrency(data.total_expense);

    // In a real implementation we would update SVG stroke offsets here using data.chart_data percentages
    // For this MVP, we are keeping the static SVG visual as per the Design System requirement
}

/* Modal Logic */
function initModal() {
    const modal = document.getElementById('expense-modal');
    const openBtn = document.querySelector('.btn-primary'); // "Yeni Gider Ekle" button
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const backdrop = document.querySelector('.modal-backdrop');
    const form = document.getElementById('expense-form');

    // Make sure we select the correct button (Add Expense)
    // In our layout, it's the large primary button in the left column
    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }

    // Close Events
    [closeBtn, cancelBtn, backdrop].forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    // Form Submit
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
        type: 'expense', // Default to expense for this button
        date: new Date().toISOString()
    };

    try {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            // Refresh Dashboard
            initDashboard();
            Toast.show('Harcama başarıyla eklendi!', 'success');
        } else {
            Toast.show('Bir hata oluştu.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        Toast.show('Sunucu hatası.', 'error');
    }
}
