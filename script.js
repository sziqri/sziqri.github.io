document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MOBILE MENU LOGIC ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    // Make sure the button and menu actually exist before doing anything
    if (mobileMenuBtn && mobileMenu) {
        const menuIcon = mobileMenuBtn.querySelector('span'); // Safe to check now

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            
            // Swap icon between hamburger and close
            if (menuIcon) {
                if (mobileMenu.classList.contains('hidden')) {
                    menuIcon.textContent = 'menu';
                } else {
                    menuIcon.textContent = 'close';
                }
            }
        });
    }

    // --- 2. GALLERY SLIDER LOGIC ---
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
});
