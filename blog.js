// Blog loader
// Reads the post list from posts/index.json, shows a card for each post,
// and opens the Markdown file in the reading modal when a card is clicked.
// To add a post, see README.md. You don't need to touch this file.

(() => {
    const grid = document.getElementById('postGrid');
    const statusBox = document.getElementById('postStatus');
    const modal = document.getElementById('articleModal');
    const modalBox = document.getElementById('modalBox');
    const modalDate = document.getElementById('modalDate');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('closeModalBtn');

    if (!grid || !modal) return;

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const cache = {};
    let posts = [];
    let lastFocus = null;

    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const formatDate = (iso) => {
        const [y, m, d] = String(iso).split('-').map(Number);
        if (!y || !m || !d) return iso;
        return `${d} ${MONTHS[m - 1]} ${y}`;
    };

    const metaLine = (post) => {
        const parts = [formatDate(post.date)];
        if (post.reading_time) parts.push(`${post.reading_time} min read`);
        return parts.join(' · ');
    };

    // Removes the --- front matter --- block at the top of a Markdown file
    const stripFrontMatter = (text) => text.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '');

    const showStatus = (message) => {
        statusBox.textContent = message;
        statusBox.classList.remove('hidden');
    };

    // ---------- Cards ----------

    const cardHTML = (post) => {
        const tags = Array.isArray(post.tags) ? post.tags : [];
        return `
        <article class="relative glass-panel p-8 rounded-xl flex flex-col group border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors reveal cursor-pointer" data-slug="${esc(post.slug)}">
            <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-500 rounded-tl-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all origin-top-left"></div>
            <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-500 rounded-br-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all origin-bottom-right"></div>
            ${post.cover ? `
            <div class="mb-6 h-44 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src="${esc(post.cover)}" alt="" class="w-full h-full object-cover" loading="lazy">
            </div>` : ''}
            <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-[14px] text-brand-500">schedule</span>
                <span class="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">${esc(metaLine(post))}</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-brand-500 transition-colors leading-tight">${esc(post.title)}</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">${esc(post.summary)}</p>
            ${tags.length ? `
            <div class="flex flex-wrap gap-2 mb-6">
                ${tags.map((t) => `<span class="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">${esc(t)}</span>`).join('')}
            </div>` : ''}
            <button type="button" class="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all mt-auto self-start outline-none" aria-label="Read ${esc(post.title)}">
                Read More <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
        </article>`;
    };

    const renderCards = () => {
        if (!posts.length) {
            showStatus('No posts yet. Check back soon!');
            return;
        }
        grid.innerHTML = posts.map(cardHTML).join('');
        grid.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('active'), 80 * i);
        });
    };

    // ---------- Modal ----------

    const showModal = () => {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalBox.classList.remove('scale-95');
        }, 10);
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };

    const closeModal = () => {
        if (modal.classList.contains('hidden')) return;
        modal.classList.add('opacity-0');
        modalBox.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
        history.replaceState(null, '', location.pathname + location.search);
        if (lastFocus) lastFocus.focus();
    };

    const loadMarkdown = async (post) => {
        if (cache[post.slug]) return cache[post.slug];
        const res = await fetch(`posts/${post.file}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        cache[post.slug] = await res.text();
        return cache[post.slug];
    };

    const openPost = async (slug) => {
        const post = posts.find((p) => p.slug === slug);
        if (!post) return;

        lastFocus = document.activeElement;
        modalTitle.textContent = post.title;
        modalDate.textContent = metaLine(post);
        modalBody.innerHTML = '<p class="font-mono text-sm text-slate-500">Loading...</p>';
        modalBox.scrollTop = 0;
        showModal();
        history.replaceState(null, '', `#${encodeURIComponent(post.slug)}`);

        try {
            const markdown = await loadMarkdown(post);
            let html = window.marked ? marked.parse(stripFrontMatter(markdown)) : `<pre>${esc(markdown)}</pre>`;
            if (window.DOMPurify) html = DOMPurify.sanitize(html);
            modalBody.innerHTML = html;
            modalBody.querySelectorAll('a[href^="http"]').forEach((a) => {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            });
        } catch (err) {
            console.warn('Could not load post:', post.file, err);
            modalBody.innerHTML = '<p>Sorry, this post could not be loaded. Please try again later.</p>';
        }
    };

    // ---------- Events ----------

    grid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-slug]');
        if (card) openPost(card.dataset.slug);
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ---------- Start ----------

    fetch('posts/index.json', { cache: 'no-cache' })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then((data) => {
            posts = (data.posts || [])
                .filter((p) => p && p.slug && p.title && p.file && !p.draft)
                .sort((a, b) => String(b.date).localeCompare(String(a.date)));
            statusBox.classList.add('hidden');
            renderCards();

            // Open a post straight away if the link has #post-name at the end
            const hash = decodeURIComponent(location.hash.slice(1));
            if (hash) openPost(hash);
        })
        .catch((err) => {
            console.warn('Could not load posts/index.json. If you opened blog.html straight from your folder, run a local server first (see README.md).', err);
            showStatus("Couldn't load the posts right now. Please try again later.");
        });
})();
