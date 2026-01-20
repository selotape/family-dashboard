// Router Module
// Tab navigation with lazy loading and page initialization
(function() {
    'use strict';

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
            switch(pageName) {
                case 'grandma':
                    // Update countdown immediately when page loads
                    if (typeof CountdownTimer !== 'undefined') {
                        CountdownTimer.update();
                    }
                    break;
                case 'todos':
                    if (typeof TodoLoader !== 'undefined') {
                        TodoLoader.load();
                    }
                    break;
                case 'game':
                    // Game initializes automatically when DOM exists
                    if (typeof Game !== 'undefined' && Game.init) {
                        Game.init();
                    }
                    break;
                case 'warmup':
                    // Warm-up initializes automatically when DOM exists
                    if (typeof WarmUp !== 'undefined' && WarmUp.init) {
                        WarmUp.init();
                    }
                    break;
                case 'math-game':
                    // Math game needs to be initialized when page loads
                    if (typeof MathGame !== 'undefined' && MathGame.init && !MathGame.canvas) {
                        setTimeout(() => MathGame.init(), 100);
                    }
                    break;
                case 'reading-game':
                    // Reading game initializes when page loads
                    if (typeof ReadingGame !== 'undefined' && ReadingGame.init && !ReadingGame.initialized) {
                        setTimeout(() => ReadingGame.init(), 100);
                    }
                    break;
                // routines runs in background
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

            // Restore last visited tab or load grandma by default
            const lastTab = localStorage.getItem('lastTab') || 'grandma';
            this.switchToTab(lastTab);
        }
    };
})();
