/* Application Logic connected to FastAPI Backend */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    renderVersion();
});

function renderVersion() {
    if (typeof APP_VERSION !== 'undefined') {
        const versionEl = document.getElementById('app-version-display');
        if (versionEl) {
            versionEl.textContent = `v${APP_VERSION}`;
        }
    }
}

async function initDashboard() {
    renderWelcomeMessage();
    initModal(); // Initialize Modal Events

    try {
        const [statsData, billsData, debtsData] = await Promise.all([
            fetch('/api/dashboard').then(res => res.json()),
            fetch('/api/bills').then(res => res.json()),
            fetch('/api/debts').then(res => res.json())
        ]);

        // Merge Recurring Bills and Debt Installments
        const allUpcoming = mergeBillsAndDebts(billsData, debtsData);

        renderStats(statsData);
        renderBills(allUpcoming);
        renderChart(statsData);

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        // alert("Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.");
        if (typeof Toast !== 'undefined') {
            Toast.show("Veriler yüklenemedi. Backend çalışıyor mu?", 'error');
        }
    }
}

function mergeBillsAndDebts(bills, debts) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 1. Process Debts into "Bill-like" objects
    const debtBills = debts.map(debt => {
        let isDue = false;
        let title = debt.name;
        let amount = 0;
        let dueDateText = `Her ayın ${debt.due_date_day}. günü`;

        if (debt.type === 'loan') {
            title = `${debt.name} (Taksit)`;
            amount = debt.monthly_payment;

            // Check if loan is active
            // Simple check: if we assume logic from debts.js, calculate if remaining > 0
            // For MVP, just show if Total Installments > 0
            if (debt.remaining_installments <= 0) return null;

        } else {
            title = `${debt.name} (Ekstre)`;
            amount = debt.total_amount; // Ideally strictly minimum payment or statement balance
        }

        // Determine status based on date
        // If due day < current day, mark as "Unpaid" (Overdue) or "Upcoming" next month?
        // Simplicity: Always show as "Upcoming" for this month or next.

        let status = 'unpaid';
        if (currentDay > debt.due_date_day) {
            // Past Due for this month
            dueDateText = `Gecikti: ${debt.due_date_day} ${today.toLocaleString('tr-TR', { month: 'long' })}`;
        } else {
            dueDateText = `${debt.due_date_day} ${today.toLocaleString('tr-TR', { month: 'long' })}`;
        }

        return {
            id: `debt-${debt.id}`, // Virtual ID
            title: title,
            amount: amount,
            due_date_str: dueDateText,
            status: status,
            icon: debt.type === 'loan' ? 'real_estate_agent' : 'credit_card',
            isVirtual: true // Flag to disable action button if needed
        };
    }).filter(item => item !== null);

    // 2. Combine and Sort by day (approx)
    return [...bills, ...debtBills];
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

        if (bill.isVirtual) {
            // Link to Debts Page
            actionHtml = `
                <a href="borclar.html" class="btn" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; background-color: var(--color-bg-body); border: 1px solid var(--color-border); color: var(--color-text-primary); text-decoration: none;">
                    Detay
                </a>
             `;
        } else if (bill.status === 'unpaid') {
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

    const labels = Object.keys(data.chart_data);
    const series = Object.values(data.chart_data);

    // Color mapping based on category names matching CSS variables
    // Categories: "Mutfak", "Sağlık", "Ulaşım", "Diğer"
    const colorMap = {
        'Mutfak': '#0d59f2', // var(--color-primary)
        'Sağlık': '#2D7D46', // var(--color-success)
        'Ulaşım': '#ed6c02', // var(--color-warning)
        'Diğer': '#6366f1'
    };

    const colors = labels.map(label => colorMap[label] || '#999999');

    const options = {
        series: series,
        labels: labels,
        chart: {
            type: 'donut',
            height: 350,
            fontFamily: "'Lexend', sans-serif",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        plotOptions: {
            pie: {
                startAngle: -90,
                endAngle: 90,
                offsetY: 10,
                donut: {
                    size: '75%',
                    labels: {
                        show: false // We use our custom center overlay
                    }
                }
            }
        },
        grid: {
            padding: {
                bottom: -80
            }
        },
        colors: colors,
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom',
            fontSize: '14px',
            fontFamily: "'Lexend', sans-serif",
            fontWeight: 500,
            itemMargin: {
                horizontal: 10,
                vertical: 5
            },
            formatter: function (seriesName, opts) {
                return seriesName + " (%" + opts.w.globals.series[opts.seriesIndex] + ")"
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 300
                },
                legend: {
                    position: 'bottom',
                    fontSize: '12px'
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '65%'
                        }
                    }
                }
            }
        }],
        tooltip: {
            y: {
                formatter: function (val) {
                    return "%" + val
                }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector("#expense-chart"), options);
    chart.render();
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
