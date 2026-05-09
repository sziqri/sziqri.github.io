document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('galleryContainer');
    const slideLeft = document.getElementById('slideLeft');
    const slideRight = document.getElementById('slideRight');

    // Make sure elements exist before adding event listeners to prevent console errors
    if (gallery && slideLeft && slideRight) {
        slideLeft.addEventListener('click', () => {
            gallery.scrollBy({ left: -500, behavior: 'smooth' });
        });

        slideRight.addEventListener('click', () => {
            gallery.scrollBy({ left: 500, behavior: 'smooth' });
        });
    }
});

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = mobileMenuBtn.querySelector('span');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            
            // Swap icon between hamburger and close
            if (mobileMenu.classList.contains('hidden')) {
                menuIcon.textContent = 'menu';
            } else {
                menuIcon.textContent = 'close';
            }
        });
    }
});
