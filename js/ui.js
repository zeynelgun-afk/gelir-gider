
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const iconSpan = mobileMenuBtn ? mobileMenuBtn.querySelector('span') : null;

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');

            // Toggle Icon (menu <-> close)
            if (navLinks.classList.contains('active')) {
                if (iconSpan) iconSpan.textContent = 'close';
            } else {
                if (iconSpan) iconSpan.textContent = 'menu';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                if (iconSpan) iconSpan.textContent = 'menu';
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (iconSpan) iconSpan.textContent = 'menu';
            });
        });
    }
}
