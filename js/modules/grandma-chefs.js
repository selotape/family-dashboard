// Grandma's Little Chefs
// A recipe book the family writes into. Each recipe is its own collapsible
// card with two checklists — "What we need" and "What we do" — so the girls
// can tick off ingredients and steps while cooking with Grandma.
//
// Backed by the Flask server (server.py, /api/chefs/state) so recipes and
// their ticked boxes are shared across every device on the LAN, not stored
// per-browser. Same pattern as Lister and Disney Watch Odyssey.
(function() {
    'use strict';

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function linesToList(value) {
        return String(value || '')
            .split('\n')
            .map(function(s) { return s.trim(); })
            .filter(function(s) { return s.length; });
    }

    window.GrandmaChefs = {
        recipes: null,
        _openIds: {},      // recipe id -> card left expanded across re-renders
        _editingId: null,  // recipe id currently showing its edit form
        _addOpen: false,   // "Add a recipe" form left open across re-renders
        _saving: false,    // a POST /state is in flight
        _saveQueued: false, // another save was requested while one was in flight

        init: function() { this.load(); },

        // ---- Backend calls (XHR + Promise, same pattern as Lister) ----
        _request: function(method, path, body) {
            const url = window.location.origin + '/api/chefs' + path;
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
                        if (xhr.status >= 200 && xhr.status < 300) resolve(response);
                        else reject(new Error(response.error || ('Server error: ' + xhr.status)));
                    } catch (e) {
                        reject(new Error('Invalid response from server'));
                    }
                };
                xhr.onerror = function() {
                    clearTimeout(timeoutId);
                    reject(new Error('Network error — is the server running?'));
                };
                xhr.onabort = function() { clearTimeout(timeoutId); };
                xhr.send(body ? JSON.stringify(body) : undefined);
            });
        },
        apiGet: function(path) { return this._request('GET', path); },
        apiPost: function(path, body) { return this._request('POST', path, body); },

        // ---- Loading / saving ----
        load: function() {
            const self = this;
            this.renderLoading();
            this.apiGet('/state').then(function(res) {
                if (!res.success) throw new Error(res.error || 'Failed to load');
                self.recipes = res.recipes || [];
                self.render();
            }).catch(function(err) {
                self.renderError(err.message);
            });
        },

        // Serialise saves: at most one POST in flight, and always flush the
        // latest state once it returns. We never copy the response back over
        // this.recipes — a fast second tick could have moved on already, and
        // the client is the source of truth for the session.
        persist: function() {
            const self = this;
            if (this._saving) { this._saveQueued = true; return; }
            this._saving = true;
            this._saveQueued = false;
            this.apiPost('/state', { recipes: this.recipes }).then(function(res) {
                if (res && res.success === false) throw new Error(res.error || 'Save failed');
            }).catch(function(err) {
                self.setStatus('⚠️ Could not save: ' + err.message, true);
            }).then(function() {
                self._saving = false;
                if (self._saveQueued) self.persist();
            });
        },

        _find: function(id) {
            return this.recipes.filter(function(r) { return r.id === id; })[0];
        },

        _clampChecks: function(map, n) {
            const out = {};
            Object.keys(map || {}).forEach(function(k) {
                const i = parseInt(k, 10);
                if (i >= 0 && i < n && map[k]) out[String(i)] = true;
            });
            return out;
        },

        // ---- Mutations ----
        addRecipe: function(data) {
            const id = 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            this.recipes.push({
                id: id,
                title: data.title || 'Untitled recipe',
                emoji: data.emoji || '🍳',
                blurb: data.blurb || '',
                ingredients: data.ingredients,
                steps: data.steps,
                tips: data.tips,
                checks: { ingredients: {}, steps: {} },
                createdAt: Date.now()
            });
            this._openIds[id] = true;
            this._addOpen = false;
            this.render();
            this.persist();
            this.setStatus('✅ Added “' + this.recipes[this.recipes.length - 1].title + '”.', false);
        },

        updateRecipe: function(id, data) {
            const r = this._find(id);
            if (!r) return;
            r.title = data.title || 'Untitled recipe';
            r.emoji = data.emoji || '🍳';
            r.blurb = data.blurb || '';
            r.ingredients = data.ingredients;
            r.steps = data.steps;
            r.tips = data.tips;
            r.checks = {
                ingredients: this._clampChecks(r.checks && r.checks.ingredients, r.ingredients.length),
                steps: this._clampChecks(r.checks && r.checks.steps, r.steps.length)
            };
            this._editingId = null;
            this._openIds[id] = true;
            this.render();
            this.persist();
        },

        deleteRecipe: function(id) {
            const r = this._find(id);
            if (!r) return;
            if (!window.confirm('Delete “' + r.title + '” for good?')) return;
            this.recipes = this.recipes.filter(function(x) { return x.id !== id; });
            delete this._openIds[id];
            if (this._editingId === id) this._editingId = null;
            this.render();
            this.persist();
        },

        resetChecks: function(id) {
            const r = this._find(id);
            if (!r) return;
            r.checks = { ingredients: {}, steps: {} };
            this._openIds[id] = true;
            this.render();
            this.persist();
        },

        // Tick / untick one line. Targeted DOM update — no full re-render, so
        // other open cards and the add form keep their state.
        toggleCheck: function(id, kind, idx, on) {
            const r = this._find(id);
            if (!r) return;
            if (!r.checks) r.checks = { ingredients: {}, steps: {} };
            if (!r.checks[kind]) r.checks[kind] = {};
            if (on) r.checks[kind][idx] = true;
            else delete r.checks[kind][idx];

            const card = document.getElementById('recipe-' + id);
            if (card) {
                const row = card.querySelector('.chef-check-row[data-kind="' + kind + '"][data-idx="' + idx + '"]');
                if (row) row.classList.toggle('done', !!on);
                this._updateCounts(card, r);
            }
            this.persist();
        },

        _countDone: function(map, total) {
            let n = 0;
            for (let i = 0; i < total; i++) if (map && map[String(i)]) n++;
            return n;
        },

        _updateCounts: function(card, r) {
            const stepsDone = this._countDone(r.checks.steps, r.steps.length);
            const ing = card.querySelector('.chef-count-ingredients');
            const stp = card.querySelector('.chef-count-steps');
            const prog = card.querySelector('.chef-recipe-progress');
            if (ing) ing.textContent = this._countDone(r.checks.ingredients, r.ingredients.length) + '/' + r.ingredients.length;
            if (stp) stp.textContent = stepsDone + '/' + r.steps.length;
            if (prog) prog.textContent = stepsDone + '/' + r.steps.length + ' steps';
            card.classList.toggle('all-done', r.steps.length > 0 && stepsDone === r.steps.length);
        },

        // ---- Rendering ----
        buildChecklist: function(recipe, kind, heading) {
            const items = recipe[kind] || [];
            const wrap = el('div', 'chef-checklist');

            const h = el('h3', 'chef-recipe-heading');
            h.appendChild(document.createTextNode(heading + ' '));
            const count = el('span', 'chef-count chef-count-' + kind);
            count.textContent = this._countDone(recipe.checks && recipe.checks[kind], items.length) + '/' + items.length;
            h.appendChild(count);
            wrap.appendChild(h);

            const self = this;
            items.forEach(function(text, idx) {
                const on = !!(recipe.checks && recipe.checks[kind] && recipe.checks[kind][String(idx)]);
                const row = el('label', 'chef-check-row' + (on ? ' done' : ''));
                row.setAttribute('data-kind', kind);
                row.setAttribute('data-idx', String(idx));

                const box = document.createElement('input');
                box.type = 'checkbox';
                box.checked = on;
                box.addEventListener('change', function() {
                    self.toggleCheck(recipe.id, kind, idx, box.checked);
                });
                row.appendChild(box);
                row.appendChild(el('span', 'chef-check-box'));

                if (kind === 'steps') row.appendChild(el('span', 'chef-check-num', (idx + 1) + '.'));
                row.appendChild(el('span', 'chef-check-text', text));
                wrap.appendChild(row);
            });
            return wrap;
        },

        buildCard: function(recipe) {
            if (this._editingId === recipe.id) return this.buildEditCard(recipe);

            const card = el('details', 'chef-recipe');
            card.id = 'recipe-' + recipe.id;
            if (this._openIds[recipe.id]) card.open = true;

            const stepsDone = this._countDone(recipe.checks && recipe.checks.steps, recipe.steps.length);
            if (recipe.steps.length > 0 && stepsDone === recipe.steps.length) card.classList.add('all-done');

            card.addEventListener('toggle', function() {
                if (card.open) window.GrandmaChefs._openIds[recipe.id] = true;
                else delete window.GrandmaChefs._openIds[recipe.id];
            });

            const summary = el('summary', 'chef-recipe-summary');
            summary.appendChild(el('span', 'chef-recipe-emoji', recipe.emoji || '🍳'));
            summary.appendChild(el('span', 'chef-recipe-name', recipe.title));
            if (recipe.steps.length) {
                summary.appendChild(el('span', 'chef-recipe-progress', stepsDone + '/' + recipe.steps.length + ' steps'));
            }
            card.appendChild(summary);

            const body = el('div', 'chef-recipe-body');
            if (recipe.blurb) body.appendChild(el('p', 'chef-recipe-blurb', recipe.blurb));

            if (recipe.ingredients.length) body.appendChild(this.buildChecklist(recipe, 'ingredients', '🛒 What we need'));
            if (recipe.steps.length) body.appendChild(this.buildChecklist(recipe, 'steps', '👩‍🍳 What we do'));

            if (recipe.tips.length) {
                body.appendChild(el('h3', 'chef-recipe-heading', '💡 Good to know'));
                const ul = el('ul', 'chef-tips');
                recipe.tips.forEach(function(t) { ul.appendChild(el('li', null, t)); });
                body.appendChild(ul);
            }

            const actions = el('div', 'chef-actions');
            const self = this;
            const resetBtn = el('button', 'chef-btn chef-btn-soft', '↺ Uncheck all');
            resetBtn.type = 'button';
            resetBtn.addEventListener('click', function() { self.resetChecks(recipe.id); });
            const editBtn = el('button', 'chef-btn chef-btn-soft', '✏️ Edit');
            editBtn.type = 'button';
            editBtn.addEventListener('click', function() {
                self._editingId = recipe.id;
                self._openIds[recipe.id] = true;
                self.render();
            });
            const delBtn = el('button', 'chef-btn chef-btn-danger', '🗑️ Delete');
            delBtn.type = 'button';
            delBtn.addEventListener('click', function() { self.deleteRecipe(recipe.id); });
            actions.appendChild(resetBtn);
            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            body.appendChild(actions);

            card.appendChild(body);
            return card;
        },

        // Shared markup for the add + edit forms.
        buildRecipeForm: function(opts) {
            const self = this;
            const r = opts.recipe || {};
            const form = el('form', 'chef-form');

            const row1 = el('div', 'chef-form-row');
            const emoji = document.createElement('input');
            emoji.type = 'text';
            emoji.className = 'chef-form-emoji';
            emoji.maxLength = 8;
            emoji.placeholder = '🍪';
            emoji.value = r.emoji || '';
            const title = document.createElement('input');
            title.type = 'text';
            title.className = 'chef-form-title';
            title.required = true;
            title.placeholder = 'Recipe name (e.g. Grandma\'s Cookies)';
            title.value = r.title || '';
            row1.appendChild(emoji);
            row1.appendChild(title);
            form.appendChild(row1);

            const blurb = document.createElement('input');
            blurb.type = 'text';
            blurb.className = 'chef-form-blurb';
            blurb.placeholder = 'One fun sentence about it (optional)';
            blurb.value = r.blurb || '';
            form.appendChild(blurb);

            function textarea(labelText, hint, value) {
                const field = el('label', 'chef-form-field');
                field.appendChild(el('span', 'chef-form-label', labelText));
                field.appendChild(el('span', 'chef-form-hint', hint));
                const ta = document.createElement('textarea');
                ta.rows = 4;
                ta.value = (value || []).join('\n');
                field.appendChild(ta);
                form.appendChild(field);
                return ta;
            }
            const ingTa = textarea('🛒 What we need', 'one ingredient per line', r.ingredients);
            const stepTa = textarea('👩‍🍳 What we do', 'one step per line', r.steps);
            const tipTa = textarea('💡 Good to know', 'one tip per line (optional)', r.tips);

            const btns = el('div', 'chef-form-btns');
            const save = el('button', 'chef-btn chef-btn-primary', opts.submitLabel || 'Save');
            save.type = 'submit';
            btns.appendChild(save);
            if (opts.onCancel) {
                const cancel = el('button', 'chef-btn chef-btn-soft', 'Cancel');
                cancel.type = 'button';
                cancel.addEventListener('click', opts.onCancel);
                btns.appendChild(cancel);
            }
            form.appendChild(btns);

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const data = {
                    title: title.value.trim(),
                    emoji: emoji.value.trim(),
                    blurb: blurb.value.trim(),
                    ingredients: linesToList(ingTa.value),
                    steps: linesToList(stepTa.value),
                    tips: linesToList(tipTa.value)
                };
                if (!data.title) { title.focus(); return; }
                opts.onSubmit(data);
            });
            return form;
        },

        buildEditCard: function(recipe) {
            const self = this;
            const card = el('div', 'chef-recipe chef-recipe-editing');
            card.id = 'recipe-' + recipe.id;
            card.appendChild(el('h3', 'chef-form-title-row', '✏️ Editing “' + recipe.title + '”'));
            card.appendChild(this.buildRecipeForm({
                recipe: recipe,
                submitLabel: '💾 Save changes',
                onSubmit: function(data) { self.updateRecipe(recipe.id, data); },
                onCancel: function() { self._editingId = null; self.render(); }
            }));
            return card;
        },

        renderAddForm: function() {
            const wrap = document.getElementById('chefs-addwrap');
            if (!wrap) return;
            wrap.innerHTML = '';
            const self = this;

            const details = el('details', 'chef-add');
            if (this._addOpen) details.open = true;
            details.addEventListener('toggle', function() { self._addOpen = details.open; });

            const summary = el('summary', 'chef-add-summary', '➕ Add a recipe');
            details.appendChild(summary);

            details.appendChild(this.buildRecipeForm({
                submitLabel: '➕ Add recipe',
                onSubmit: function(data) { self.addRecipe(data); }
            }));
            wrap.appendChild(details);
        },

        renderList: function() {
            const list = document.getElementById('chefs-list');
            if (!list) return;
            list.innerHTML = '';

            if (!this.recipes.length) {
                list.appendChild(el('div', 'chef-empty', 'No recipes yet — add the first one below! 🍳'));
            } else {
                const self = this;
                this.recipes.forEach(function(recipe) { list.appendChild(self.buildCard(recipe)); });
            }

            const count = document.getElementById('chefs-count');
            if (count) {
                count.textContent = this.recipes.length === 1
                    ? '1 recipe' : this.recipes.length + ' recipes';
            }
        },

        setStatus: function(message, isError) {
            const el2 = document.getElementById('chefs-status');
            if (!el2) return;
            el2.textContent = message || '';
            el2.className = 'chefs-status' + (isError ? ' error' : (message ? ' info' : ''));
        },

        setBodyVisible: function(visible) {
            ['chefs-list', 'chefs-addwrap'].forEach(function(id) {
                const node = document.getElementById(id);
                if (node) node.style.display = visible ? '' : 'none';
            });
        },

        renderLoading: function() {
            this.setBodyVisible(false);
            this.setStatus('⏳ Loading the recipe book…', false);
        },

        renderError: function(message) {
            const self = this;
            this.setBodyVisible(false);
            const node = document.getElementById('chefs-status');
            if (!node) return;
            node.className = 'chefs-status error';
            node.innerHTML = '⚠️ ' + message + ' <button type="button" class="chef-btn chef-btn-soft" id="chefs-retry">Retry</button>';
            const retry = document.getElementById('chefs-retry');
            if (retry) retry.addEventListener('click', function() { self.load(); });
        },

        render: function() {
            if (!this.recipes) { this.renderLoading(); return; }
            this.setBodyVisible(true);
            this.setStatus('', false);
            this.renderList();
            this.renderAddForm();
        }
    };
})();
