class Toast {
    static init() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    static show(message, type = 'info', duration = 3000) {
        this.init();

        const container = document.querySelector('.toast-container');

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'info';
        if (type === 'success') icon = 'check_circle';
        if (type === 'error') icon = 'error';

        toast.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;

        // Show
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for transition
        }, duration);
    }
}

// Global Loader Helper
const Loader = {
    getHTML: () => `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Yükleniyor...</p>
        </div>
    `,
    getErrorHTML: (msg = 'Veriler yüklenemedi.') => `
        <div class="loading-container">
             <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--color-error);">error_outline</span>
            <p style="color: var(--color-error);">${msg}</p>
        </div>
    `
};
