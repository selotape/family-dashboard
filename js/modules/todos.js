// Todo Loader Module
// Loads and renders markdown tasks from tasks.md
(function() {
    'use strict';

    window.TodoLoader = {
        load: async function() {
            const container = document.getElementById('todos-content');
            const lastUpdated = document.getElementById('last-updated');

            try {
                // Add cache-busting to always get fresh content
                const response = await fetch('tasks.md?t=' + Date.now());
                if (!response.ok) throw new Error('Failed to load tasks');

                const markdown = await response.text();
                container.innerHTML = '<div class="markdown-content">' + marked.parse(markdown) + '</div>';
                lastUpdated.textContent = 'Loaded: ' + new Date().toLocaleString();
            } catch (err) {
                container.innerHTML = '<div class="error">❌ Could not load tasks: ' + err.message + '</div>';
            }
        }
    };
})();
