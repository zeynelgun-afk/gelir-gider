document.addEventListener('DOMContentLoaded', async function () {
    var calendarEl = document.getElementById('calendar');

    // 1. Fetch Data
    let events = [];
    try {
        // Fetch Transactions
        const resT = await fetch('/api/transactions?limit=200');
        const dataT = await resT.json();

        // Fetch Debts for Calendar Projection
        const resD = await fetch('/api/debts');
        const dataD = await resD.json();

        // Process Transactions
        events = dataT.map(item => {
            let color = '#d32f2f'; // Error/Red for expense
            if (item.type === 'income') color = '#2e7d32'; // Success/Green
            if (item.is_recurring) color = '#ed6c02'; // Warning/Orange

            const amountStr = item.amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

            return {
                title: `${item.title} (${amountStr}₺)`,
                start: item.date,
                allDay: true,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                    amount: item.amount,
                    category: item.category,
                    type: item.type
                }
            };
        });

        // Process Loans & Cards
        const today = new Date();
        dataD.forEach(debt => {
            if (debt.type === 'loan') {
                // Use start_date to project ALL installments
                const startDate = new Date(debt.start_date);

                for (let i = 0; i < debt.total_installments; i++) {
                    // Correct logic: Add 'i' months to startDate
                    let eventDate = new Date(startDate);
                    eventDate.setMonth(startDate.getMonth() + i);

                    events.push({
                        title: `${debt.name} (${i + 1}/${debt.total_installments})`,
                        start: eventDate.toISOString().split('T')[0],
                        allDay: true,
                        backgroundColor: '#9c27b0', // Purple for Loans
                        borderColor: '#9c27b0',
                        extendedProps: {
                            amount: debt.monthly_payment,
                            category: 'Kredi Taksiti',
                            type: 'loan_payment'
                        }
                    });
                }
            } else if (debt.type === 'credit_card') {
                // Project next 6 months due dates
                let currentMonth = today.getMonth();
                let currentYear = today.getFullYear();

                for (let i = 0; i < 6; i++) {
                    let targetMonth = currentMonth + i;
                    let yearOffset = Math.floor(targetMonth / 12);
                    let monthIndex = targetMonth % 12;

                    let eventDate = new Date(currentYear + yearOffset, monthIndex, debt.due_date_day);

                    events.push({
                        title: `${debt.name} Ekstre`,
                        start: eventDate.toISOString().split('T')[0],
                        allDay: true,
                        backgroundColor: '#e91e63', // Pink for Cards
                        borderColor: '#e91e63',
                        extendedProps: {
                            amount: debt.total_amount, // Shows CURRENT debt amount each month (approx)
                            category: 'Kredi Kartı',
                            type: 'card_payment'
                        }
                    });
                }
            }
        });

    } catch (e) {
        console.error("Calendar fetch error", e);
    }

    // 2. Init Calendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'tr',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,listWeek'
        },
        buttonText: {
            today: 'Bugün',
            month: 'Ay',
            list: 'Liste'
        },
        events: events,
        eventClick: function (info) {
            showEventDetails(info.event);
        },
        height: 'auto'
    });

    calendar.render();
});

function showEventDetails(event) {
    document.getElementById('event-title').innerText = event.title.split('(')[0].trim(); // Remove amount from title

    const dateStr = event.start.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('event-date').innerText = dateStr;

    const amount = event.extendedProps.amount;
    const type = event.extendedProps.type;
    const color = type === 'income' ? 'var(--color-success)' : 'var(--color-error)';
    const prefix = type === 'income' ? '+' : '-';

    const amountEl = document.getElementById('event-amount');
    amountEl.innerText = `${prefix}₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
    amountEl.style.color = color;

    document.getElementById('event-category').innerText = event.extendedProps.category;

    document.getElementById('event-modal').classList.remove('hidden');
}

function closeEventModal() {
    document.getElementById('event-modal').classList.add('hidden');
}

// Close modal on backdrop click
const backdrop = document.querySelector('.modal-backdrop');
if (backdrop) {
    backdrop.addEventListener('click', closeEventModal);
}
