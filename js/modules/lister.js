// Lister Module
// Pre-trip packing/prep lists, built from reusable templates ("Base Pool",
// more to come) and checked off with the family. Each item is assigned to
// a Parent or to one of the girls.
(function() {
    'use strict';

    window.Lister = {
        STORAGE_KEY: 'listerActiveList',

        // Who an item can be assigned to.
        ASSIGNEES: {
            parent: { name: 'Parent', emoji: '👪', color: '#818cf8' },
            noga:   { name: 'Noga',   emoji: '🦫', color: '#f59e0b' },
            dana:   { name: 'Dana',   emoji: '🦊', color: '#fb923c' },
            ella:   { name: 'Ella',   emoji: '🐼', color: '#38bdf8' }
        },
        ASSIGNEE_ORDER: ['parent', 'noga', 'dana', 'ella'],

        // Starter templates. Each item: id, emoji, label, assignee.
        TEMPLATES: {
            'base-pool': {
                id: 'base-pool',
                name: 'Base Pool',
                emoji: '🏊',
                items: [
                    { id: 'sunscreen',      emoji: '🧴', label: 'Sunscreen',        assignee: 'parent' },
                    { id: 'hats',           emoji: '👒', label: 'Sun hats',         assignee: 'parent' },
                    { id: 'snacks',         emoji: '🍎', label: 'Snacks',           assignee: 'parent' },
                    { id: 'water',          emoji: '💧', label: 'Water bottles',    assignee: 'parent' },
                    { id: 'towels',         emoji: '🏖️', label: 'Beach towels',     assignee: 'parent' },
                    { id: 'goggles',        emoji: '🥽', label: 'Goggles',          assignee: 'parent' },
                    { id: 'swimsuit-noga',  emoji: '🩱', label: "Noga's swimsuit",  assignee: 'noga' },
                    { id: 'swimsuit-dana',  emoji: '🩱', label: "Dana's swimsuit",  assignee: 'dana' },
                    { id: 'swimsuit-ella',  emoji: '🩱', label: "Ella's swimsuit",  assignee: 'ella' },
                    { id: 'toys',           emoji: '🧸', label: 'Pool toys',        assignee: 'parent' },
                    { id: 'sunglasses',     emoji: '🕶️', label: 'Sunglasses',       assignee: 'parent' },
                    { id: 'flipflops',      emoji: '🩴', label: 'Flip-flops',       assignee: 'parent' }
                ]
            }
        },
        TEMPLATE_ORDER: ['base-pool'],

        init: function() {
            this.render();
        },

        // ---- Persistence ----
        loadActiveList: function() {
            let list = null;
            try {
                list = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            } catch (e) {
                list = null;
            }
            if (!list || !Array.isArray(list.items)) {
                list = this.buildFromTemplate('base-pool');
                this.saveActiveList(list);
            }
            return list;
        },

        saveActiveList: function(list) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        },

        buildFromTemplate: function(templateId) {
            const tpl = this.TEMPLATES[templateId];
            return {
                templateId: templateId,
                name: tpl.name,
                emoji: tpl.emoji,
                createdAt: Date.now(),
                items: tpl.items.map(function(it) {
                    return { id: it.id, emoji: it.emoji, label: it.label, assignee: it.assignee, checked: false };
                })
            };
        },

        // ---- Actions ----
        newListFromTemplate: function(templateId) {
            const tpl = this.TEMPLATES[templateId];
            if (!tpl) return;
            const ok = window.confirm('Start a fresh "' + tpl.name + '" list? This clears current checks and any custom items.');
            if (!ok) return;
            this.saveActiveList(this.buildFromTemplate(templateId));
            this.render();
        },

        resetChecks: function() {
            const list = this.loadActiveList();
            list.items.forEach(function(it) { it.checked = false; });
            this.saveActiveList(list);
            this.render();
        },

        toggleItem: function(id, checked) {
            const list = this.loadActiveList();
            const item = list.items.filter(function(it) { return it.id === id; })[0];
            if (item) item.checked = checked;
            this.saveActiveList(list);
            this.render();
        },

        addItem: function(label, assignee) {
            label = (label || '').trim();
            if (!label) return;
            const list = this.loadActiveList();
            list.items.push({
                id: 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
                emoji: '📦',
                label: label,
                assignee: this.ASSIGNEES[assignee] ? assignee : 'parent',
                checked: false
            });
            this.saveActiveList(list);
            this.render();
        },

        removeItem: function(id) {
            const list = this.loadActiveList();
            list.items = list.items.filter(function(it) { return it.id !== id; });
            this.saveActiveList(list);
            this.render();
        },

        // ---- Rendering ----
        renderTemplatePicker: function(activeTemplateId) {
            const el = document.getElementById('lister-templates');
            if (!el) return;
            const self = this;
            let html = '';
            this.TEMPLATE_ORDER.forEach(function(id) {
                const tpl = self.TEMPLATES[id];
                const isActive = id === activeTemplateId ? ' active' : '';
                html += '<button type="button" class="lister-template-btn' + isActive + '" data-template="' + id + '">' +
                    tpl.emoji + ' ' + tpl.name + '</button>';
            });
            el.innerHTML = html;
        },

        renderAssigneeSelect: function() {
            const el = document.getElementById('lister-add-assignee');
            if (!el) return;
            const self = this;
            el.innerHTML = this.ASSIGNEE_ORDER.map(function(id) {
                const a = self.ASSIGNEES[id];
                return '<option value="' + id + '">' + a.emoji + ' ' + a.name + '</option>';
            }).join('');
        },

        renderList: function(list) {
            const el = document.getElementById('lister-list');
            if (!el) return;
            const self = this;

            let html = '';
            this.ASSIGNEE_ORDER.forEach(function(assigneeId) {
                const items = list.items.filter(function(it) { return it.assignee === assigneeId; });
                if (!items.length) return;
                const a = self.ASSIGNEES[assigneeId];

                html += '<div class="lister-group" style="--assignee-color:' + a.color + '">' +
                    '<div class="lister-group-header">' +
                        '<span class="lister-group-emoji">' + a.emoji + '</span>' +
                        '<span class="lister-group-name">' + a.name + '</span>' +
                    '</div>' +
                    '<div class="lister-group-items">';

                items.forEach(function(it) {
                    const checkedAttr = it.checked ? ' checked' : '';
                    const doneClass = it.checked ? ' done' : '';
                    html += '<div class="lister-item' + doneClass + '" data-id="' + it.id + '">' +
                        '<label class="lister-check">' +
                            '<input type="checkbox"' + checkedAttr + '>' +
                            '<span class="lister-check-box"></span>' +
                        '</label>' +
                        '<span class="lister-item-emoji">' + it.emoji + '</span>' +
                        '<span class="lister-item-label">' + it.label + '</span>' +
                        '<button type="button" class="lister-item-remove" title="Remove item">✕</button>' +
                    '</div>';
                });

                html += '</div></div>';
            });

            el.innerHTML = html || '<div class="lister-empty">Nothing on the list yet — add something below! ✨</div>';
        },

        renderProgress: function(list) {
            const total = list.items.length;
            const done = list.items.filter(function(it) { return it.checked; }).length;
            const progressEl = document.getElementById('lister-progress');
            const fillEl = document.getElementById('lister-progress-fill');
            const titleEl = document.getElementById('lister-title');

            if (titleEl) titleEl.textContent = '🧳 Lister — ' + list.emoji + ' ' + list.name;
            if (progressEl) {
                progressEl.textContent = total ? (done + ' / ' + total + ' packed') : '';
            }
            if (fillEl) {
                const pct = total ? Math.round((done / total) * 100) : 0;
                fillEl.style.width = pct + '%';
                fillEl.classList.toggle('complete', total > 0 && done === total);
            }
        },

        render: function() {
            const list = this.loadActiveList();
            this.renderTemplatePicker(list.templateId);
            this.renderAssigneeSelect();
            this.renderList(list);
            this.renderProgress(list);
            this.bindEvents();
        },

        bindEvents: function() {
            const self = this;

            const listEl = document.getElementById('lister-list');
            if (listEl && !listEl.dataset.bound) {
                listEl.dataset.bound = '1';
                listEl.addEventListener('change', function(e) {
                    const box = e.target;
                    if (box && box.matches && box.matches('input[type="checkbox"]')) {
                        const row = box.closest('.lister-item');
                        const id = row && row.getAttribute('data-id');
                        if (id) self.toggleItem(id, box.checked);
                    }
                });
                listEl.addEventListener('click', function(e) {
                    const btn = e.target.closest && e.target.closest('.lister-item-remove');
                    if (!btn) return;
                    const row = btn.closest('.lister-item');
                    const id = row && row.getAttribute('data-id');
                    if (id) self.removeItem(id);
                });
            }

            const templatesEl = document.getElementById('lister-templates');
            if (templatesEl && !templatesEl.dataset.bound) {
                templatesEl.dataset.bound = '1';
                templatesEl.addEventListener('click', function(e) {
                    const btn = e.target.closest && e.target.closest('.lister-template-btn');
                    if (!btn) return;
                    self.newListFromTemplate(btn.getAttribute('data-template'));
                });
            }

            const resetBtn = document.getElementById('lister-reset-btn');
            if (resetBtn && !resetBtn.dataset.bound) {
                resetBtn.dataset.bound = '1';
                resetBtn.addEventListener('click', function() { self.resetChecks(); });
            }

            const form = document.getElementById('lister-add-form');
            if (form && !form.dataset.bound) {
                form.dataset.bound = '1';
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const input = document.getElementById('lister-add-input');
                    const select = document.getElementById('lister-add-assignee');
                    self.addItem(input.value, select.value);
                    input.value = '';
                    input.focus();
                });
            }
        }
    };
})();
