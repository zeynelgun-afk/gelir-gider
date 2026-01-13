/* 
 * Mock Data for Senior Friendly Finance
 * Contains: User Info, Stats, Bills, Expenditure Data
 */

const APP_DATA = {
    user: {
        name: "Ahmet Bey",
        currentDate: new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    },
    stats: [
        {
            id: 'income',
            label: 'Gelir',
            value: 12500.00,
            trend: 5, // %
            icon: 'trending_up',
            type: 'income'
        },
        {
            id: 'expense',
            label: 'Gider',
            value: 8250.00,
            trend: -2, // %
            icon: 'trending_down',
            type: 'expense'
        },
        {
            id: 'payments',
            label: 'Ödemeler',
            value: 1400.00,
            trend: 12, // %
            icon: 'payments',
            type: 'warning'
        },
        {
            id: 'balance',
            label: 'Kalan',
            value: 2850.00,
            trend: 8, // %
            icon: 'savings',
            type: 'balance'
        }
    ],
    bills: [
        {
            id: 1,
            title: "Elektrik Faturası",
            dueDate: "26 Ekim",
            amount: 450.00,
            status: "unpaid",
            icon: "bolt",
            colorClass: "bg-blue-100 text-blue-600" // Tailwind classes mapped to style in JS or CSS
        },
        {
            id: 2,
            title: "Su Faturası",
            dueDate: "28 Ekim",
            amount: 120.00,
            status: "unpaid",
            icon: "water_drop",
            colorClass: "bg-cyan-100 text-cyan-600"
        },
        {
            id: 3,
            title: "İnternet",
            dueDate: "30 Ekim",
            amount: 290.00,
            status: "autopay",
            icon: "router",
            colorClass: "bg-orange-100 text-orange-600"
        }
    ],
    spending: {
        total: 8250.00,
        categories: [
            { label: "Mutfak", percentage: 40, color: "#0d59f2" }, // Primary
            { label: "Sağlık", percentage: 25, color: "#2D7D46" }, // Success
            { label: "Ulaşım", percentage: 20, color: "#ed6c02" }, // Warning
            { label: "Diğer", percentage: 15, color: "#6366f1" }   // Indigo
        ]
    }
};
