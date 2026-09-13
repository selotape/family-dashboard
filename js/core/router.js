// Router Module
// Tab navigation with lazy loading and page initialization
(function() {
    'use strict';

    // Every tab: which global module owns it, which method to call on open, and
    // any guard/defer quirk. Adding a tab = one row here + a button in index.html.
    var PAGES = {
        // Update countdown immediately when page loads
        'grandma': { module: 'CountdownTimer', method: 'update' },

        // Game initializes automatically when DOM exists
        'game': { module: 'Game', method: 'init' },

        // Warm-up initializes automatically when DOM exists
        'warmup': { module: 'WarmUp', method: 'init' },

        // Fully client-side; guards its own re-init on repeat visits
        'prek-math': { module: 'PreKMath', method: 'init' },

        // Math game needs to be initialized when page loads
        'math-game': {
            module: 'MathGame', method: 'init', defer: 100,
            skipIf: function(m) { return !!m.canvas; }
        },

        // Reading game initializes when page loads
        'reading-game': {
            module: 'ReadingGame', method: 'init', defer: 100,
            skipIf: function(m) { return !!m.initialized; }
        },

        // Render/refresh the routines timeline immediately on open
        'routines': { module: 'RoutineTimer', method: 'update' },

        // Re-fetch from the server on every visit so changes made
        // from another device on the LAN show up here too.
        'lister': { module: 'Lister', method: 'init' },

        // Builds the slot machine on first open, then just refreshes stats
        'game-roulette': { module: 'GameRoulette', method: 'init' },

        // Same machine, bath-time games
        'bathtub-roulette': { module: 'BathtubRoulette', method: 'init' },

        // Same machine, calm-down-before-sleep activities
        'bedtime-roulette': { module: 'BedtimeRoulette', method: 'init' },

        // Re-fetch watch-list state from the server on every visit
        // so changes from another LAN device show up here too.
        'disney-watch': { module: 'DisneyWatch', method: 'init' },

        // Renders the recipe cards (all data lives in the module)
        'grandma-chefs': { module: 'GrandmaChefs', method: 'init' }
    };

    window.Router = {
        // Load page template dynamically
        loadPageTemplate: async function(pageName) {
            try {
                const response = await fetch(`pages/${pageName}.html`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const html = await response.text();

                // Create page container
                const pageDiv = document.createElement('div');
                pageDiv.id = pageName;
                pageDiv.className = 'page';
                pageDiv.innerHTML = html;

                // Append to content container
                document.querySelector('.content').appendChild(pageDiv);

                return pageDiv;
            } catch (err) {
                console.error(`Error loading page ${pageName}:`, err);
                return null;
            }
        },

        // Initialize page-specific features
        initializePage: function(pageName) {
            var spec = PAGES[pageName];
            if (!spec) return;

            // Mirrors the old switch's `typeof X !== 'undefined'` tolerance:
            // a missing module (or missing method) is silently a no-op.
            var mod = window[spec.module];
            if (!mod || typeof mod[spec.method] !== 'function') return;

            if (spec.skipIf && spec.skipIf(mod)) return;

            if (spec.defer) {
                setTimeout(function() { mod[spec.method](); }, spec.defer);
            } else {
                mod[spec.method]();
            }
        },

        // Tab switching with lazy loading
        switchToTab: async function(pageName) {
            // Check if page exists, load if needed
            let page = document.getElementById(pageName);
            if (!page) {
                page = await this.loadPageTemplate(pageName);
                if (!page) return; // Failed to load
            }

            // Hide all tabs/pages
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

            // Show selected tab/page
            const tab = document.querySelector(`.tab[data-page="${pageName}"]`);
            if (tab && page) {
                tab.classList.add('active');
                page.classList.add('active');
                localStorage.setItem('lastTab', pageName);

                // Initialize page-specific features
                this.initializePage(pageName);
            }
        },

        init: function() {
            // Bind tab click events
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => this.switchToTab(tab.dataset.page));
            });

            // Collapsible tabs banner
            this.setupTabsToggle();

            // Restore last visited tab or load grandma by default
            const lastTab = localStorage.getItem('lastTab') || 'grandma';
            this.switchToTab(lastTab);
        },

        // Show/hide the tabs banner; state persists across refreshes
        setupTabsToggle: function() {
            const nav = document.getElementById('tabs-nav');
            const btn = document.getElementById('tabs-toggle');
            if (!nav || !btn) return;

            const apply = (collapsed) => {
                nav.classList.toggle('collapsed', collapsed);
                btn.setAttribute('aria-expanded', String(!collapsed));
                btn.textContent = collapsed ? 'Menu ☰' : 'Hide menu ▲';
            };

            apply(localStorage.getItem('tabsCollapsed') === '1');

            btn.addEventListener('click', () => {
                const collapsed = !nav.classList.contains('collapsed');
                localStorage.setItem('tabsCollapsed', collapsed ? '1' : '0');
                apply(collapsed);
            });
        }
    };
})();
