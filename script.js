document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DARK MODE TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    if (themeToggleBtn && themeIcon) {
        // Check local storage OR system preference on load
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlElement.classList.add('dark');
            themeIcon.textContent = 'light_mode'; // Sun icon
        } else {
            htmlElement.classList.remove('dark');
            themeIcon.textContent = 'dark_mode'; // Moon icon
        }

        // Listen for button click
        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');

            if (htmlElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
                themeIcon.textContent = 'light_mode';
            } else {
                localStorage.setItem('theme', 'light');
                themeIcon.textContent = 'dark_mode';
            }
        });
    }

    // --- 2. MOBILE MENU LOGIC ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        const menuIcon = mobileMenuBtn.querySelector('span');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');

            if (menuIcon) {
                if (mobileMenu.classList.contains('hidden')) {
                    menuIcon.textContent = 'menu';
                } else {
                    menuIcon.textContent = 'close';
                }
            }
        });
    }

    // --- 3. GALLERY SLIDER LOGIC ---
    const gallery = document.getElementById('galleryContainer');
    const slideLeft = document.getElementById('slideLeft');
    const slideRight = document.getElementById('slideRight');

    if (gallery && slideLeft && slideRight) {
        slideLeft.addEventListener('click', () => {
            gallery.scrollBy({ left: -500, behavior: 'smooth' });
        });

        slideRight.addEventListener('click', () => {
            gallery.scrollBy({ left: 500, behavior: 'smooth' });
        });
    }

    // The blog page has its own script now (blog.js), which loads posts from the posts/ folder.
});
