// Disney Watch Odyssey
// A beautiful, persistent watch list of Disney / Pixar / Disneytoon animated
// features for three scaredy-cat girls. Catalogue data lives in
// disney-watch-data.js; per-film state (checks, month, order, posters, custom
// films) is persisted server-side via /api/disney/state (shared on the LAN,
// survives restarts). Poster art is fetched live from Wikipedia.
(function () {
    'use strict';

    var DATA = window.DisneyWatchData;

    window.DisneyWatch = {
        films: [],          // merged view models (catalogue + saved state)
        girls: DATA ? DATA.GIRLS : [],
        _saveTimer: null,
        _built: false,
        _dragId: null,

        // ---- backend (XHR + Promise, same shape as Lister) ----
        _request: function (method, body) {
            var url = window.location.origin + '/api/disney/state';
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                var t = setTimeout(function () { xhr.abort(); reject(new Error('Request timed out')); }, 20000);
                xhr.open(method, url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function () {
                    clearTimeout(t);
                    try {
                        var res = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) resolve(res);
                        else reject(new Error(res.error || ('Server error: ' + xhr.status)));
                    } catch (e) { reject(new Error('Invalid response from server')); }
                };
                xhr.onerror = function () { clearTimeout(t); reject(new Error('Network error — is the server running?')); };
                xhr.onabort = function () { clearTimeout(t); };
                xhr.send(body ? JSON.stringify(body) : undefined);
            });
        },

        init: function () {
            if (!DATA) { console.error('DisneyWatchData not loaded'); return; }
            var self = this;
            var grid = document.getElementById('disney-watchlist');
            if (grid && !this._built) {
                grid.innerHTML = '<p class="disney-loading">Loading the odyssey…</p>';
            }
            this._request('GET').then(function (res) {
                if (!res.success) throw new Error(res.error || 'Failed to load');
                self.merge(res.films || []);
                self.render();
                self.bindOnce();
                self.resolvePosters();
            }).catch(function (err) {
                if (grid) grid.innerHTML = '<p class="disney-error">⚠️ ' + self.esc(err.message) + '</p>';
            });
        },

        // Merge saved per-film state onto the built-in catalogue.
        merge: function (savedFilms) {
            var savedById = {};
            savedFilms.forEach(function (s) { savedById[s.id] = s; });

            var list = [];
            DATA.CATALOG.forEach(function (cat, i) {
                var s = savedById[cat.id] || {};
                delete savedById[cat.id];
                list.push({
                    id: cat.id, title: cat.title, year: cat.year, studio: cat.studio,
                    wiki: cat.wiki, tier: cat.tier, note: cat.note, custom: false,
                    catIndex: i, accent: DATA.accentFor(i),
                    watched: {
                        noga: !!(s.watched && s.watched.noga),
                        dana: !!(s.watched && s.watched.dana),
                        ella: !!(s.watched && s.watched.ella)
                    },
                    watchedDate: s.watchedDate || '',
                    poster: s.poster || '',
                    order: (typeof s.order === 'number') ? s.order : i
                });
            });

            // Anything left in savedById is a user-added custom film.
            Object.keys(savedById).forEach(function (id, k) {
                var s = savedById[id];
                if (!s.custom) return;
                list.push({
                    id: id, title: s.title || 'Untitled', year: s.year || null,
                    studio: s.studio || 'Disney', wiki: (s.title || '') + ' (film)',
                    tier: s.tier || 'peril', note: s.note || '', custom: true,
                    catIndex: 9999, accent: DATA.accentFor(id.length + k),
                    watched: {
                        noga: !!(s.watched && s.watched.noga),
                        dana: !!(s.watched && s.watched.dana),
                        ella: !!(s.watched && s.watched.ella)
                    },
                    watchedDate: s.watchedDate || '',
                    poster: s.poster || '',
                    order: (typeof s.order === 'number') ? s.order : 9999 + k
                });
            });

            this.films = list;
        },

        isWatched: function (f) { return !!f.watchedDate; },

        watchlist: function () {
            return this.films.filter(function (f) { return !f.watchedDate; })
                .sort(function (a, b) { return (a.order - b.order) || (a.catIndex - b.catIndex); });
        },
        watched: function () {
            return this.films.filter(function (f) { return !!f.watchedDate; })
                .sort(function (a, b) {
                    if (a.watchedDate !== b.watchedDate) return a.watchedDate < b.watchedDate ? -1 : 1;
                    return a.title.localeCompare(b.title);
                });
        },

        // ---- persistence (debounced) ----
        queueSave: function () {
            var self = this;
            clearTimeout(this._saveTimer);
            this._saveTimer = setTimeout(function () { self.saveNow(); }, 800);
        },
        saveNow: function () {
            var self = this;
            var payload = this.films.map(function (f) {
                var e = {
                    id: f.id, watched: f.watched, watchedDate: f.watchedDate,
                    poster: f.poster || '', order: f.order
                };
                if (f.custom) {
                    e.custom = true; e.title = f.title; e.year = f.year;
                    e.studio = f.studio; e.tier = f.tier; e.note = f.note;
                }
                return e;
            });
            this._request('POST', { films: payload }).catch(function (err) {
                self.setStatus('⚠️ Could not save: ' + err.message, true);
            });
        },

        // ---- actions ----
        toggleGirl: function (id, girl) {
            var f = this.find(id); if (!f) return;
            f.watched[girl] = !f.watched[girl];
            this.render(); this.queueSave();
        },
        markWatched: function (id) {
            var f = this.find(id); if (!f) return;
            var any = f.watched.noga || f.watched.dana || f.watched.ella;
            if (!any) { f.watched = { noga: true, dana: true, ella: true }; }
            f.watchedDate = this.todayMonth();
            this.render(); this.queueSave();
            this.celebrate();
        },
        moveBack: function (id) {
            var f = this.find(id); if (!f) return;
            f.watchedDate = '';
            // drop to bottom of the watchlist
            var max = 0;
            this.films.forEach(function (x) { if (x.order > max) max = x.order; });
            f.order = max + 1;
            this.render(); this.queueSave();
        },
        editDate: function (id) {
            var f = this.find(id); if (!f) return;
            var cur = f.watchedDate || this.todayMonth();
            var next = window.prompt('When did we watch "' + f.title + '"?  (YYYY-MM or YYYY-MM-DD)', cur);
            if (next === null) return;
            next = next.trim();
            if (next && !/^\d{4}-\d{2}(-\d{2})?$/.test(next)) { alert('Please use YYYY-MM or YYYY-MM-DD.'); return; }
            f.watchedDate = next;
            this.render(); this.queueSave();
        },
        reorder: function (id, dir) {
            var wl = this.watchlist();
            var idx = -1;
            for (var i = 0; i < wl.length; i++) { if (wl[i].id === id) { idx = i; break; } }
            var swapWith = idx + dir;
            if (idx < 0 || swapWith < 0 || swapWith >= wl.length) return;
            var a = wl[idx], b = wl[swapWith];
            var tmp = a.order; a.order = b.order; b.order = tmp;
            this.render(); this.queueSave();
        },
        dropReorder: function (draggedId, targetId) {
            if (!draggedId || draggedId === targetId) return;
            var wl = this.watchlist();
            var ids = wl.map(function (f) { return f.id; });
            var from = ids.indexOf(draggedId), to = ids.indexOf(targetId);
            if (from < 0 || to < 0) return;
            ids.splice(to, 0, ids.splice(from, 1)[0]);
            var self = this;
            ids.forEach(function (fid, i) { self.find(fid).order = i; });
            this.render(); this.queueSave();
        },
        addCustom: function (title, year, tier) {
            title = (title || '').trim();
            if (!title) return;
            var id = 'custom-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            var maxOrder = 0;
            this.films.forEach(function (f) { if (f.order > maxOrder) maxOrder = f.order; });
            this.films.push({
                id: id, title: title, year: year || null, studio: 'Disney',
                wiki: title + ' (film)', tier: tier || 'peril', note: '', custom: true,
                catIndex: 9999, accent: DATA.accentFor(id.length),
                watched: { noga: false, dana: false, ella: false },
                watchedDate: '', poster: '', order: maxOrder + 1
            });
            this.render(); this.queueSave();
            this.resolvePosters();
        },
        removeCustom: function (id) {
            var f = this.find(id);
            if (!f || !f.custom) return;
            if (!window.confirm('Remove "' + f.title + '" from the list?')) return;
            this.films = this.films.filter(function (x) { return x.id !== id; });
            this.render(); this.queueSave();
        },

        find: function (id) {
            for (var i = 0; i < this.films.length; i++) { if (this.films[i].id === id) return this.films[i]; }
            return null;
        },

        // ---- rendering ----
        render: function () {
            var wlEl = document.getElementById('disney-watchlist');
            var wdEl = document.getElementById('disney-watched');
            if (!wlEl || !wdEl) return;

            var wl = this.watchlist(), wd = this.watched();
            var self = this;

            wlEl.innerHTML = wl.map(function (f, i) { return self.cardHTML(f, i, wl.length); }).join('') ||
                '<p class="disney-empty">🎉 Every film watched. Add more below!</p>';
            wdEl.innerHTML = wd.map(function (f) { return self.watchedCardHTML(f); }).join('') ||
                '<p class="disney-empty">Nothing crossed off yet — pick a cosy one to start.</p>';

            var total = this.films.length;
            var doneCount = wd.length;
            var pct = total ? Math.round(doneCount / total * 100) : 0;
            var lbl = document.getElementById('disney-progress-label');
            var fill = document.getElementById('disney-progress-fill');
            if (lbl) lbl.textContent = doneCount + ' / ' + total + ' watched together';
            if (fill) fill.style.width = pct + '%';
            var wc = document.getElementById('disney-watched-count');
            if (wc) wc.textContent = doneCount ? (doneCount + ' film' + (doneCount === 1 ? '' : 's')) : '';
        },

        girlChecksHTML: function (f) {
            return '<div class="disney-girls">' + this.girls.map(function (g) {
                var on = f.watched[g.id];
                return '<button class="disney-girl' + (on ? ' on' : '') + '" data-act="girl" data-id="' +
                    f.id + '" data-girl="' + g.id + '" title="' + g.name + (on ? ' watched it' : ' — tap if she watched') +
                    '" aria-pressed="' + on + '"><span class="disney-girl-emoji">' + g.emoji + '</span></button>';
            }).join('') + '</div>';
        },

        posterHTML: function (f) {
            var initials = this.esc(f.title);
            if (f.poster) {
                return '<img class="disney-poster-img" src="' + this.esc(f.poster) + '" alt="' + initials +
                    ' poster" loading="lazy" referrerpolicy="no-referrer" ' +
                    'onerror="this.classList.add(\'failed\');this.removeAttribute(\'src\')">';
            }
            return '';
        },

        cardHTML: function (f, i, n) {
            var t = DATA.TIERS[f.tier] || DATA.TIERS.peril;
            return '' +
            '<article class="disney-card tier-' + f.tier + '" draggable="true" data-id="' + f.id + '" style="--accent:' + f.accent + '">' +
                '<div class="disney-poster" style="--accent:' + f.accent + '">' +
                    '<span class="disney-rank" title="Recommended order">' + (i + 1) + '</span>' +
                    this.posterHTML(f) +
                    '<div class="disney-poster-fallback"><span class="disney-fallback-title">' + this.esc(f.title) + '</span>' +
                        (f.year ? '<span class="disney-fallback-year">' + f.year + '</span>' : '') + '</div>' +
                    '<span class="disney-badge disney-badge-' + f.tier + '">' + t.emoji + ' ' + t.label + '</span>' +
                    (f.custom ? '<button class="disney-remove" data-act="remove" data-id="' + f.id + '" title="Remove">✕</button>' : '') +
                '</div>' +
                '<div class="disney-card-body">' +
                    '<div class="disney-card-title">' + this.esc(f.title) +
                        (f.year ? ' <span class="disney-year">(' + f.year + ')</span>' : '') + '</div>' +
                    '<div class="disney-studio">' + this.esc(f.studio) + '</div>' +
                    (f.note ? '<p class="disney-note">' + this.esc(f.note) + '</p>' : '') +
                    this.girlChecksHTML(f) +
                    '<div class="disney-card-actions">' +
                        '<button class="disney-watched-btn" data-act="mark" data-id="' + f.id + '">' +
                            (f.watched.noga || f.watched.dana || f.watched.ella ? '✓ Watched' : 'All watched!') + '</button>' +
                        '<span class="disney-reorder">' +
                            '<button data-act="up" data-id="' + f.id + '" title="Move up"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
                            '<button data-act="down" data-id="' + f.id + '" title="Move down"' + (i === n - 1 ? ' disabled' : '') + '>▼</button>' +
                        '</span>' +
                    '</div>' +
                '</div>' +
            '</article>';
        },

        watchedCardHTML: function (f) {
            var self = this;
            var who = this.girls.filter(function (g) { return f.watched[g.id]; })
                .map(function (g) { return g.emoji; }).join(' ') || '—';
            return '' +
            '<article class="disney-card disney-card-done" data-id="' + f.id + '" style="--accent:' + f.accent + '">' +
                '<div class="disney-poster" style="--accent:' + f.accent + '">' +
                    this.posterHTML(f) +
                    '<div class="disney-poster-fallback"><span class="disney-fallback-title">' + this.esc(f.title) + '</span></div>' +
                    '<span class="disney-done-check">✓</span>' +
                '</div>' +
                '<div class="disney-card-body">' +
                    '<div class="disney-card-title disney-strike">' + this.esc(f.title) +
                        (f.year ? ' <span class="disney-year">(' + f.year + ')</span>' : '') + '</div>' +
                    '<button class="disney-date" data-act="date" data-id="' + f.id + '" title="Edit date">📅 ' +
                        this.esc(this.fmtDate(f.watchedDate)) + '</button>' +
                    this.girlChecksHTML(f) +
                    '<div class="disney-card-actions">' +
                        '<span class="disney-who">' + who + '</span>' +
                        '<button class="disney-moveback" data-act="back" data-id="' + f.id + '">↩ Back to list</button>' +
                    '</div>' +
                '</div>' +
            '</article>';
        },

        // ---- events (delegated, bound once) ----
        bindOnce: function () {
            if (this._built) return;
            this._built = true;
            var self = this;
            var page = document.getElementById('disney-watch');
            if (!page) return;

            page.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-act]');
                if (!btn) return;
                var id = btn.getAttribute('data-id');
                var act = btn.getAttribute('data-act');
                if (act === 'girl') self.toggleGirl(id, btn.getAttribute('data-girl'));
                else if (act === 'mark') self.markWatched(id);
                else if (act === 'back') self.moveBack(id);
                else if (act === 'date') self.editDate(id);
                else if (act === 'up') self.reorder(id, -1);
                else if (act === 'down') self.reorder(id, 1);
                else if (act === 'remove') self.removeCustom(id);
                else if (act === 'jump-watched') self.jumpTo('.disney-section-watched');
                else if (act === 'jump-top') self.jumpTo('.disney-header');
            });

            var form = document.getElementById('disney-add-form');
            if (form) form.addEventListener('submit', function (e) {
                e.preventDefault();
                var title = document.getElementById('disney-add-title');
                var year = document.getElementById('disney-add-year');
                var tier = document.getElementById('disney-add-tier');
                self.addCustom(title.value, parseInt(year.value, 10) || null, tier.value);
                title.value = ''; year.value = '';
            });

            // drag-and-drop reorder within the watchlist
            var grid = document.getElementById('disney-watchlist');
            if (grid) {
                grid.addEventListener('dragstart', function (e) {
                    var card = e.target.closest('.disney-card');
                    if (!card) return;
                    self._dragId = card.getAttribute('data-id');
                    card.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                grid.addEventListener('dragend', function () {
                    self._dragId = null;
                    grid.querySelectorAll('.dragging,.drop-target').forEach(function (el) {
                        el.classList.remove('dragging', 'drop-target');
                    });
                });
                grid.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    var card = e.target.closest('.disney-card');
                    grid.querySelectorAll('.drop-target').forEach(function (el) { el.classList.remove('drop-target'); });
                    if (card && card.getAttribute('data-id') !== self._dragId) card.classList.add('drop-target');
                });
                grid.addEventListener('drop', function (e) {
                    e.preventDefault();
                    var card = e.target.closest('.disney-card');
                    if (card) self.dropReorder(self._dragId, card.getAttribute('data-id'));
                });
            }
        },

        // ---- poster resolution via Wikipedia (live, cached server-side) ----
        resolvePosters: function () {
            var self = this;
            var pending = this.films.filter(function (f) { return !f.poster; });
            if (!pending.length) return;
            var i = 0, active = 0, dirty = false;

            function done() {
                if (i >= pending.length && active === 0) {
                    if (dirty) self.queueSave();
                    return;
                }
                while (active < 4 && i < pending.length) {
                    var film = pending[i++];
                    active++;
                    self.fetchPoster(film).then(function (r) {
                        if (r && r.film) { r.film.poster = r.url; dirty = true; self.patchPoster(r.film); }
                    }).catch(function () {}).then(function () { active--; done(); });
                }
            }
            done();
        },

        fetchPoster: function (film) {
            var self = this;
            var api = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
            var search = 'https://en.wikipedia.org/w/rest.php/v1/search/title?limit=1&q=';

            function pull(title) {
                // normalise curly apostrophes/quotes — Wikipedia titles use ASCII
                var t = String(title).replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
                return fetch(api + encodeURIComponent(t.replace(/ /g, '_')), { headers: { Accept: 'application/json' } })
                    .then(function (res) { return res.ok ? res.json() : null; });
            }
            function pick(json) {
                if (!json) return null;
                var src = (json.thumbnail && json.thumbnail.source) ||
                          (json.originalimage && json.originalimage.source) || '';
                if (!src) return null;
                src = src.split('?')[0].replace(/\/\d+px-/, '/450px-');
                return src;
            }

            return pull(film.wiki).then(function (json) {
                var url = pick(json);
                if (url) return { film: film, url: url };
                // fallback: search for the real article title, retry once
                return fetch(search + encodeURIComponent((film.title + ' film').replace(/[‘’]/g, "'")))
                    .then(function (r) { return r.ok ? r.json() : null; })
                    .then(function (s) {
                        var key = s && s.pages && s.pages[0] && (s.pages[0].key || s.pages[0].title);
                        if (!key) return null;
                        return pull(key).then(function (j2) {
                            var u2 = pick(j2);
                            return u2 ? { film: film, url: u2 } : null;
                        });
                    });
            });
        },

        // persist a single freshly-resolved poster URL without a full re-render
        patchPoster: function (film) {
            var card = document.querySelector('.disney-card[data-id="' + CSS.escape(film.id) + '"] .disney-poster');
            if (card && !card.querySelector('.disney-poster-img')) {
                var img = new Image();
                img.className = 'disney-poster-img';
                img.alt = film.title + ' poster';
                img.loading = 'lazy';
                img.referrerPolicy = 'no-referrer';
                img.onerror = function () { img.classList.add('failed'); img.removeAttribute('src'); };
                img.src = film.poster;
                card.insertBefore(img, card.firstChild);
            }
        },

        // ---- helpers ----
        celebrate: function () {
            var page = document.getElementById('disney-watch');
            if (!page || !page.classList.contains('active')) return;
            var burst = document.createElement('div');
            burst.className = 'disney-burst';
            burst.textContent = '✨🏰✨';
            page.appendChild(burst);
            setTimeout(function () { burst.remove(); }, 1200);
        },
        jumpTo: function (selector) {
            var el = document.querySelector('#disney-watch ' + selector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        setStatus: function (msg, isErr) {
            var el = document.getElementById('disney-status');
            if (!el) return;
            el.textContent = msg;
            el.className = 'disney-status' + (isErr ? ' err' : '') + (msg ? ' show' : '');
            if (msg) setTimeout(function () { el.className = 'disney-status'; el.textContent = ''; }, 4000);
        },
        todayMonth: function () {
            var d = new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        },
        fmtDate: function (s) {
            if (!s) return 'add date';
            var m = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
            if (!m) return s;
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];
            var out = months[parseInt(m[2], 10) - 1] + ' ' + m[1];
            return m[3] ? (parseInt(m[3], 10) + ' ' + out) : out;
        },
        esc: function (s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }
    };
})();
