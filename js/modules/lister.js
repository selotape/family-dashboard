// Lister Module
// Pre-trip packing/prep lists. Backed by the Flask server (server.py) so
// state is shared across every device on the LAN, not per-browser. Supports
// built-in templates, saving the current list as a reusable named list, and
// AI-assisted generation (e.g. "start from the Pool list and add dolls for
// a picnic").
(function() {
    'use strict';

    window.Lister = {
        // Presentation-only metadata for each assignee (server owns the
        // canonical id list; this just maps ids -> display).
        ASSIGNEES: {
            parent: { name: 'Parent', emoji: '👪', color: '#818cf8' },
            noga:   { name: 'Noga',   emoji: '🦫', color: '#f59e0b' },
            dana:   { name: 'Dana',   emoji: '🦊', color: '#fb923c' },
            ella:   { name: 'Ella',   emoji: '🐼', color: '#38bdf8' }
        },
        ASSIGNEE_ORDER: ['parent', 'noga', 'dana', 'ella'],

        state: null, // { activeList, savedLists, templates, assignees }

        init: function() {
            this.loadState();
        },

        // ---- Backend calls (XHR + Promise, same pattern as ReadingGameAPI) ----
        _request: function(method, path, body) {
            const url = window.location.origin + '/api/lister' + path;
            return new Promise(function(resolve, reject) {
                const xhr = new XMLHttpRequest();
                const timeoutId = setTimeout(function() {
                    xhr.abort();
                    reject(new Error('Request timed out'));
                }, 20000);

                xhr.open(method, url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onload = function() {
                    clearTimeout(timeoutId);
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(response);
                        } else {
                            reject(new Error(response.error || ('Server error: ' + xhr.status)));
                        }
                    } catch (e) {
                        reject(new Error('Invalid response from server'));
                    }
                };
                xhr.onerror = function() {
                    clearTimeout(timeoutId);
                    reject(new Error('Network error — is the server running?'));
                };
                xhr.onabort = function() {
                    clearTimeout(timeoutId);
                };

                xhr.send(body ? JSON.stringify(body) : undefined);
            });
        },
        apiGet: function(path) { return this._request('GET', path); },
        apiPost: function(path, body) { return this._request('POST', path, body); },
        apiDelete: function(path) { return this._request('DELETE', path); },

        // ---- Loading ----
        loadState: function() {
            const self = this;
            this.renderLoading();
            this.apiGet('/state').then(function(res) {
                if (!res.success) throw new Error(res.error || 'Failed to load');
                self.state = res;
                self.render();
            }).catch(function(err) {
                self.renderError(err.message);
            });
        },

        // ---- Actions ----
        persistActive: function() {
            const self = this;
            const active = this.state.activeList;
            this.apiPost('/active', { name: active.name, emoji: active.emoji, items: active.items })
                .then(function(res) {
                    if (!res.success) throw new Error(res.error || 'Failed to save');
                    self.state.activeList = res.activeList;
                }).catch(function(err) {
                    self.setStatus('⚠️ Could not save: ' + err.message, true);
                });
        },

        toggleItem: function(id, checked) {
            const item = this.state.activeList.items.filter(function(it) { return it.id === id; })[0];
            if (!item) return;
            item.checked = checked;
            const row = document.querySelector('.lister-item[data-id="' + id + '"]');
            if (row) row.classList.toggle('done', checked);
            this.renderProgress(this.state.activeList);
            this.persistActive();
        },

        addItem: function(label, assignee) {
            label = (label || '').trim();
            if (!label) return;
            this.state.activeList.items.push({
                id: 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
                emoji: '📦',
                label: label,
                assignee: this.ASSIGNEES[assignee] ? assignee : 'parent',
                checked: false
            });
            this.renderList(this.state.activeList);
            this.renderProgress(this.state.activeList);
            this.persistActive();
        },

        removeItem: function(id) {
            this.state.activeList.items = this.state.activeList.items.filter(function(it) { return it.id !== id; });
            this.renderList(this.state.activeList);
            this.renderProgress(this.state.activeList);
            this.persistActive();
        },

        resetChecks: function() {
            this.state.activeList.items.forEach(function(it) { it.checked = false; });
            this.renderList(this.state.activeList);
            this.renderProgress(this.state.activeList);
            this.persistActive();
        },

        newListFromSource: function(sourceType, sourceId) {
            const self = this;
            const label = this.findSourceLabel(sourceType, sourceId);
            if (!window.confirm('Start a fresh "' + label + '" list? This clears current checks and any custom items.')) return;
            this.apiPost('/new', { sourceType: sourceType, sourceId: sourceId }).then(function(res) {
                if (!res.success) throw new Error(res.error || 'Failed to start list');
                self.state.activeList = res.activeList;
                self.render();
            }).catch(function(err) {
                self.setStatus('⚠️ ' + err.message, true);
            });
        },

        findSourceLabel: function(sourceType, sourceId) {
            if (sourceType === 'template') {
                const tpl = this.state.templates.filter(function(t) { return t.id === sourceId; })[0];
                return tpl ? tpl.name : 'list';
            }
            const saved = this.state.savedLists.filter(function(s) { return s.id === sourceId; })[0];
            return saved ? saved.name : 'list';
        },

        saveCurrentAsReusable: function() {
            const self = this;
            if (!this.state.activeList.items.length) {
                window.alert('Add some items first!');
                return;
            }
            let name = window.prompt('Name this reusable list (e.g. "Extended Pool"):', this.state.activeList.name || '');
            if (name === null) return;
            name = name.trim();
            if (!name) return;
            let emoji = window.prompt('Pick one emoji for it:', this.state.activeList.emoji || '📋');
            if (emoji === null) emoji = '📋';
            emoji = emoji.trim() || '📋';

            this.apiPost('/save-as', { name: name, emoji: emoji }).then(function(res) {
                if (!res.success) throw new Error(res.error || 'Failed to save list');
                self.state.savedLists = res.savedLists;
                self.render();
                self.setStatus('💾 Saved "' + name + '" — pick it anytime from the list above.', false);
            }).catch(function(err) {
                self.setStatus('⚠️ ' + err.message, true);
            });
        },

        removeSavedList: function(id) {
            const self = this;
            const saved = this.state.savedLists.filter(function(s) { return s.id === id; })[0];
            if (!window.confirm('Delete saved list "' + (saved ? saved.name : '') + '"? This cannot be undone.')) return;
            this.apiDelete('/saved/' + id).then(function(res) {
                if (!res.success) throw new Error(res.error || 'Failed to delete');
                self.state.savedLists = res.savedLists;
                self.render();
            }).catch(function(err) {
                self.setStatus('⚠️ ' + err.message, true);
            });
        },

        generateWithAI: function(promptText) {
            const self = this;
            promptText = (promptText || '').trim();
            if (!promptText) return;

            const btn = document.getElementById('lister-ai-btn');
            const input = document.getElementById('lister-ai-input');
            if (btn) { btn.disabled = true; btn.textContent = '✨ Thinking…'; }
            this.setStatus('✨ Asking the AI to build your list…', false);

            this.apiPost('/generate', {
                prompt: promptText,
                currentItems: this.state.activeList.items
            }).then(function(res) {
                if (!res.success) throw new Error(res.error || 'Generation failed');
                return self.apiPost('/active', {
                    name: res.list.name,
                    emoji: res.list.emoji,
                    items: res.list.items
                });
            }).then(function(res2) {
                if (!res2.success) throw new Error(res2.error || 'Failed to save generated list');
                self.state.activeList = res2.activeList;
                if (input) input.value = '';
                self.render();
            }).catch(function(err) {
                self.setStatus('⚠️ ' + err.message, true);
            }).then(function() {
                if (btn) { btn.disabled = false; btn.textContent = '✨ Generate'; }
            });
        },

        // ---- Rendering ----
        renderTemplatePicker: function() {
            const el = document.getElementById('lister-templates');
            if (!el) return;
            const active = this.state.activeList;

            let html = '';
            this.state.templates.forEach(function(tpl) {
                const isActive = (active.sourceType === 'template' && active.sourceId === tpl.id) ? ' active' : '';
                html += '<button type="button" class="lister-template-btn' + isActive + '" data-source-type="template" data-source-id="' + tpl.id + '">' +
                    tpl.emoji + ' ' + tpl.name + '</button>';
            });
            this.state.savedLists.forEach(function(saved) {
                const isActive = (active.sourceType === 'saved' && active.sourceId === saved.id) ? ' active' : '';
                html += '<span class="lister-template-chip' + isActive + '">' +
                    '<button type="button" class="lister-template-btn" data-source-type="saved" data-source-id="' + saved.id + '">' +
                        saved.emoji + ' ' + saved.name +
                    '</button>' +
                    '<button type="button" class="lister-template-remove" data-saved-id="' + saved.id + '" title="Delete saved list">✕</button>' +
                '</span>';
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
            if (progressEl) progressEl.textContent = total ? (done + ' / ' + total + ' packed') : '';
            if (fillEl) {
                const pct = total ? Math.round((done / total) * 100) : 0;
                fillEl.style.width = pct + '%';
                fillEl.classList.toggle('complete', total > 0 && done === total);
            }
        },

        setContentVisible: function(visible) {
            ['lister-templates', 'lister-ai-form', 'lister-list', 'lister-add-form', 'lister-actions'].forEach(function(id) {
                const el = document.getElementById(id);
                if (el) el.style.display = visible ? '' : 'none';
            });
        },

        setStatus: function(message, isError) {
            const el = document.getElementById('lister-status');
            if (!el) return;
            el.textContent = message;
            el.className = 'lister-status' + (isError ? ' error' : (message ? ' info' : ''));
        },

        renderLoading: function() {
            this.setContentVisible(false);
            this.setStatus('⏳ Loading your list…', false);
        },

        renderError: function(message) {
            const self = this;
            this.setContentVisible(false);
            const el = document.getElementById('lister-status');
            if (!el) return;
            el.className = 'lister-status error';
            el.innerHTML = '⚠️ ' + message + ' <button type="button" class="lister-retry-btn" id="lister-retry-btn">Retry</button>';
            const retryBtn = document.getElementById('lister-retry-btn');
            if (retryBtn) retryBtn.addEventListener('click', function() { self.loadState(); });
        },

        render: function() {
            if (!this.state) { this.renderLoading(); return; }
            this.setContentVisible(true);
            this.setStatus('', false);
            this.renderTemplatePicker();
            this.renderAssigneeSelect();
            this.renderList(this.state.activeList);
            this.renderProgress(this.state.activeList);
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
                    const removeBtn = e.target.closest && e.target.closest('.lister-template-remove');
                    if (removeBtn) {
                        self.removeSavedList(removeBtn.getAttribute('data-saved-id'));
                        return;
                    }
                    const btn = e.target.closest && e.target.closest('.lister-template-btn');
                    if (!btn) return;
                    self.newListFromSource(btn.getAttribute('data-source-type'), btn.getAttribute('data-source-id'));
                });
            }

            const saveBtn = document.getElementById('lister-save-btn');
            if (saveBtn && !saveBtn.dataset.bound) {
                saveBtn.dataset.bound = '1';
                saveBtn.addEventListener('click', function() { self.saveCurrentAsReusable(); });
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

            const aiForm = document.getElementById('lister-ai-form');
            if (aiForm && !aiForm.dataset.bound) {
                aiForm.dataset.bound = '1';
                aiForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const input = document.getElementById('lister-ai-input');
                    self.generateWithAI(input.value);
                });
            }
        }
    };
})();
