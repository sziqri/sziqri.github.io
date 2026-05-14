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

    // --- 4. BLOG MODAL (POPUP) LOGIC ---
    const articleModal = document.getElementById('articleModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalBox = document.getElementById('modalBox');
    
    const modalDate = document.getElementById('modalDate');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const readButtons = document.querySelectorAll('.read-post-btn');

    if (articleModal && readButtons.length > 0) {
        readButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const article = e.target.closest('article');
                const title = article.querySelector('.post-title').innerText;
                const date = article.querySelector('.post-date').innerText;
                const fullTextHTML = article.querySelector('.full-content').innerHTML;

                modalTitle.innerText = title;
                modalDate.innerText = date;
                modalBody.innerHTML = fullTextHTML;

                articleModal.classList.remove('hidden');
                setTimeout(() => {
                    articleModal.classList.remove('opacity-0');
                    modalBox.classList.remove('scale-95');
                }, 10);
                
                document.body.style.overflow = 'hidden';
            });
        });

        const closeModal = () => {
            articleModal.classList.add('opacity-0');
            modalBox.classList.add('scale-95');
            setTimeout(() => {
                articleModal.classList.add('hidden');
                document.body.style.overflow = 'auto'; 
            }, 300);
        };

        closeModalBtn.addEventListener('click', closeModal);
        articleModal.addEventListener('click', (e) => {
            if (e.target === articleModal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !articleModal.classList.contains('hidden')) closeModal();
        });
    }
});
