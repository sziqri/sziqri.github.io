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
        }); // <-- THIS WAS MISSING
    } // <-- AND THIS WAS MISSING

    // --- 3. BLOG MODAL (POPUP) LOGIC ---
    const articleModal = document.getElementById('articleModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalBox = document.getElementById('modalBox');
    
    const modalDate = document.getElementById('modalDate');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const readButtons = document.querySelectorAll('.read-post-btn');

    if (articleModal && readButtons.length > 0) {
        
        // Open Modal when "Read Post" is clicked
        readButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Find the specific article card we clicked inside
                const article = e.target.closest('article');
                
                // Grab the text/HTML from that specific card
                const title = article.querySelector('.post-title').innerText;
                const date = article.querySelector('.post-date').innerText;
                const fullTextHTML = article.querySelector('.full-content').innerHTML;

                // Inject it into the popup window
                modalTitle.innerText = title;
                modalDate.innerText = date;
                modalBody.innerHTML = fullTextHTML;

                // Make the popup visible
                articleModal.classList.remove('hidden');
                
                // Tiny delay to trigger the smooth fade-in animation
                setTimeout(() => {
                    articleModal.classList.remove('opacity-0');
                    modalBox.classList.remove('scale-95');
                }, 10);
                
                // Stop the background page from scrolling
                document.body.style.overflow = 'hidden';
            });
        });

        // Function to smoothly close the modal
        const closeModal = () => {
            articleModal.classList.add('opacity-0');
            modalBox.classList.add('scale-95');
            
            setTimeout(() => {
                articleModal.classList.add('hidden');
                document.body.style.overflow = 'auto'; // Turn background scrolling back on
            }, 300);
        };

        // Close when clicking the 'X' button
        closeModalBtn.addEventListener('click', closeModal);

        // Close when clicking the dark background outside the white box
        articleModal.addEventListener('click', (e) => {
            if (e.target === articleModal) {
                closeModal();
            }
        });

        // Close when pressing the Escape key on the keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !articleModal.classList.contains('hidden')) {
                closeModal();
            }
            
        });
    }
});
